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
    gulpHelper.exec("unknown_command", function (err, output) {
      expect(err).to.be.ok;
      expect(err.stderr).equals(output.stderr);
      expect(output.stderr).includes("not found");
      done();
    });
  });

  it("should failed for unknown command @Promise", function () {
    return gulpHelper.exec("unknown_command").then(() => {
      throw new Error("expected failure")
    }).catch((err) => {
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

  it("should failed for empty arguments", function () {
    expect(() => gulpHelper.exec()).to.throw(Error);
  });

  it("should failed for no command", function () {
    expect(() => gulpHelper.exec(() => undefined)).to.throw(Error);
  });

  it("should exec command split in array", function () {
    gulpHelper.exec(["echo", "hello,", "world"], function (err, output) {
      expect(err).to.be.not.ok;
      expect(output.stdout).to.equal("hello, world\n");
      done();
    });
  });

  it("should exec command split in multiple arrays", function () {
    gulpHelper.exec(["echo", "hello, world"], ["my", "name", "is", "test"], function (err, output) {
      expect(err).to.be.not.ok;
      expect(output.stdout).to.equal("hello, world my name is test\n");
      done();
    });
  });

  it("should exec command split in arrays and strings", function () {
    gulpHelper.exec(["echo", "hello, world"], ["my", "name"], "is", "test", ["foo", "bar"], "more", "text", function (err, output) {
      expect(err).to.be.not.ok;
      expect(output.stdout).to.equal("hello, world my name is test foo bar more text\n");
      done();
    });
  });

  it("should failed if a command fragment is not array or string", function () {
    expect(() => gulpHelper.exec("test", ["1", "2"], true)).to.throw(Error);
  });
});
