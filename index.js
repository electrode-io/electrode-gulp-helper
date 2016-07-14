"use strict";

const runSequence = require("run-sequence");
const taskListing = require('gulp-task-listing');
const gulpHelp = require("gulp-help");

function loadGulpTasks(gulp, tasks) {
  gulp = gulp || require("gulp");
  const hGulp = gulpHelp(gulp, {hideDepsMessage: true});
  hGulp.task('default', "List all available tasks", taskListing);

  Object.keys(tasks).forEach((taskName) => {
    const data = tasks[taskName];
    if (data.name) {
      taskName = data.name;
    }
    switch (typeof data) {
      case "function":
        hGulp.task(taskName, taskName.startsWith("~") ? false : "", data);
        break;
      case "object":
        if (Array.isArray(data)) {
          hGulp.task(taskName, `  - tasks: ${JSON.stringify(data)}`, () => {
            runSequence.use(gulp).apply(null, data);
          });
        } else if (typeof data.task === "function") {
          const makeDep = () => {
            if (data.dep) {
              const depName = `${taskName}$deps$`;
              hGulp.task(depName, false, function () {
                runSequence.use(gulp).apply(null, data.dep);
              });
              return [depName];
            }
          };
          const desc = typeof data.desc === "string" ? data.desc : "";
          hGulp.task(taskName, `${desc} ${data.dep && "- deps: " + JSON.stringify(data.dep)}`,
            makeDep(), data.task);
        } else {
          const desc = typeof data.desc === "string" ? data.desc : "";
          hGulp.task(taskName, `${desc}  - tasks: ${JSON.stringify(data.task)}`,
            undefined, () => {
              runSequence.use(gulp).apply(null, data.task);
            });
        }
        break;
    }
  });
}

module.exports = loadGulpTasks;
