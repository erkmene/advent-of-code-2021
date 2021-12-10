const fs = require("fs");
const assert = require("assert");

const parseData = (filename) =>
  fs
    .readFileSync(filename)
    .toString()
    .trim()
    .split("\n")
    .map((line) => {
      const parts = line.split(" | ");
      return {
        signals: parts[0]
          .split(" ")
          .map((signal) => signal.split("").sort().join("")),
        output: parts[1]
          .split(" ")
          .map((signal) => signal.split("").sort().join("")),
      };
    });

const countEasyDigits = (data) => {
  return data.reduce(
    (acc, { signals, output }) =>
      acc +
      output.reduce(
        (easyDigitCount, digit) =>
          [2, 4, 3, 7].includes(digit.length)
            ? easyDigitCount + 1
            : easyDigitCount,
        0
      ),
    0
  );
};

const createWireHistogram = (signals) => {
  const wireHistogram = {};
  signals.forEach((wires) => {
    wires.forEach((wire) => {
      wireHistogram[wire] = wireHistogram[wire] ? wireHistogram[wire] + 1 : 1;
    });
  });
  return wireHistogram;
};

//  aaaa
// b    c
// b    c
//  dddd
// e    f
// e    f
//  gggg

const digitWires = [
  /* 0 */ "abcefg",
  /* 1 */ "cf",
  /* 2 */ "acdeg",
  /* 3 */ "acdfg",
  /* 4 */ "bcdf",
  /* 5 */ "abdfg",
  /* 6 */ "abdefg",
  /* 7 */ "acf",
  /* 8 */ "abcdefg",
  /* 9 */ "abcdfg",
].map((wires) => wires.split(""));

const wires = "abcdefg".split("");
const wiresInDigits = {};
wires.forEach((n) => {
  wiresInDigits[n] = [];
  digitWires.forEach((digit, index) => {
    if (digit.includes(n)) {
      wiresInDigits[n].push(index);
    }
  });
});

const getWiresAndLookup = (signals) => {
  const signalWireHistogram = createWireHistogram(
    signals.map((signal) => signal.split(""))
  );

  // 1, 4, 7 and 8 have unique lengths
  const digits = [];
  digits[1] = signals.filter((signal) => signal.length === 2)[0].split("");
  digits[4] = signals.filter((signal) => signal.length === 4)[0].split("");
  digits[7] = signals.filter((signal) => signal.length === 3)[0].split("");
  digits[8] = signals.filter((signal) => signal.length === 7)[0].split("");

  // b, e and f have unique histogram signatures
  const wires = {
    b: Object.keys(signalWireHistogram).filter(
      (wire) => signalWireHistogram[wire] === 6
    )[0],
    e: Object.keys(signalWireHistogram).filter(
      (wire) => signalWireHistogram[wire] === 4
    )[0],
    f: Object.keys(signalWireHistogram).filter(
      (wire) => signalWireHistogram[wire] === 9
    )[0],
  };

  // 1 has only two wires, we already know f
  wires.c = digits[1].filter((wire) => wire != wires.f).join("");
  // If we subtract 1 from 7 what remains is a
  wires.a = digits[7].filter((wire) => !digits[1].includes(wire)).join("");
  // If we subtract 1 from 4 what remains is either b or d
  const bOrD = digits[4].filter((wire) => !digits[1].includes(wire));
  // We already know b
  wires.d = bOrD.filter((wire) => wire != wires.b).join("");
  // Only g remains
  const wiresSoFar = Object.keys(wires).map((key) => wires[key]);
  wires.g = "abcdefg"
    .split("")
    .filter((wire) => !wiresSoFar.includes(wire))
    .join("");

  const lookup = digitWires.map((originalWires) =>
    originalWires
      .map((wire) => wires[wire])
      .sort()
      .join("")
  );

  return { wires, lookup };
};

const sumOutputs = (data) =>
  data.reduce((acc, cur) => {
    const { lookup } = getWiresAndLookup(cur.signals);
    const { output } = cur;
    const number = output.reduce((acc, cur) => acc + lookup.indexOf(cur), "");
    return acc + parseInt(number);
  }, 0);

const testData = parseData("8.test.dat");
assert.equal(countEasyDigits(testData), 26);

const test2Data = parseData("8.test2.dat");
assert.deepEqual(getWiresAndLookup(test2Data[0].signals).wires, {
  a: "d",
  b: "e",
  c: "a",
  d: "f",
  e: "g",
  f: "b",
  g: "c",
});
assert.equal(sumOutputs(testData), 61229);

const data = parseData("8.dat");
console.log("First Answer:", countEasyDigits(data));
console.log("Second Answer:", sumOutputs(data));
