'use strict';
// gulp
var gulp = require('gulp');

// config
var paths = gulp.paths;

// plugins
var $ = require('gulp-load-plugins')();

// packages



// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~
// Lint TASKS
// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~

// Lint - the sources App
gulp.task('lint', function () {
  return gulp.src(paths.sources, {cwd: paths.app})
    .pipe($.cached('appSrc'))
    .pipe($.jshint.extract('auto'))
    .pipe($.jshint())
    .pipe($.jshint.reporter('jshint-stylish'));
});

gulp.task('watch:lint', ['lint'], function (cb) {
  gulp.watch(paths.sources, {cwd: paths.app}, ['lint']);
  cb();
});


// Lint - the build script
gulp.task('lint:gulp', function () {
  return gulp.src('gulpfile.js')
    .pipe($.jshint())
    .pipe($.cached('gulpfile'))
    .pipe($.jshint.reporter('jshint-stylish'));
});

gulp.task('watch:lint:gulp', ['lint:gulp'], function (cb) {
  gulp.watch('gulpfile.js', ['lint:gulp']);
  cb();
});
