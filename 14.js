const fs = require("fs");
const assert = require("assert");

const parseData = (filename) => {
  let [template, rulesArray] = fs
    .readFileSync(filename)
    .toString()
    .trim()
    .split("\n\n");

  const rules = {};
  rulesArray.split("\n").forEach((rule) => {
    rule = rule.split(" -> ");
    const tuple = rule[0].split("");
    rules[rule[0]] = [tuple[0] + rule[1], rule[1] + tuple[1]];
  });

  return { template, rules };
};

const getPairCountsFromTemplate = (template) => {
  const pairCounts = {};
  let pair;
  for (let i = 0; i < template.length - 1; i++) {
    pair = template.substr(i, 2);
    pairCounts[pair] = pairCounts[pair] ? pairCounts[pair] + 1 : 1;
  }
  return pairCounts;
};

const getHistogram = (template) => {
  const histogram = {};
  for (let i = 0; i < template.length; i++) {
    const element = template[i];
    histogram[element] = histogram[element] ? histogram[element] + 1 : 1;
  }
  return histogram;
};

const iterate = ({ template, rules }, count) => {
  let pairCounts = getPairCountsFromTemplate(template);
  const histogram = getHistogram(template);
  while (count > 0) {
    const newPairCount = {};
    const pairs = Object.keys(pairCounts);
    let pair;
    for (let i = 0; i < pairs.length; i++) {
      pair = pairs[i];
      const elements = rules[pair];
      elements.forEach((element) => {
        newPairCount[element] = newPairCount[element]
          ? newPairCount[element] + pairCounts[pair]
          : pairCounts[pair];
      });
      const offspring = elements[0][1];
      histogram[offspring] = histogram[offspring]
        ? histogram[offspring] + pairCounts[pair]
        : pairCounts[pair];
    }
    pairCounts = newPairCount;
    count--;
  }
  return histogram;
};

const diffMinMax = (histogram) => {
  const ordered = Object.keys(histogram).sort(
    (a, b) => histogram[b] - histogram[a]
  );
  return histogram[ordered.shift()] - histogram[ordered.pop()];
};

const iterateAndDiffMinMax = (data, count) => diffMinMax(iterate(data, count));

const testData = parseData("14.test.dat");

assert.deepEqual(
  iterate(testData, 4),
  getHistogram("NBBNBNBBCCNBCNCCNBBNBBNBBBNBBNBBCBHCBHHNHCBBCBHCB")
);
assert.equal(iterateAndDiffMinMax(testData, 10), 1588);

const data = parseData("14.dat");

console.log("First Answer:", iterateAndDiffMinMax(data, 10));
console.log("Second Answer:", iterateAndDiffMinMax(data, 40));
