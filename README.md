# electrode-gulp-helper [![NPM version][npm-image]][npm-url] [![Build Status][travis-image]][travis-url] [![Dependency Status][daviddm-image]][daviddm-url]

Helper functions for managing gulp tasks loading and executing.

## Usage

Install:

```
npm install electrode-gulp-helper --save-dev
```

```js
const gulpHelper = require("electrode-gulp-helper");

gulpHelper.loadTasks( tasks );
```

## API

### [loadTasks](#loadtasks)

```js
gulpHelper.loadTasks( tasks, gulp )
```

***gulp*** - pass in gulp instance.  If not provided, then it's attempted with `require("gulp")`.

***tasks*** - should follow the spec below:

```js
{
    "task1-name": taskData,
    "task2-name": taskData
}
```

Where [taskData](#taskdata) can be a `string`, `function`, `array`, or `object`.

### taskData

`taskData` specifies a task for gulp.  It can be a `string`, `function`, `array`, or `object`.

#### string

If it's a ***string***, then it's treated as a shell command and executed using [exec](#exec).

#### function

If it's a ***function***, then it's to be called by gulp when it executes the task.  It's passed to gulp like this.

```
gulp.task( taskName, description, taskData );
```

> The description support is added with the module [gulp-help]

If `taskName` starts with `.` then the description is `false` and disabled, else it's an empty string `""`.  You can specify description if you use [object](#object) for `taskData`. 


#### array

If it's an ***array***, it specifies a list of tasks or group of tasks in a subarray to be executed sequentially.  A group of tasks will be executed in parallel.

Example: `[ "task1", "task2", [ "p-task1", "p-task2" ], "task3" ]`

`task1` and `task2` are executed in sequence first, and then `p-task1` and `p-task2` are executed in parallel, and finally `task3`.

> The sequential execution support is from [run-sequence].

The array is passed to [run-sequence] like this, with ***description*** being a stringified copy of the array.

```
gulp.task( taskName, description, () => {
    runSequence.use(gulp).apply(null, taskData);
});
```

#### object

If it's an ***object***, it should follow this spec:

```js
{
    name: "task-name",   // optional - use this instead of the key field for task name
    dep: array,          // optional - list of dependent tasks - follow definition above
    desc: "description", // optional
    task: string|function|array // follow the definitions above
}
```

If the description field `desc` is `false`, then the task is not listed in help.  If it's `undefined`, then `""` will be used.

The `dep` specified a dependent array of tasks following the [array spec](#array) above, to be executed before the actual task.  It is added to gulp like below, with a new delegate task using the same name with a postfix `$deps$`.

```js
gulp.task( `${taskName}$deps$`, false, () => runSequence.use(gulp).apply(null, taskData.dep) );
```

### [exec](#exec)

```js
gulpHelper.exec( shellCommand, [callback] );
```

Use [shelljs] `exec` to execute `shellCommand`.

If callback is provided, it will be called as follows:

`callback( code !== 0 ? new Error("...") : undefined, { stdout, stderr } )`

`stdout` and `stderr` is also set in the error object.

If no callback is provided, it will return a Promise that rejects with the error or resolve with `{ stdout, stderr }`.

### [envPath.addToFront](#envpathaddtofront)

```js
gulpHelper.envPath.addToFront(path);
```

Add `path` to the front of `process.env.PATH`.  If it already exist, then it's moved to the front.

### [envPath.addToEnd](#envpathaddtoend)

```js
gulpHelper.envPath.addToEnd(path);
```

Add `path` to the end of `process.env.PATH`.  If it already exist, then it's moved to the end.

### [envPath.add](#envpathadd)

```js
gulpHelper.envPath.add(path);
```

If `path` doesn't exist in `process.env.PATH` then it's added to the end.


[gulp-help]: https://github.com/chmontgomery/gulp-help
[run-sequence]: https://github.com/OverZealous/run-sequence
[shelljs]: https://github.com/shelljs/shelljs
[npm-image]: https://badge.fury.io/js/electrode-gulp-helper.svg
[npm-url]: https://npmjs.org/package/electrode-gulp-helper
[travis-image]: https://travis-ci.org/electrode-io/electrode-gulp-helper.svg?branch=master
[travis-url]: https://travis-ci.org/electrode-io/electrode-gulp-helper
[daviddm-image]: https://david-dm.org/electrode-io/electrode-gulp-helper.svg?theme=shields.io
[daviddm-url]: https://david-dm.org/electrode-io/electrode-gulp-helper
