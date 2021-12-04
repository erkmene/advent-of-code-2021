const fs = require("fs");
const assert = require("assert");

const parseData = (filename) => {
  const parts = fs.readFileSync(filename).toString().trim().split("\n\n");
  const numbers = parts
    .shift()
    .split(",")
    .map((n) => parseInt(n));
  const boards = parts.map((board) =>
    board
      .replace(/\s/g, " ")
      .split(" ")
      .filter((col) => col != "")
      .map((n) => parseInt(n))
  );
  return { numbers, boards };
};

const playTurn = (number, board) => board.map((n) => (number === n ? "m" : n));

const playTurns = (numbers, board) => {
  board = board.concat();
  numbers.forEach((number) => {
    board = playTurn(number, board);
  });
  return board;
};

const checkBoardWin = (board) => {
  // Boards are 5x5
  const boardSize = 5;
  const winCondition = Array(boardSize).fill("m").join("");
  for (let i = 0; i < boardSize; i++) {
    const col = board.filter((n, index) => (index + i) % 5 === 0).join("");
    if (col === winCondition) return true;
  }
  for (let i = 0; i < boardSize; i++) {
    const row = board.slice(i * boardSize, (i + 1) * boardSize).join("");
    if (row === winCondition) return true;
  }
  return false;
};

const playUntilWin = (numbersOriginal, boardsOriginal, winLast) => {
  let numbers = numbersOriginal.concat();
  let boards = boardsOriginal.concat();
  const winningBoards = [];
  let called;
  while (
    numbers.length > 0 &&
    ((!winLast && winningBoards.length === 0) ||
      (winLast && winningBoards.length < boardsOriginal.length))
  ) {
    called = numbers.shift();
    boards = boards.map((board) => playTurn(called, board));
    for (let i = 0; i < boards.length; i++) {
      const board = boards[i];
      if (checkBoardWin(board)) {
        winningBoards.push(board);
        boards.splice(i, 1);
      }
    }
  }

  if (winningBoards.length > 0) {
    const winningBoard = winningBoards.pop();
    const sum = winningBoard.reduce(
      (acc, cur) => (cur !== "m" ? acc + cur : acc),
      0
    );
    return {
      board: winningBoard,
      called,
      sum,
      product: called * sum,
    };
  } else {
    return null;
  }
};

// ----------------------------------------------------------------------------
// Tests & Solutions
// ----------------------------------------------------------------------------

const testData = parseData("4.test.dat");

assert.deepEqual(
  playTurns([7, 4, 9, 5, 11], testData.boards[0]),
  "22 13 17 m 0 8 2 23 m 24 21 m 14 16 m 6 10 3 18 m 1 12 20 15 19"
    .split(" ")
    .map((n) => (n === "m" ? "m" : parseInt(n)))
);

assert.equal(
  checkBoardWin(
    "m m m m m 10 16 15 m 19 18 8 m 26 20 22 m 13 6 m m m 12 3 m"
      .split(" ")
      .map((n) => (n === "m" ? "m" : parseInt(n)))
  ),
  true
);

assert.equal(
  checkBoardWin(
    "1 m m m m 10 m 15 m 19 18 m m 26 20 22 m 13 6 m m m 12 3 m"
      .split(" ")
      .map((n) => (n === "m" ? "m" : parseInt(n)))
  ),
  true
);

assert.deepEqual(
  playUntilWin(
    [
      7, 4, 9, 5, 11, 17, 23, 2, 0, 14, 21, 24, 10, 16, 13, 6, 15, 25, 12, 22,
      18, 20, 8, 19, 3, 26, 1,
    ],
    testData.boards
  ),
  {
    board: "m m m m m 10 16 15 m 19 18 8 m 26 20 22 m 13 6 m m m 12 3 m"
      .split(" ")
      .map((n) => (n === "m" ? "m" : parseInt(n))),
    called: 24,
    sum: 188,
    product: 4512,
  }
);

assert.deepEqual(
  playUntilWin(
    [
      7, 4, 9, 5, 11, 17, 23, 2, 0, 14, 21, 24, 10, 16, 13, 6, 15, 25, 12, 22,
      18, 20, 8, 19, 3, 26, 1,
    ],
    testData.boards,
    true
  ),
  {
    board: "3 15 m m 22 m 18 m m m 19 8 m 25 m 20 m m m m m m m 12 6"
      .split(" ")
      .map((n) => (n === "m" ? "m" : parseInt(n))),
    called: 13,
    sum: 148,
    product: 1924,
  }
);

const data = parseData("4.dat");
console.log("First Answer:", playUntilWin(data.numbers, data.boards).product);
console.log(
  "Second Answer:",
  playUntilWin(data.numbers, data.boards, true).product
);
