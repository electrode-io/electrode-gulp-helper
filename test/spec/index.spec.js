"use strict";
const gulpLoadTasks = require("../../index");
const chai = require("chai");
const expect = chai.expect;

function reloadGulp() {
  const name = require.resolve("gulp");
  delete require.cache[name];
  return require("gulp");
}

describe("gulp load tasks", function () {
  it("should enforce taskData type", function () {
    const noOp = () => undefined;
    expect(() => gulpLoadTasks()).to.throw();
    expect(() => gulpLoadTasks({})).to.throw();
    expect(() => gulpLoadTasks({"oops": 12345})).to.throw();
    expect(() => gulpLoadTasks({"oops": {task: 12345}})).to.throw();
    expect(() => gulpLoadTasks({"oops": {desc: 12345, task: noOp}})).to.throw();
  });

  it("should add tasks properly", function () {
    const gulp = reloadGulp();

    let a = 0;
    let c = 0;
    let e = 0;
    let f = 0;
    let h = 0;
    const tasks = {
      // simple function
      "a": () => a++,
      // simple array
      "b": ["a"],
      // simple function with help turned off by ~
      "~c": () => c++,
      // object with array task
      "d": {
        task: ["b"]
      },
      // object with desc turned off
      "e": {
        desc: false,
        task: () => e++
      },
      // object with desc and function task
      "f": {
        desc: "task f",
        task: () => f++
      },
      // object with dep, desc, and array task
      "g": {
        dep: ["a"],
        desc: "task g",
        task: ["~c"]
      },
      // object with name
      "h": {
        name: "hh",
        dep: ["b"],
        desc: false,
        task: () => h++
      }
    };

    gulpLoadTasks(tasks, gulp);
    gulp.start("~c");
    expect(c).to.equal(1);
    gulp.start("e");
    expect(e).to.equal(1);
    gulp.start("g");
    expect(a).to.equal(1);
    expect(c).to.equal(2);
    expect(gulp.tasks["f"].help).to.be.ok;
    expect(gulp.tasks["f"].help.message).to.equal("task f");
    expect(gulp.tasks["~c"].help).to.equal(undefined);
    expect(gulp.tasks["h"]).to.equal(undefined);
    expect(gulp.tasks["hh"]).to.be.ok;
    expect(gulp.tasks["hh"].help).to.equal(undefined);
  });
});
