"use strict";
const shell = require("shelljs");

function exec() {
  const error = (code, stdout, stderr) => {
    const e = new Error(`command exit code ${code}`);
    e.stdout = stdout;
    e.stderr = stderr;
    return e;
  };

  const len = arguments.length;
  const cb = arguments[len - 1];
  const args = Array.prototype.slice.call(arguments, 0, typeof cb === "function" ? len - 1 : len);

  if (args.length < 1) {
    throw new Error("exec expects a command");
  }

  let s = "";
  const cmd = args.reduce((a, x) => {
    if (Array.isArray(x)) {
      x = x.join(" ");
    } else if (typeof x !== "string") {
      throw new Error("command fragment must be an array or string");
    }
    a = `${a}${s}${x}`;
    s = " ";
    return a;
  }, "");

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
