const fs = require("fs");
const assert = require("assert");

const parseData = (filename) =>
  fs
    .readFileSync(filename)
    .toString()
    .trim()
    .split(",")
    .map((n) => parseInt(n));

const iterate = (histogram) => {
  const nextGen = new Array(9).fill(0);
  for (let currentDay = 0; currentDay < histogram.length; currentDay++) {
    let nextDay;
    if (currentDay === 0) {
      nextDay = 6;
      nextGen[6] += histogram[currentDay];
      nextGen[8] += histogram[currentDay];
    } else {
      nextDay = currentDay - 1;
      nextGen[nextDay] += histogram[currentDay];
    }
  }
  return nextGen;
};

const iterateFor = (cells, limit) => {
  let histogram = new Array(9).fill(0);
  cells.forEach((element) => {
    histogram[element]++;
  });

  while (limit > 0) {
    histogram = iterate(histogram);
    limit--;
  }

  return histogram;
};

const getPopulationAfterGeneration = (cells, limit) => {
  const histogram = iterateFor(cells, limit);
  return histogram.reduce((sum, cur) => sum + cur, 0);
};

const testData = parseData("6.test.dat");

assert.equal(getPopulationAfterGeneration(testData, 1), 5);
assert.equal(getPopulationAfterGeneration(testData, 2), 6);
assert.equal(getPopulationAfterGeneration(testData, 80), 5934);
assert.equal(getPopulationAfterGeneration(testData, 256), 26984457539);

const data = parseData("6.dat");
console.log("First Answer:", getPopulationAfterGeneration(data, 80));
console.log("Second Answer:", getPopulationAfterGeneration(data, 256));
