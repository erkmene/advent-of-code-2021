const fs = require("fs");
const assert = require("assert");

class Cave {
  constructor(filename) {
    this.map = {};
    fs.readFileSync(filename)
      .toString()
      .trim()
      .split("\n")
      .forEach((line) => {
        const nodeIds = line.split("-");
        for (let i = 0; i < nodeIds.length; i++) {
          const nodeId = nodeIds[i];
          const node = this.getNode(nodeId);
          for (let ii = 0; ii < nodeIds.length; ii++) {
            const otherNodeId = nodeIds[ii];
            if (nodeId !== otherNodeId) {
              node.edges.add(this.getNode(otherNodeId));
            }
          }
        }
      });
  }

  getNode(id) {
    let node = this.map[id];
    if (!node) {
      node = { id, edges: new Set(), isBig: id.toLowerCase() !== id };
      this.map[id] = node;
    }
    return node;
  }

  countVisitedNonUniqueSmallRooms(array) {
    return array.reduce((acc, cur) => {
      if (
        cur !== "start" &&
        cur.toLowerCase() === cur &&
        array.indexOf(cur) !== array.lastIndexOf(cur)
      ) {
        return acc + 1;
      }
      return acc;
    }, 0);
  }

  traverse(
    maxNonUniqueSmallRoomsCount = 0,
    from = this.getNode("start"),
    visited = [],
    paths = []
  ) {
    visited.push(from.id);
    if (from.id === "end") {
      paths = [...paths, visited];
    } else {
      for (let edge of from.edges) {
        if (
          edge.isBig ||
          ((visited.indexOf(edge.id) < 0 ||
            this.countVisitedNonUniqueSmallRooms(visited) <
              maxNonUniqueSmallRoomsCount) &&
            edge.id !== "start")
        ) {
          paths = this.traverse(
            maxNonUniqueSmallRoomsCount,
            edge,
            visited.concat(),
            paths.concat()
          );
        }
      }
    }
    return paths;
  }
}

const testCave = new Cave("12.test.dat");
assert.equal(testCave.traverse().length, 10);
assert.equal(testCave.traverse(2).length, 36);

const testCave2 = new Cave("12.test2.dat");
assert.equal(testCave2.traverse().length, 19);
assert.equal(testCave2.traverse(2).length, 103);

const cave = new Cave("12.dat");
console.log("First Answer", cave.traverse().length);
console.log("Second Answer", cave.traverse(2).length);
