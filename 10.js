const fs = require("fs");
const assert = require("assert");

const parseData = (filename) =>
  fs
    .readFileSync(filename)
    .toString()
    .trim()
    .split("\n")
    .map((line) => line.split(""));

const validPairs = {
  "(": ")",
  "[": "]",
  "{": "}",
  "<": ">",
};

const openingChars = Object.keys(validPairs);

const syntaxScoreTable = {
  ")": 3,
  "]": 57,
  "}": 1197,
  ">": 25137,
};

const autocompleteScoreTable = {
  ")": 1,
  "]": 2,
  "}": 3,
  ">": 4,
};

const checkProgram = (data) => {
  let syntaxScore = 0;
  let autocompleteScores = [];
  for (let li = 0, ll = data.length; li < ll; li++) {
    const line = data[li];
    const stack = [];
    let invalid;

    for (let ci = 0, cl = line.length; ci < cl; ci++) {
      const char = line[ci];
      if (openingChars.includes(char)) {
        stack.push(char);
      } else {
        if (validPairs[stack[stack.length - 1]] === char) {
          stack.pop();
        } else {
          syntaxScore += syntaxScoreTable[char];
          invalid = true;
          break;
        }
      }
    }

    if (!invalid) {
      let autocompleteScore = 0;
      for (let ci = stack.length - 1; ci > -1; ci--) {
        const openingChar = stack[ci];
        const completionChar = validPairs[openingChar];
        autocompleteScore =
          autocompleteScore * 5 + autocompleteScoreTable[completionChar];
      }
      autocompleteScores.push(autocompleteScore);
    }
  }
  autocompleteScores.sort((a, b) => a - b);
  return {
    syntaxScore,
    autocompleteScore:
      autocompleteScores[Math.floor(autocompleteScores.length / 2)],
  };
};

const testData = parseData("10.test.dat");
const testDataCheck = checkProgram(testData);
assert.equal(testDataCheck.syntaxScore, 26397);
assert.equal(testDataCheck.autocompleteScore, 288957);

const data = parseData("10.dat");
const dataCheck = checkProgram(data);
console.log("First Answer:", dataCheck.syntaxScore);
console.log("Second Answer:", dataCheck.autocompleteScore);
