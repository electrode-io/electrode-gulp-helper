"use strict";
const gulpHelper = require("../../index");
const chai = require("chai");
const expect = chai.expect;

function reloadGulp() {
  const name = require.resolve("gulp");
  delete require.cache[name];
  return require("gulp");
}

describe("exec", function () {
  it("should failed for unknown command", function (done) {
    gulpHelper.exec("unknown_command", function(err, output) {
      expect(err).to.be.ok;
      expect(err.stderr).equals(output.stderr);
      expect(output.stderr).includes("not found");
      done();
    });
  });

  it("should failed for unknown command @Promise", function () {
    return gulpHelper.exec("unknown_command").then(() => { throw new Error("expected failure") }).catch((err) => {
      expect(err.stderr).includes("not found");
    });
  });

  it("should execute command", function (done) {
    gulpHelper.exec("echo hello, world", function (err, output) {
      expect(err).to.be.not.ok;
      expect(output.stdout).to.equal("hello, world\n");
      done();
    });
  });

  it("should execute command @Promise", function () {
    return gulpHelper.exec("echo hello, world").then((output) => {
      expect(output.stdout).to.equal("hello, world\n");
    });
  });
});
