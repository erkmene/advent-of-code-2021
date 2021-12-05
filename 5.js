const fs = require("fs");
const assert = require("assert");

const parseData = (filename) =>
  fs
    .readFileSync(filename)
    .toString()
    .trim()
    .split("\n")
    .map((line) =>
      line.split(" -> ").map((pair) => pair.split(",").map((n) => parseInt(n)))
    );

const drawMap = (map, mapSize) => {
  let out = "";
  for (let i = 0; i < map.length; i++) {
    if (i !== 0 && i % mapSize === 0) {
      out += "\n";
    }
    out += map[i];
  }
  console.log(out);
};

const markLines = (linesSource, includeDiagonals) => {
  let criteria;
  if (includeDiagonals) {
    criteria = ([from, to]) =>
      from[0] === to[0] ||
      from[1] === to[1] ||
      Math.abs(from[0] - to[0]) == Math.abs(from[1] - to[1]);
  } else {
    criteria = ([from, to]) => from[0] === to[0] || from[1] === to[1];
  }
  const lines = linesSource.filter(criteria);

  mapSize =
    lines.reduce((acc, [from, to]) => {
      return Math.max(from[0], from[1], to[0], to[1], acc);
    }, 0) + 1;

  const map = new Array(mapSize * mapSize).fill(0);

  lines.forEach(([from, to]) => {
    const fromX = from[0];
    const toX = to[0];
    const fromY = from[1];
    const toY = to[1];
    const stepX = Math.sign(toX - fromX);
    const stepY = Math.sign(toY - fromY);
    const steps = Math.max(Math.abs(toX - fromX), Math.abs(toY - fromY));
    for (let step = 0; step <= steps; step++) {
      const x = fromX + stepX * step;
      const y = fromY + stepY * step;
      map[y * mapSize + x]++;
    }
  });
  return map;
};

const countOverlaps = (map) =>
  map.reduce((acc, cur) => (cur > 1 ? acc + 1 : acc), 0);

const testData = parseData("5.test.dat");
assert.equal(countOverlaps(markLines(testData)), 5);
assert.equal(countOverlaps(markLines(testData, true)), 12);

const data = parseData("5.dat");
console.log("First Answer:", countOverlaps(markLines(data)));
console.log("Second Answer:", countOverlaps(markLines(data, true)));
