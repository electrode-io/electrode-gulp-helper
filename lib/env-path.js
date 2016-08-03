"use strict";

let Path = require("path");
Path = Path[process.platform] || Path;
const pathDelim = Path.delimiter;

function check() {
  if (!process.env.PATH) {
    process.env.PATH = "";
  }
}

function addToFront(p) {
  check();

  if (typeof p === "string" && p && process.env.PATH.indexOf(p) !== 0) {
    const paths = process.env.PATH.split(pathDelim).filter((x) => x && x !== p);
    paths.unshift(p);
    process.env.PATH = paths.join(pathDelim);
  }
}

function addToEnd(p) {
  check();

  if (typeof p === "string" && p) {
    const paths = process.env.PATH.split(pathDelim).filter((x) => x && x !== p);
    paths.push(p);
    process.env.PATH = paths.join(pathDelim);
  }
}

function add(p) {
  check();

  if (typeof p === "string" && p && process.env.PATH.indexOf(p) < 0) {
    process.env.PATH = `${process.env.PATH}${pathDelim}${p}`;
  }
}

module.exports = {
  addToFront,
  addToEnd,
  add
};
