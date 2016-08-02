"use strict";
const shell = require("shelljs");

function exec(cmd, cb) {
  const error = (code, stdout, stderr) => {
    const e = new Error(`command exit code ${code}`);
    e.stdout = stdout;
    e.stderr = stderr;
    return e;
  };

  if (typeof cb === "function") {
    shell.exec(cmd, (code, stdout, stderr) => {
      cb(code !== 0 ? error(code, stdout, stderr) : undefined, {stdout, stderr});
    });
  } else {
    return new Promise((resolve, reject) => {
      shell.exec(cmd, (code, stdout, stderr) => {
        code !== 0 ? reject(error(code, stdout, stderr)) : resolve({stdout, stderr});
      });
    });
  }
}

module.exports = exec;
