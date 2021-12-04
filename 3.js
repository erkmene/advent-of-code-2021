const fs = require("fs");
const assert = require("assert");

const parseData = (filename) =>
  fs
    .readFileSync(filename)
    .toString()
    .trim()
    .split("\n")
    .map((bits) => bits.split("").map((bit) => parseInt(bit)));

const getMostCommonBits = (data) => {
  const histogram = new Array(data[0].length).fill(undefined).map(() => [0, 0]);
  data.forEach((bits) => {
    bits.forEach((bit, bitIndex) => {
      histogram[bitIndex][parseInt(bit)]++;
    });
  });
  return histogram.map((bit) => (bit[0] > bit[1] ? 0 : 1));
};

const flipBits = (bits) => bits.map((bit) => (bit ? 0 : 1));

const getLeastCommonBits = (bits) => flipBits(getMostCommonBits(bits));

const toDecimal = (bits) => parseInt(bits.join(""), 2);

const getPowerConsumption = (data) => {
  const gamma = getMostCommonBits(data);
  const epsilon = flipBits(gamma);
  return toDecimal(gamma) * toDecimal(epsilon);
};

const filterBits = (data, criteria) => {
  let candidates = data.concat();
  const candidateLength = candidates[0].length;
  let currentBit = 0;
  while (currentBit < candidateLength) {
    const test = criteria(candidates);
    candidates = candidates.filter(
      (candidate) => candidate[currentBit] === test[currentBit]
    );
    if (candidates.length === 1) {
      return candidates[0];
    }
    currentBit++;
  }
  return candidates[0];
};

const getLifeSupportRating = (data) => {
  return (
    toDecimal(filterBits(data, getMostCommonBits)) *
    toDecimal(filterBits(data, getLeastCommonBits))
  );
};

const testData = parseData("3.test.dat");
const data = parseData("3.dat");

assert.deepEqual(getMostCommonBits(testData), [1, 0, 1, 1, 0]);
assert.deepEqual(flipBits([1, 0, 1, 1, 0]), [0, 1, 0, 0, 1]);
assert.equal(toDecimal([1, 0, 1, 1, 0]), 22);
assert.equal(getPowerConsumption(testData), 198);

console.log("First answer:", getPowerConsumption(data));

assert.deepEqual(filterBits(testData, getMostCommonBits), [1, 0, 1, 1, 1]);
assert.deepEqual(filterBits(testData, getLeastCommonBits), [0, 1, 0, 1, 0]);
assert.deepEqual(getLifeSupportRating(testData), 230);

console.log("Second answer:", getLifeSupportRating(data));
