const fs = require("fs");
const assert = require("assert");

const parseData = (filename) =>
  fs
    .readFileSync(filename)
    .toString()
    .trim()
    .split("\n")
    .map((bits) => parseInt(bits, 2));

const getMostCommonBits = (data, maxBits = 12) => {
  let histogram = 0;
  for (let i = 0; i < maxBits; i++) {
    let oneCount = 0;
    data.forEach((number) => {
      const bit = (number >> i) % 2;
      if (bit) oneCount++;
    });
    if (oneCount >= data.length / 2) {
      histogram = histogram | (1 << i);
    }
  }
  return histogram;
};

const flipBits = (number, maxBits = 12) => {
  // const flipped = ~number;
  // const unsignedFlipped = flipped >>> 0;
  // const mask = (2 << (maxBits - 1)) - 1;
  // const masked = unsignedFlipped & mask;

  // console.log("----");
  // console.log("flipped", flipped);
  // console.log("unsignedFlipped", unsignedFlipped);
  // console.log("mask", mask);
  // console.log("masked", masked);

  // return masked;

  // >>> unsigned shift
  return (~number >>> 0) & ((2 << (maxBits - 1)) - 1);
};

const getLeastCommonBits = (numbers, maxBits = 12) =>
  flipBits(getMostCommonBits(numbers, maxBits), maxBits);

const getPowerConsumption = (data, maxBits = 12) => {
  const gamma = getMostCommonBits(data, maxBits);
  const epsilon = flipBits(gamma, maxBits);
  return gamma * epsilon;
};

const filterBits = (data, criteria, maxBits = 12) => {
  let candidates = data.concat();
  let currentBit = maxBits;
  while (currentBit > -1) {
    const test = criteria(candidates, maxBits);
    candidates = candidates.filter(
      (candidate) => (candidate >> currentBit) % 2 === (test >> currentBit) % 2
    );
    if (candidates.length === 1) {
      return candidates[0];
    }
    currentBit--;
  }
  return candidates[0];
};

const getLifeSupportRating = (data, maxBits = 12) =>
  filterBits(data, getMostCommonBits, maxBits) *
  filterBits(data, getLeastCommonBits, maxBits);

const testData = parseData("3.test.dat");
const data = parseData("3.dat");

// Test data is 5 bits
assert.deepEqual(getMostCommonBits(testData, 5), 22);
assert.deepEqual(flipBits(parseInt("10110", 2), 5), parseInt("01001", 2));
assert.deepEqual(flipBits(22, 5), 9);
assert.deepEqual(getLeastCommonBits(testData, 5), 9);
assert.equal(getPowerConsumption(testData, 5), 198);

console.time("perf");
console.log("First answer:", getPowerConsumption(data));
console.timeEnd("perf");

assert.equal(filterBits(testData, getMostCommonBits, 5), parseInt("10111", 2));
assert.equal(filterBits(testData, getLeastCommonBits, 5), parseInt("01010", 2));
assert.deepEqual(getLifeSupportRating(testData, 5), 230);

console.time("perf");
console.log("Second answer:", getLifeSupportRating(data));
console.timeEnd("perf");

// I must have done something horribly wrong as bitwise takes significantly more
// than the array implementation, which doesn't make sense to me.

// Also, in both implementations there's something weird going on, which might
// be because of some caching. For the first answer, we calculate the commonBits
// only once and then flip it. For the second answer, we calculate the common
// bits for N, and then do the same while flipping, all the while using function
// references. But still, for both implementations it takes about a quarter of
// time.
