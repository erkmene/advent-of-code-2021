const fs = require("fs");
const assert = require("assert");

const testData = [199, 200, 208, 210, 200, 207, 240, 269, 260, 263];
const data = fs
  .readFileSync("1.dat")
  .toString()
  .trim()
  .split("\n")
  .map((line) => parseInt(line));

const countIncrements = (data) => {
  const result = data.reduce(
    (acc, current) => {
      if (acc.prev && acc.prev < current) {
        acc.sum++;
      }
      acc.prev = current;
      return acc;
    },
    { prev: null, sum: 0 }
  );
  return result.sum;
};

const countWindows = (data, windowSize) => {
  let windows = [];
  for (let i = 0; i <= data.length - windowSize; i++) {
    windows.push(
      data.slice(i, i + windowSize).reduce((prev, cur) => prev + cur, 0)
    );
  }
  return countIncrements(windows);
};

assert.equal(countIncrements(testData), 7);
assert.equal(countWindows(testData, 3), 5);
console.log("First Answer:", countIncrements(data));
console.log("Second Answer:", countWindows(data, 3));
