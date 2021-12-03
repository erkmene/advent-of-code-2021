const fs = require("fs");
const assert = require("assert");

const parseData = (filename) =>
  fs.readFileSync(filename).toString().trim().split("\n");

const vAdd = (v1, v2) => [v1[0] + v2[0], v1[1] + v2[1]];
const calculateVector = (dir, magnitude) => {
  switch (dir) {
    case "forward":
      return [magnitude, 0];
    case "down":
      return [0, magnitude];
    case "up":
      return [0, -magnitude];
  }
};

const navigate = (course, withAim) => {
  let pos = [0, 0];
  let aim = [0, 0];
  course.forEach((item) => {
    const [dir, magnitude] = item.split(" ");
    const vector = calculateVector(dir, parseInt(magnitude));
    if (withAim) {
      const aimVector = [0, vector[1]];
      aim = vAdd(aim, aimVector);
      if (dir === "forward") {
        const posVector = [vector[0], magnitude * aim[1]];
        pos = vAdd(pos, posVector);
      }
    } else {
      pos = vAdd(pos, vector);
    }
  });
  return pos;
};

const testData = parseData("2.test.dat");
const data = parseData("2.dat");

assert.equal(
  navigate(testData).reduce((acc, cur) => acc * cur, 1),
  150
);

console.log(
  "First answer:",
  navigate(data).reduce((acc, cur) => acc * cur, 1)
);

assert.equal(
  navigate(testData, true).reduce((acc, cur) => acc * cur, 1),
  900
);

console.log(
  "Second answer:",
  navigate(data, true).reduce((acc, cur) => acc * cur, 1)
);
