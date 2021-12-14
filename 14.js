const fs = require("fs");
const assert = require("assert");

const parseData = (filename) => {
  let [template, rulesArray] = fs
    .readFileSync(filename)
    .toString()
    .trim()
    .split("\n\n");

  const rules = {};
  rulesArray.split("\n").forEach((rule) => {
    rule = rule.split(" -> ");
    const tuple = rule[0].split("");
    // A pair actually results in 2 pairs. See the explanation below.
    rules[rule[0]] = [tuple[0] + rule[1], rule[1] + tuple[1]];
  });
  return { template, rules };
};

const getPairCountsFromTemplate = (template) => {
  const pairCounts = {};
  let pair;
  for (let i = 0; i < template.length - 1; i++) {
    pair = template.substr(i, 2);
    pairCounts[pair] = (pairCounts[pair] || 0) + 1;
  }
  return pairCounts;
};

const getHistogram = (template) => {
  const histogram = {};
  for (let i = 0; i < template.length; i++) {
    const element = template[i];
    histogram[element] = (histogram[element] || 0) + 1;
  }
  return histogram;
};

const iterate = ({ template, rules }, count) => {
  // We don't need to store the template. Each iteration acts on pairs,
  // regardless of position. 1 pair goes in, 2 pairs come out. 2 characters go
  // in, 3 come out, only 1 is new. As the answer is only about the character
  // count, only this new character affects the solution.
  let pairCounts = getPairCountsFromTemplate(template);
  const histogram = getHistogram(template);
  while (count > 0) {
    const newPairCount = {};
    const pairs = Object.keys(pairCounts);
    let pair;
    for (let i = 0; i < pairs.length; i++) {
      pair = pairs[i];
      const pairCount = pairCounts[pair];
      const newPairs = rules[pair];
      newPairs.forEach((newPair) => {
        newPairCount[newPair] = (newPairCount[newPair] || 0) + pairCount;
      });
      const offspring = newPairs[0][1];
      histogram[offspring] = (histogram[offspring] || 0) + pairCount;
    }
    pairCounts = newPairCount;
    count--;
  }
  return histogram;
};

const diffMinMax = (histogram) => {
  const ordered = Object.keys(histogram).sort(
    (a, b) => histogram[b] - histogram[a]
  );
  return histogram[ordered.shift()] - histogram[ordered.pop()];
};

const iterateAndDiffMinMax = (data, count) => diffMinMax(iterate(data, count));

const testData = parseData("14.test.dat");

assert.deepEqual(
  iterate(testData, 4),
  getHistogram("NBBNBNBBCCNBCNCCNBBNBBNBBBNBBNBBCBHCBHHNHCBBCBHCB")
);
assert.equal(iterateAndDiffMinMax(testData, 10), 1588);

const data = parseData("14.dat");

console.log("First Answer:", iterateAndDiffMinMax(data, 10));
console.log("Second Answer:", iterateAndDiffMinMax(data, 40));
