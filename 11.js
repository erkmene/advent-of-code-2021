const fs = require("fs");
const assert = require("assert");

const parseData = (filename) =>
  fs
    .readFileSync(filename)
    .toString()
    .trim()
    .split("\n")
    .map((line, y) =>
      line.split("").map((n, x) => ({ x, y, val: parseInt(n), flashCount: 0 }))
    );

const drawMap = (map) => {
  let canvas = "";
  for (let cy = 0; cy < map.length; cy++) {
    for (let cx = 0; cx < map.length; cx++) {
      canvas += map[cy][cx].val;
    }
    canvas += "\n";
  }
  console.log(canvas);
};

const getNeighbors = (map, x, y) => {
  const neighbors = [];
  for (
    let cy = Math.max(0, y - 1);
    cy <= Math.min(map.length - 1, y + 1);
    cy++
  ) {
    for (
      cx = Math.max(0, x - 1);
      cx <= Math.min(map[0].length - 1, x + 1);
      cx++
    ) {
      if (cy != y || cx != x) {
        neighbors.push(map[cy][cx]);
      }
    }
  }
  return neighbors;
};

const stepCell = (map, cell, depth = 0) => {
  cell.val++;
  if (cell.val === 10) {
    cell.flashCount++;
    const neighbors = getNeighbors(map, cell.x, cell.y);
    neighbors.forEach((neighbor) => {
      stepCell(map, neighbor, depth + 1);
    });
  }
};

const step = (map) => {
  for (let cy = 0; cy < map.length; cy++) {
    for (let cx = 0; cx < map.length; cx++) {
      stepCell(map, map[cy][cx]);
    }
  }
  for (let cy = 0; cy < map.length; cy++) {
    for (let cx = 0; cx < map.length; cx++) {
      if (map[cy][cx].val > 9) {
        map[cy][cx].val = 0;
      }
    }
  }
};

const iterate = (map, steps) => {
  map = JSON.parse(JSON.stringify(map));
  for (let i = 0; i < steps; i++) {
    step(map);
  }
  return map.reduce(
    (acc, cur) => acc + cur.reduce((acc, cur) => acc + cur.flashCount, 0),
    0
  );
};

const iterateUntilSync = (map) => {
  map = JSON.parse(JSON.stringify(map));
  let iteration = 0;
  while (true) {
    iteration++;
    step(map);
    const sum = map.reduce(
      (acc, cur) => acc + cur.reduce((acc, cur) => acc + cur.val, 0),
      0
    );
    if (sum === 0) return iteration;
  }
};

const testData = parseData("11.test.dat");
const testData2 = parseData("11.test2.dat");

assert.deepEqual(
  getNeighbors(testData, 0, 0).map((n) => n.val),
  [4, 2, 7]
);

assert.deepEqual(
  getNeighbors(testData, 9, 9).map((n) => n.val),
  [5, 4, 2]
);

assert.equal(iterate(testData2, 1), 9);
assert.equal(iterate(testData2, 2), 9);
assert.equal(iterate(testData, 100), 1656);

assert.equal(iterateUntilSync(testData), 195);

const data = parseData("11.dat");
console.log("First Answer:", iterate(data, 100));
console.log("Second Answer:", iterateUntilSync(data));
