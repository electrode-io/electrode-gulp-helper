"use strict";
const gulpHelper = require("../../index");
const chai = require("chai");
const expect = chai.expect;

function reloadGulp() {
  const name = require.resolve("gulp");
  delete require.cache[name];
  return require("gulp");
}

describe("envPath", function () {
  let save;
  before(() => {
    save = process.env.PATH;
  });

  after(() => {
    process.env.PATH = save;
  });

  it("addToFront should add path to front", function () {
    gulpHelper.envPath.addToFront("/test1");
    expect(process.env.PATH.indexOf("/test1")).to.equal(0);
    delete process.env.PATH;
    gulpHelper.envPath.addToFront("/test1");
    gulpHelper.envPath.addToFront("/test1");
    expect(process.env.PATH).to.equal("/test1");
    gulpHelper.envPath.addToFront("/test2");
    expect(process.env.PATH.indexOf("/test2")).to.equal(0);
    gulpHelper.envPath.addToFront("/test1");
    expect(process.env.PATH.indexOf("/test1")).to.equal(0);
  });

  it("addToEnd should add path to end", function () {
    process.env.PATH = "";
    gulpHelper.envPath.addToEnd("/test1");
    expect(process.env.PATH.indexOf("/test1")).to.equal(0);
    gulpHelper.envPath.addToEnd("/test1");
    gulpHelper.envPath.addToEnd("/test1");
    expect(process.env.PATH).to.equal("/test1");
    gulpHelper.envPath.addToEnd("/test2");
    expect(process.env.PATH.indexOf("/test1")).to.equal(0);
    gulpHelper.envPath.addToEnd("/test1");
    gulpHelper.envPath.addToEnd();
    expect(process.env.PATH.indexOf("/test2")).to.equal(0);
  });


  it("add should add path end if it's not exist", function () {
    process.env.PATH = "/test1:/test2";
    gulpHelper.envPath.add("/test1");
    expect(process.env.PATH).to.equal("/test1:/test2");
    gulpHelper.envPath.add("/test2");
    expect(process.env.PATH).to.equal("/test1:/test2");
    gulpHelper.envPath.add("/test3");
    expect(process.env.PATH).to.equal("/test1:/test2:/test3");
  });
});
