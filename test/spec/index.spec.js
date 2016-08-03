"use strict";
const gulpHelper = require("../../index");
const chai = require("chai");
const expect = chai.expect;
const runSequence = require("run-sequence");

function reloadGulp() {
  const name = require.resolve("gulp");
  delete require.cache[name];
  return require("gulp");
}

describe("gulp load tasks", function () {
  it("should enforce taskData type", function () {
    const noOp = () => undefined;
    expect(() => gulpHelper.loadTasks()).to.throw();
    expect(() => gulpHelper.loadTasks({})).to.throw();
    expect(() => gulpHelper.loadTasks({"oops": 12345})).to.throw();
    expect(() => gulpHelper.loadTasks({"oops": {task: 12345}})).to.throw();
    expect(() => gulpHelper.loadTasks({"oops": {desc: 12345, task: noOp}})).to.throw();
  });

  it("should add tasks properly", function (done) {
    const gulp = reloadGulp();

    let a = 0;
    let c = 0;
    let e = 0;
    let f = 0;
    let h = 0;
    let i = 0;
    const tasks = {
      // simple function
      "a": () => new Promise((resolve) => {
        setTimeout(() => {
          a++;
          resolve();
        }, 150)
      }),
      // simple array
      "b": ["a"],
      // simple function with help turned off by .
      ".c": () => c++,
      // object with array task
      "d": {
        task: ["b"]
      },
      // object with desc turned off
      "e": {
        desc: false,
        task: () => Promise.resolve(e++)
      },
      // object with desc and function task
      "f": {
        desc: "task f",
        task: () => Promise.resolve(f++)
      },
      // object with dep, desc, and array task
      "g": {
        dep: ["a"],
        desc: "task g",
        task: [".c"]
      },
      // object with name
      "h": {
        name: "hh",
        dep: ["b"],
        desc: false,
        task: (cb) => {
          h++;
          cb();
        }
      },
      "i": {
        task: () => Promise.resolve(i++)
      },
      "t": [".c", "g"],
      "eh": "echo hello",
      "eh2": {
        task: "echo hello2"
      },
      "eh3": {
        desc: "eh3",
        task: "echo hello3"
      }
    };

    gulpHelper.loadTasks(tasks, gulp);
    gulp.task("v0", () => {
      expect(c).to.equal(1);
    });
    gulp.task("v1", () => {
      expect(a).to.equal(1);
      expect(c).to.equal(2);
      expect(gulp.tasks["f"].help).to.be.ok;
      expect(gulp.tasks["f"].help.message).includes("task f");
      expect(gulp.tasks[".c"].help).to.equal(undefined);
      expect(gulp.tasks["h"]).to.equal(undefined);
      expect(gulp.tasks["hh"]).to.be.ok;
      expect(gulp.tasks["hh"].help).to.equal(undefined);
      expect(gulp.tasks["i"].help.message).to.equal("");
      expect(gulp.tasks["eh"].help.message).includes("echo hello");
      expect(gulp.tasks["eh2"].help.message).includes("echo hello2");
      expect(gulp.tasks["eh3"].help.message).includes("eh3");
    });
    gulp.task("v2", () => {
      expect(e).to.equal(1);
    });
    runSequence(".c", "v0", "g", "v1", "e", "v2", "eh", "eh2", "eh3", done);
  });
});
