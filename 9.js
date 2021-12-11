const fs = require("fs");
const assert = require("assert");

const parseData = (filename) =>
  fs
    .readFileSync(filename)
    .toString()
    .trim()
    .split("\n")
    .map((line) =>
      line
        .split("")
        .map((n) => ({ val: parseInt(n), color: parseInt(n) === 9 ? 9 : 0 }))
    );

const getNeighbors = (map, x, y) => {
  const neighbors = [];
  for (
    let cy = Math.max(0, y - 1);
    cy <= Math.min(map.length - 1, y + 1);
    cy++
  ) {
    if (cy != y) {
      neighbors.push(map[cy][x]);
    }
  }
  for (
    let cx = Math.max(0, x - 1);
    cx <= Math.min(map[0].length - 1, x + 1);
    cx++
  ) {
    if (cx != x) {
      neighbors.push(map[y][cx]);
    }
  }
  return neighbors;
};

const getMinimums = (map) => {
  const mins = [];
  for (let y = 0; y < map.length; y++) {
    for (let x = 0; x < map[0].length; x++) {
      const neighbors = getNeighbors(map, x, y);
      if (Math.min(...neighbors.map((n) => n.val)) > map[y][x].val) {
        mins.push(map[y][x].val);
      }
    }
  }
  return mins;
};

const calculateRiskLevels = (map) => {
  const minimums = getMinimums(map);
  return minimums.reduce((acc, cur) => acc + cur + 1, 0);
};

const boundaryFill = (map, x, y, color, boundary) => {
  if (
    x < 0 ||
    x >= map[0].length ||
    y < 0 ||
    y >= map.length ||
    map[y][x].color === color ||
    map[y][x].color === boundary
  ) {
    return;
  }
  map[y][x].color = color;
  boundaryFill(map, x, y - 1, color, boundary);
  boundaryFill(map, x, y + 1, color, boundary);
  boundaryFill(map, x - 1, y, color, boundary);
  boundaryFill(map, x + 1, y, color, boundary);
};

const findFirstUnfilledLocation = (map) => {
  for (x = 0, xl = map[0].length; x < xl; x++) {
    for (y = 0, yl = map.length; y < yl; y++) {
      if (map[y][x].color === 0) {
        return { x, y };
      }
    }
  }
};

const fillBasins = (map) => {
  let unfilled = findFirstUnfilledLocation(map);
  let color = 10;
  while (unfilled) {
    boundaryFill(map, unfilled.x, unfilled.y, color, 9);
    unfilled = findFirstUnfilledLocation(map);
    color++;
  }
  return map;
};

const calculateBasinScore = (map) => {
  map = fillBasins(map.concat());
  const basins = {};
  for (x = 0, xl = map[0].length; x < xl; x++) {
    for (y = 0, yl = map.length; y < yl; y++) {
      const cell = map[y][x];
      if (cell.color === 9) continue;
      if (!basins[cell.color]) {
        basins[cell.color] = 0;
      }
      basins[cell.color]++;
    }
  }
  return Object.values(basins)
    .sort((a, b) => a - b)
    .slice(-3)
    .reduce((acc, cur) => acc * cur, 1);
};

const testData = parseData("9.test.dat");

assert.deepEqual(
  getNeighbors(testData, 0, 0).map((n) => n.val),
  [3, 1]
);
assert.deepEqual(
  getNeighbors(testData, 9, 4).map((n) => n.val),
  [9, 7]
);
assert.deepEqual(
  getNeighbors(testData, 2, 2).map((n) => n.val),
  [8, 6, 8, 6]
);
assert.deepEqual(calculateRiskLevels(testData), 15);
assert.deepEqual(calculateBasinScore(testData), 1134);

const data = parseData("9.dat");

console.log("First answer:", calculateRiskLevels(data));
console.log("Second answer:", calculateBasinScore(data));
