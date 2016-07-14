# electrode-gulp-load-tasks

Load gulp tasks from an object spec.

## Usage

Install:

```
npm install @walmart/electrode-gulp-load-tasks --save-dev
```

## API

```js
gulpLoadTasks( gulp, tasks )
```

***gulp*** - pass in gulp instance.  If not provided, then it's attempted with `require("gulp")`.

***tasks*** - should follow the spec below:

```js
{
    "task1-name": data,
    "task2-name": data
}
```

Where `data` can be a `function`, `array`, or `object`.

### function

If it's a ***function***, it's passed to gulp like this.

```
gulp.task( taskName, description, data );
```

> The description support is added with the module [gulp-help]

If `taskName` starts with `~` then the description is `false` and disabled, else it's an empty string `""`.


### array

If it's an ***array***, it specifies a list of sequential tasks. 

Example: `[ "task1", "task2", [ "p-task1", "p-task2" ], "task3" ]`

`task1` and `task2` are executed in sequence first, and then `p-task1` and `p-task2` are executed in parallel, and finally `task3`.

> The sequential execution support is from [run-sequence].

It's passed to [run-sequence] like this, with ***description*** being a stringified copy of the array.

```
gulp.task( taskName, description, () => {
    runSequence.use(gulp).apply(null, data);
});
```

### object

If it's an ***object***, it should follow this spec:

```js
{
    name: "task-name",     // optional - use this instead of the key field for task name
    dep: array,            // optional - list of dependent tasks - follow definition above
    desc: "description",   // optional
    task: function | array // follow the definitions above
}
```

> When adding the task to gulp, description is the field `desc` or `""`

The `dep` array is add to gulp like this.  It creates a new task using the same name with a postfix `$deps$`.

```js
gulp.task( `${taskName}$deps$`, false, () => runSequence.use(gulp).apply(null, data.dep) );
```

[gulp-help]: https://github.com/chmontgomery/gulp-help
[run-sequence]: https://github.com/OverZealous/run-sequence
