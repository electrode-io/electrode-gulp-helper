"use strict";

const loadTasks = require("./lib/load-tasks");
const exec = require("./lib/exec");
const envPath = require("./lib/env-path");
const shell = require("shelljs");

module.exports = {
  loadTasks,
  exec,
  envPath,
  shell
};
