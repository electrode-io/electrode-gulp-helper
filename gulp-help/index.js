"use strict";

const chalk = require('chalk'),
  attachHelp = require('./lib/attach-help.js'),
  calculateMargin = require('./lib/calculate-margin.js'),
  noop = require('./lib/noop'),
  DEFAULT_OPTIONS = {
    aliases: [],
    description: 'Display this help text.',
    afterPrintCallback: noop,
    hideDepsMessage: false,
    hideEmpty: false
  };

module.exports = function (gulp, options) {
  let originalTaskFn = gulp.task;

  options = Object.assign({}, DEFAULT_OPTIONS, options);

  /**
   * gulp.task(name[, help, deps, fn, taskOptions])
   *
   * Adds `help` and `taskOptions` to the typical gulp task definition:
   * https://github.com/gulpjs/gulp/blob/master/docs/API.md#gulptaskname-deps-fn
   * @param {string} name
   * @param {string | boolean} [help]
   * @param {Array} [deps]
   * @param {function} [fn]
   * @param {object} [taskOptions]
   */
  gulp.task = (name, help, deps, fn, taskOptions) => {
    let task;

    /* jshint noempty: false */
    if (name && (help === null || help === undefined)) {
      // just a name. do nothing.
    } else if (help === false) {
      // .task('test', false, ...)
      //ignoredTasks.push(name);
      if (typeof deps === 'function') {
        // .task('test', false, function(){}, {})
        taskOptions = fn;
        fn = deps;
        deps = undefined;
      } else {
        // .task('test', false, ['dep'], function(){}, {})
        // nothing needs to be re-assigned
      }
    } else if (typeof help === 'function') {
      // .task('test', function(){})
      taskOptions = deps;
      fn = undefined;
      deps = help;
      help = undefined;
    } else if (Array.isArray(help)) {
      // .task('test', ['dep'], ...)
      taskOptions = fn;
      fn = deps;
      deps = help;
      help = undefined;
    } else if (name && !deps) {
      // .task('test', '...')
      // help text with no func and no deps
    } else if (typeof deps === 'function') {
      // .task('test', '...', function, {})
      taskOptions = fn;
      fn = deps;
      deps = undefined;
    } else if (Array.isArray(deps)) {
      // .task('test', '...', ['dep'], function, {})
      // nothing needs to be re-assigned
    } else {
      throw new Error('gulp-help: Unexpected arg types. Should be in the form: `gulp.task(name[, help, deps, fn, taskOptions])`');
    }

    if (!deps) {
      originalTaskFn.call(gulp, name, fn);
    } else {
      originalTaskFn.call(gulp, name, deps, fn);
    }

    task = gulp.tasks[name];

    taskOptions = Object.assign({
      aliases: []
    }, taskOptions);


    taskOptions.aliases.forEach(function (alias) {
      gulp.task(alias, false, [name], noop);
    });

    attachHelp(task, help, deps, taskOptions);

    return gulp;
  };

  gulp.task('help', options.description, () => {
    let marginData = calculateMargin(gulp.tasks);
    let margin = marginData.margin;
    let hideDepsMessageOpt = options.hideDepsMessage;
    let hideEmptyOpt = options.hideEmpty;
    let showAllTasks = process.argv.indexOf('--all') !== -1;
    let afterPrintCallback = options.afterPrintCallback;

    // set options buffer if the tasks array has options
    let optionsBuffer = marginData.hasOptions ? '  --' : '';

    console.log('');
    console.log(chalk.underline('Usage'));
    console.log('  gulp [TASK] [OPTIONS...]');
    console.log('');

    let guideChar = ".";

    const printTask = (name) => {
      if (gulp.tasks[name].help || showAllTasks) {
        let help = gulp.tasks[name].help || {message: '', options: {}};

        if (!showAllTasks && help.message === '' && hideEmptyOpt) {
          return; //skip task
        }

        let args = [' ', chalk.cyan(name)];

        let namePadding = new Array(margin - name.length + 1 + optionsBuffer.length);
        if (help.message) {
          args.push(chalk.dim(namePadding.join(guideChar)));
          guideChar = guideChar === '.' ? '-' : '.';
          args.push(help.message.replace(/\n/g, '\n    ' + new Array(margin + 1 + optionsBuffer.length).join(' ')));
        } else {
          args.push(namePadding.join(' '));
        }

        if (help.aliases) {
          args.push(help.aliases);
        }

        if (help.depsMessage && !hideDepsMessageOpt) {
          args.push(chalk.cyan(help.depsMessage));
        }

        let options = Object.keys(help.options).sort();
        options.forEach(function (option) {
          let optText = help.options[option];
          args.push('\n ' + optionsBuffer + chalk.cyan(option) + ' ');

          args.push(new Array(margin - option.length + 1).join(' '));
          args.push(optText);
        });

        console.log.apply(console, args);
      }
    };

    const showTasks = (title, tasks) => {
      guideChar = ".";
      console.log(chalk.underline(title));
      console.log('');

      tasks.sort().forEach(printTask);
      console.log('');
    };

    const tasks = Object.keys(gulp.tasks).reduce((a, t) => {
      let k;
      if (t.match(/(^\.)|([$~])/)) {
        k = "hidden";
      } else if (t.match(/^[a-zA-Z_0-9]+$/)) {
        k = "primary";
      } else {
        k = "other";
      }
      a[k] = a[k] || [];
      a[k].push(t);
      return a;
    }, {});

    if (tasks.primary) {
      showTasks('Primary tasks', tasks.primary);
    }

    if (tasks.other) {
      showTasks('Other tasks', tasks.other);
    }

    if (tasks.hidden && showAllTasks) {
      showTasks('Hidden tasks', tasks.hidden);
    }

    if (afterPrintCallback) {
      afterPrintCallback(gulp.tasks);
    }
  }, options);

  // do not add default task if one already exists
  if (gulp.tasks['default'] === undefined) {
    gulp.task('default', false, ['help']);
  }

  return gulp;
};
