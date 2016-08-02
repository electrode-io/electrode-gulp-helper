"use strict";

const runSequence = require("run-sequence");
const gulpHelp = require("gulp-help");
const assert = require("assert");

function loadTasks(tasks, gulp) {
  gulp = gulp || require("gulp");
  const hGulp = gulpHelp(gulp, {hideDepsMessage: true});
  hGulp.task('default', "Invokes 'gulp help'", [ "help" ]);

  const makeRunSequence = (taskArray) => {
    taskArray = taskArray.slice(0);
    return (cb) => {
      taskArray.push(cb);
      return runSequence.use(gulp).apply(null, taskArray);
    }
  };

  const makeDep = (taskName, dep) => {
    if (dep) {
      assert(Array.isArray(dep), `task ${taskName} - dependent tasks must be an array`);
      const depName = `${taskName}$deps$`;
      hGulp.task(depName, false, makeRunSequence(dep));
      return [depName];
    }
  };

  const addTask = (taskName, desc, dep, task) => {
    if (desc === undefined) {
      desc = "";
    }

    if (typeof desc === "string") {
      if (dep) {
        desc = `${desc}  - deps: ${JSON.stringify(dep)}`;
      }
    } else if (desc !== false) {
      throw new Error(`task ${taskName} - desc field must be undefined, a string, or false`);
    }

    hGulp.task(taskName, taskName.startsWith(".") ? false : desc, makeDep(taskName, dep), task);
  };

  const addArrayTask = (taskName, desc, dep, taskArray) => {
    if (typeof desc === "string") {
      desc = `${desc}  - tasks: ${JSON.stringify(taskArray)}`;
    }
    addTask(taskName, desc, dep, makeRunSequence(taskArray));
  };

  assert(typeof tasks === "object" && !Array.isArray(tasks), "tasks must be an object");

  const names = Object.keys(tasks);
  assert(names.length > 0, "tasks is empty");

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
          } else {
            throw new Error(`task ${taskName} - task field must be a function or an array`);
          }
        }
        break;
      default:
        throw new Error(`task ${taskName} - taskData must be a function, an array, or an object`);
    }
  });
}

module.exports = loadTasks;
