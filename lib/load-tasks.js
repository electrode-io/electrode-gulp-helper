"use strict";

const runSequence = require("run-sequence");
const gulpHelp = require("../gulp-help");
const assert = require("assert");
const Chalk = require("chalk");
const exec = require("./exec");
let Path = require("path");
Path = Path[process.platform] || Path;

function loadTasks(tasks, gulp) {
  gulp = gulp || require("gulp");
  const hGulp = gulpHelp(gulp, {hideDepsMessage: true});
  hGulp.task('default', "Invokes 'gulp help'", ["help"]);

  const makeRunSequence = (taskArray) => {
    return (cb) => {
      const copy = taskArray.slice(0);
      copy.push(cb);
      return runSequence.use(gulp).apply(null, copy);
    }
  };

  const makeDep = (taskName, dep) => {
    if (dep) {
      assert(Array.isArray(dep), `task ${taskName} - dependent tasks must be an array`);
      const depName = `${taskName}-$deps$`;
      hGulp.task(depName, false, makeRunSequence(dep));
      return [depName];
    }
  };

  const addTask = (taskName, desc, dep, task) => {
    if (desc === undefined) {
      desc = [];
    }

    if (desc !== false) {
      if (typeof desc === "string") {
        desc = desc && [Chalk.yellow(desc)] || [];
      } else if (!Array.isArray(desc)) {
        throw new Error(`task ${taskName} - desc field must be undefined, a string, an array, or false`);
      }
    }

    if (desc) {
      if (dep) {
        desc.push(Chalk.dim.cyan(`  deps: ${JSON.stringify(dep)}`));
      }
      desc = desc.join("\n");
    }

    if (typeof task === "string") {
      const cmd = task;
      task = () => exec(cmd);
    }

    hGulp.task(taskName, taskName.startsWith(".") ? false : desc, makeDep(taskName, dep), task);
  };

  const addArrayTask = (taskName, desc, dep, taskArray) => {
    if (typeof desc === "string") {
      desc = desc && desc.split("\n").map((m) => Chalk.green(m));
    }

    if (!desc) {
      desc = [];
    }
    const tasks = `tasks: ${JSON.stringify(taskArray)}`;
    desc.push(`  ${Chalk.dim.green(tasks)}`);

    addTask(taskName, desc, dep, makeRunSequence(taskArray));
  };

  assert(typeof tasks === "object" && !Array.isArray(tasks), "tasks must be an object");

  const names = Object.keys(tasks);
  assert(names.length > 0, "tasks is empty");

  const cmdToDesc = (cmd) => {
    const regex1 = new RegExp(process.cwd(), "g");
    const regex2 = new RegExp(`.${Path.sep}node_modules`, "g");
    const x = cmd.replace(regex1, ".").replace(regex2, "~");
    return [Chalk.magenta(x)];
  };

  Object.keys(tasks).forEach((taskName) => {
    const data = tasks[taskName];
    if (data.name) {
      taskName = data.name;
    }

    switch (typeof data) {
      case "function":
        addTask(taskName, "", undefined, data);
        break;
      case "object":
        if (Array.isArray(data)) {
          addArrayTask(taskName, "", undefined, data);
        } else {
          if (typeof data.task === "function") {
            addTask(taskName, data.desc, data.dep, data.task);
          } else if (Array.isArray(data.task)) {
            addArrayTask(taskName, data.desc, data.dep, data.task);
          } else if (typeof data.task === "string") {
            addTask(taskName, data.desc !== undefined ? data.desc : cmdToDesc(data.task), data.dep, data.task);
          } else {
            throw new Error(`task ${taskName} - task field must be a function, a string, or an array`);
          }
        }
        break;
      case "string":
        addTask(taskName, cmdToDesc(data), undefined, data);
        break;
      default:
        throw new Error(`task ${taskName} - taskData must be a function, an array, or an object`);
    }
  });
}

module.exports = loadTasks;
