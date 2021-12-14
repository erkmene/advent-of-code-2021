const fs = require("fs");
const assert = require("assert");
const { isNumber } = require("util");

const parseData = (filename) => {
  let [lines, instructions] = fs
    .readFileSync(filename)
    .toString()
    .trim()
    .split("\n\n");

  lines = lines.split("\n");

  const paperLength = lines
    .map((line) => line.split(","))
    .reduce(
      (acc, [x, y]) => [Math.max(acc[0], +x), Math.max(acc[1], +y)],
      [0, 0]
    )
    .map((n) => n + 1);
  const paper = new Array(paperLength[1])
    .fill(0)
    .map(() => new Array(paperLength[0]).fill(0));
  lines.forEach((line) => {
    const [x, y] = line.split(",");
    paper[+y][+x] = 1;
  });

  instructions = instructions.split("\n").map((instruction) =>
    instruction
      .replace("fold along ", "")
      .replace("=", ",")
      .split(",")
      .map((dirOrPos) => (+dirOrPos == dirOrPos ? +dirOrPos : dirOrPos))
  );

  return { paper, instructions };
};

const drawPaper = (map) => {
  let canvas = "";
  for (let cy = 0; cy < map.length; cy++) {
    for (let cx = 0; cx < map[0].length; cx++) {
      canvas += map[cy][cx] ? "■" : " ";
    }
    canvas += "\n";
  }
  return canvas;
};

const fold = (paper, [dir, pos]) => {
  let newPaper, toFold, toFoldLength;
  if (dir === "y") {
    toFold = paper.slice(pos + 1).reverse();
    toFoldLength = toFold.length;
    newPaper = paper.slice(0, pos).map((row, rowIndex) => {
      if (toFoldLength - rowIndex < 0) {
        return row;
      } else {
        return row.map((char, charIndex) => {
          return char | toFold[rowIndex][charIndex];
        });
      }
    });
  } else {
    toFold = paper.map((row) => row.slice(pos + 1).reverse());
    toFoldLength = toFold[0].length;
    newPaper = paper.map((row, rowIndex) =>
      row.slice(0, pos).map((char, charIndex) => {
        if (toFoldLength - charIndex < 0) {
          return char;
        } else {
          return char | toFold[rowIndex][charIndex];
        }
      })
    );
  }
  return newPaper;
};

const foldFor = (paper, instructions) => {
  for (let i = 0; i < instructions.length; i++) {
    paper = fold(paper, instructions[i]);
  }
  return paper;
};

const countVisible = (paper) =>
  paper.reduce(
    (acc, cur) => acc + cur.reduce((acc, cur) => (cur > 0 ? acc + 1 : acc), 0),
    0
  );

const testData = parseData("13.test.dat");
assert.equal(countVisible(fold(testData.paper, testData.instructions[0])), 17);
assert.equal(countVisible(foldFor(testData.paper, testData.instructions)), 16);

const data = parseData("13.dat");
console.log(
  "First Answer:",
  countVisible(fold(data.paper, data.instructions[0]))
);
console.log("Second Answer:");
console.log(drawPaper(foldFor(data.paper, data.instructions)));
