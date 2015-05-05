'use strict';
// gulp
var gulp = require('gulp');


// config
var paths = gulp.paths;
var prod = gulp.prod;

// plugins
var $ = require('gulp-load-plugins')();


// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~',
// Chrome App Mobile TASKS
// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~

// ChromeApp Mobile - Check Env configuration
gulp.task('cca:check', function () {
  return gulp.src('.', {read: false})
    .pipe($.shell(['cca checkenv']));
});


// ChromeApp Mobile - Create Project
gulp.task('cca:create', ['cca:check', 'build'], function () {
  var ccaAction = ' --link-to=';
  //var ccaAction = ' --copy-from=';
  return gulp.src('.')
    .pipe($.debug({title: 'cca create :'}))
    .pipe($.shell(['cca checkenv', 'cca create ' + paths.buildCCA + ccaAction + paths.buildVulcanized + '/manifest.json'], {ignoreErrors: true}));
});

// ChromeApp Mobile - Prepare for Build
gulp.task('cca:prepare', function () {
  return gulp.src('*', {read: false, cwd: paths.buildCCA})
    .pipe($.shell(['cca prepare'], {cwd: paths.buildCCA}));
});


// ChromeApp Mobile - Push to Mobile Device
gulp.task('cca:push', function () {
  return gulp.src('*', {read: false, cwd: paths.buildCCA})
    .pipe($.shell(['cca push --watch'], {cwd: paths.buildCCA}));
});

// ChromeApp Mobile - Build (in ./build folder)
gulp.task('cca:build', ['cca:create'], function () {
  var releaseOpts = prod ? ' --release' : '';
  return gulp.src('*', {read: false, cwd: paths.buildCCA})
    .pipe($.shell(['cca build' + releaseOpts], {cwd: paths.buildCCA}));
});

