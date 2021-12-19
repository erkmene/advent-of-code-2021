const fs = require("fs");
const assert = require("assert");

// I later had to switch from a simple string to an array of chars in order to
// account for numbers more than 36 to fit in a single char. The following are
// helpers to use in my conversion.
const a = (str) => {
  if (Array.isArray(str)) {
    return str;
  }
  return str.split("").map((c) => (c == parseInt(c) ? parseInt(c) : c));
};
const aToStr = (arr) => arr.reduce((acc, cur) => acc + cur, "");

const parseData = (filename) =>
  fs
    .readFileSync(filename)
    .toString()
    .trim()
    .split("\n")
    .map((line) => a(line));

// Simple replacement ([1,2,3], 1, 4) => [1,4,3] or
// iterable replacement ([1,2,3], 1, [4, 5]) => [1,4,5,3]
const replaceCharAt = (arr, index, replacement) => {
  if (Array.isArray(replacement)) {
    return [...arr.slice(0, index), ...replacement, ...arr.slice(index + 1)];
  } else {
    return [...arr.slice(0, index), replacement, ...arr.slice(index + 1)];
  }
};

// Brackets don't matter for reduction. These two will help in locating the
// nearest numbers on the left or right.
const findFirstLeftNumber = (arr, fromPos) => {
  let pos = fromPos - 1;
  while (pos >= 0) {
    if (Number.isInteger(arr[pos])) {
      return [pos, arr[pos]];
    }
    pos--;
  }
  return [-1, -1];
};

const findFirstRightNumber = (arr, fromPos) => {
  let pos = fromPos + 1;
  while (pos < arr.length) {
    if (Number.isInteger(arr[pos])) {
      return [pos, arr[pos]];
    }
    pos++;
  }
  return [-1, -1];
};

const OP_TYPES = {
  explode: "explode",
  split: "split",
};

// Reduces the snailfish number, if type is explode, only deep pairs are
// processed, if it it split, only regular numbers > 10 are processed. This
// would be much prettier if whatever came leftmost would be processed first. :/
const reduce = (arr, type) => {
  if (!Array.isArray(arr)) {
    arr = a(arr);
  }
  // Create a copy of this string, we will be doing our operations on this copy.
  let output = arr.concat();
  // Create a cursor to track out progress.
  let cursor = 0;
  // Tracks how many pairs surround the current pair.
  let depth = 0;
  // Tracks which number we're dealing with inside the pair.
  let pairPos = 0;

  // Only 1 operation is permitted per reduction. We'll use this to stop
  // execution.
  let end = false;

  while (cursor < arr.length && !end) {
    let char = arr[cursor];
    switch (char) {
      case "[":
        // We got inside a new pair. Next number will be the first one inside
        // that pair.
        pairPos = 0;
        depth++;
        break;
      case "]":
        // We got out of the last pair.
        depth--;
      case ",":
        // This is the second number inside a pair.
        pairPos = 1;
        break;
      default:
        if (type === OP_TYPES.explode && depth > 4) {
          // We're inside a pair that's surrounded by 4 pairs.
          // Based on which number inside the pair we're dealing with, it will
          // either move to left or right. locator will find that number for us,
          // along with its position.
          const locator =
            pairPos === 0 ? findFirstLeftNumber : findFirstRightNumber;
          const [pos, val] = locator(arr, cursor);
          char = parseInt(char);
          // There might not be a number on the left or right...
          if (pos > 0) {
            // But if there is, we'll add the exploding number to it.
            output = replaceCharAt(output, pos, char + val);
          }
          // No matter whether we found a target number, this number will become
          // 0.
          output = replaceCharAt(output, cursor, 0);
          if (pairPos) {
            // We've processed the second number in the pair. Remove the
            // remaining [0,0] and replace it by 0.
            output = [
              ...output.slice(0, cursor - 3),
              0,
              ...output.slice(cursor + 2),
            ];
            // End reduction.
            end = true;
          }
        } else if (type === OP_TYPES.split && char > 9) {
          // We've found a splitting number.
          const pair = [
            "[",
            Math.floor(char / 2),
            ",",
            Math.ceil(char / 2),
            "]",
          ];
          output = replaceCharAt(output, cursor, pair);
          // End reduction.
          end = true;
        }
        break;
    }
    cursor++;
  }
  return output;
};

// Simple enclosing concatenation. combine(l,r) => [l,r]
const combine = (l, r) => ["[", ...a(l), ",", ...a(r), "]"];

// Reduce until further reductions yield the same result.
const reduceUntilDone = (arr, type) => {
  let prev;
  while (!prev || prev.toString() != arr.toString()) {
    prev = arr;
    arr = reduce(arr, type);
  }
  return arr;
};

const magnitude = (arr) => {
  const indexCoefficients = [3, 2];
  return arr.reduce((acc, cur, index) => {
    if (Array.isArray(cur)) {
      cur = magnitude(cur);
    }
    return acc + cur * indexCoefficients[index];
  }, 0);
};

// Hopefully...
const addLines = (data) => {
  let line = 1;
  let current = data[0];
  while (line < data.length) {
    // I later realized that we can only split if and only if we've exploded all
    // possible pairs. That means that after each split we need to explode
    // again. To terminate, we need to confirm that all operations yield the
    // same result. This has become highly inefficient in effect. :/
    current = combine(current, data[line]);
    let prev;
    while (!prev || prev.toString() !== current.toString()) {
      prev = current;
      current = reduceUntilDone(current, OP_TYPES.explode);
      current = reduce(current, OP_TYPES.split);
    }
    line++;
  }
  return current;
};

const doHomework = (data) => {
  const sum = addLines(data);
  return magnitude(JSON.parse(sum.join("")));
};

const getMaxPairSum = (data) => {
  let max = -Infinity;
  for (let i = 0; i < data.length; i++) {
    for (let j = 0; j < data.length; j++) {
      if (i !== j) {
        max = Math.max(max, doHomework([data[i], data[j]]));
      }
    }
  }
  return max;
};

// ----------------------------------------------------------------------------
// TESTS
// ----------------------------------------------------------------------------

// Utils
assert.deepEqual(replaceCharAt([1, 2, 3], 1, 4), [1, 4, 3]);
assert.deepEqual(replaceCharAt([1, 2, 3], 1, [4, 5]), [1, 4, 5, 3]);
assert.deepEqual(findFirstLeftNumber(a("[1,2,[3,4]]"), 6), [3, 2]);
assert.deepEqual(findFirstRightNumber(a("[1,2,[3,4]]"), 3), [6, 3]);

// Explode
assert.deepEqual(
  reduce("[[[[[9,8],1],2],3],4]", OP_TYPES.explode),
  a("[[[[0,9],2],3],4]")
);
assert.deepEqual(
  reduce("[7,[6,[5,[4,[3,2]]]]]", OP_TYPES.explode),
  a("[7,[6,[5,[7,0]]]]")
);
assert.deepEqual(
  reduce("[[6,[5,[4,[3,2]]]],1]", OP_TYPES.explode),
  a("[[6,[5,[7,0]]],3]")
);
assert.deepEqual(
  reduce("[[3,[2,[1,[7,3]]]],[6,[5,[4,[3,2]]]]]", OP_TYPES.explode),
  a("[[3,[2,[8,0]]],[9,[5,[4,[3,2]]]]]")
);
assert.deepEqual(
  reduce("[[3,[2,[8,0]]],[9,[5,[4,[3,2]]]]]", OP_TYPES.explode),
  a("[[3,[2,[8,0]]],[9,[5,[7,0]]]]")
);

// Split
assert.deepEqual(reduce([10], OP_TYPES.split), a("[5,5]"));
assert.deepEqual(reduce([11], OP_TYPES.split), a("[5,6]"));
assert.deepEqual(reduce([12], OP_TYPES.split), a("[6,6]"));
assert.deepEqual(
  reduce(["[", 1, ",", 11, "]"], OP_TYPES.split),
  a("[1,[5,6]]")
);

// Combine
assert.deepEqual(
  combine(a("[[[[4,3],4],4],[7,[[8,4],9]]]"), a("[1,1]")),
  a("[[[[[4,3],4],4],[7,[[8,4],9]]],[1,1]]")
);
assert.deepEqual(
  combine(a("[[[[4,3],4],4],[7,[[8,4],9]]]"), a("[1,1]")),
  a("[[[[[4,3],4],4],[7,[[8,4],9]]],[1,1]]")
);

// Homework
assert.deepEqual(
  addLines(["[[[[4,3],4],4],[7,[[8,4],9]]]", "[1,1]"]),
  a("[[[[0,7],4],[[7,8],[6,0]]],[8,1]]")
);
assert.deepEqual(
  addLines(["[1,1]", "[2,2]", "[3,3]", "[4,4]"]),
  a("[[[[1,1],[2,2]],[3,3]],[4,4]]")
);
assert.deepEqual(
  addLines(["[1,1]", "[2,2]", "[3,3]", "[4,4]", "[5,5]"]),
  a("[[[[3,0],[5,3]],[4,4]],[5,5]]")
);
assert.deepEqual(
  addLines(["[1,1]", "[2,2]", "[3,3]", "[4,4]", "[5,5]", "[6,6]"]),
  a("[[[[5,0],[7,4]],[5,5]],[6,6]]")
);

assert.deepEqual(
  addLines([
    "[[[0,[4,5]],[0,0]],[[[4,5],[2,6]],[9,5]]]",
    "[7,[[[3,7],[4,3]],[[6,3],[8,8]]]]",
  ]),
  a("[[[[4,0],[5,4]],[[7,7],[6,0]]],[[8,[7,7]],[[7,9],[5,0]]]]")
);

assert.deepEqual(
  addLines([
    "[[[[4,0],[5,4]],[[7,7],[6,0]]],[[8,[7,7]],[[7,9],[5,0]]]]",
    "[[2,[[0,8],[3,4]]],[[[6,7],1],[7,[1,6]]]]",
  ]),
  a("[[[[6,7],[6,7]],[[7,7],[0,7]]],[[[8,7],[7,7]],[[8,8],[8,0]]]]")
);

assert.deepEqual(
  addLines([
    "[[[[7,0],[7,7]],[[7,7],[7,8]]],[[[7,7],[8,8]],[[7,7],[8,7]]]]",
    "[7,[5,[[3,8],[1,4]]]]",
  ]),
  a("[[[[7,7],[7,8]],[[9,5],[8,7]]],[[[6,8],[0,8]],[[9,9],[9,0]]]]")
);

// Magnitude

assert.equal(magnitude([9, 1]), 3 * 9 + 2 * 1);
assert.equal(magnitude([1, 9]), 3 * 1 + 2 * 9);
assert.equal(
  magnitude([
    [9, 1],
    [1, 9],
  ]),
  3 * 29 + 2 * 21
);
assert.equal(
  magnitude([
    [1, 2],
    [[3, 4], 5],
  ]),
  143
);

// Large Tests

const testData = parseData("18.test.dat");
assert.deepEqual(
  addLines(testData),
  a("[[[[8,7],[7,7]],[[8,6],[7,7]]],[[[0,7],[6,6]],[8,7]]]")
);

const testData2 = parseData("18.test2.dat");
assert.deepEqual(
  addLines(testData2),
  a("[[[[6,6],[7,6]],[[7,7],[7,0]]],[[[7,7],[7,7]],[[7,8],[9,9]]]]")
);

assert.equal(getMaxPairSum(testData2), 3993);

// ----------------------------------------------------------------------------
// ANSWERS
// ----------------------------------------------------------------------------

const data = parseData("18.dat");
console.log("First Answer:", doHomework(data));
console.log("Second Answer:", getMaxPairSum(data));
