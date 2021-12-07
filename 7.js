const fs = require("fs");
const assert = require("assert");

const parseData = (filename) =>
  fs
    .readFileSync(filename)
    .toString()
    .trim()
    .split(",")
    .map((n) => parseInt(n));

const getMean = (numbers) => {
  const sorted = numbers.concat().sort((a, b) => a - b);
  return sorted[Math.ceil(sorted.length / 2)];
};

const alignAndSumDiff = (numbers) => {
  const mean = getMean(numbers);
  const diffSum = numbers.reduce((sum, pos) => sum + Math.abs(mean - pos), 0);
  return diffSum;
};

// I'm sure there's a solution along the lines of this, but I don't have the
// time to pursue it. :(
const getGeometricMean = (numbers) => {
  const product = numbers
    .map((number) => number + 1)
    .reduce((mean, cur) => mean * cur, 1);
  return Math.ceil(Math.pow(product, 1 / numbers.length));
};

const getGaussianSum = (n) => (n * (n + 1)) / 2;

const alignAndSumDiffProduct = (numbers) => {
  const max = Math.max(...numbers);
  const costs = {};
  for (let i = 0; i < max; i++) {
    const cost = numbers.reduce(
      (sum, pos) => sum + getGaussianSum(Math.abs(i - pos)),
      0
    );
    costs[i] = cost;
  }
  const minCost = Object.keys(costs).reduce(
    (acc, cur) => (costs[cur] < acc ? costs[cur] : acc),
    Number.MAX_SAFE_INTEGER
  );
  return minCost;
};

const testData = parseData("7.test.dat");
assert.equal(getMean(testData), 2);
assert.equal(alignAndSumDiff(testData), 37);
assert.equal(getGeometricMean(testData), 5);
assert.equal(alignAndSumDiffProduct(testData), 168);

const data = parseData("7.dat");
console.log("First Answer", alignAndSumDiff(data));
console.log("Second Answer", alignAndSumDiffProduct(data));
