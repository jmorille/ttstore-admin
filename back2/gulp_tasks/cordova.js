'use strict';
// gulp
var gulp = require('gulp');

// config
var paths = gulp.paths;

// plugins
var $ = require('gulp-load-plugins')();

// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~
// Cordova App Mobile TASKS
// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~

// Cordova Mobile - Create Project
gulp.task('cordova:create', ['build'], function () {
  var ccaAction = ' --link-to=';
  //var ccaAction = ' --copy-from=';
  return gulp.src('.')
    .pipe($.shell(['cordova create ' + paths.buildCordova + ccaAction + paths.buildVulcanized], {ignoreErrors: true}));
});

// Cordova Mobile - Config Project
gulp.task('cordova:config', ['cordova:create'], function () {
  var configPlateform = 'android';
  return gulp.src('*', {read: false, cwd: paths.buildCordova})
    .pipe($.shell(['cordova platform add ' + configPlateform], {cwd: paths.buildCordova, ignoreErrors: true}));
});


// Cordova Mobile - Build (in ./build folder)
gulp.task('cordova:build', ['cordova:config'], function () {
  var releaseOpts = prod ? ' --release' : '';
  return gulp.src('*', {read: false, cwd: paths.buildCordova})
    .pipe($.shell(['cordova build' + releaseOpts], {cwd: paths.buildCordova}));
});

// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~
// Dist TASKS
// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~


// Cordova Mobile - Distribution (in ./dist folder)
gulp.task('dist:cordova', ['cordova:build'], function (cb) {
  gulp.src('platforms/android/ant-build/**/*.apk', {cwd: path.buildCordova})
    .pipe(debug({title: 'android dist :'}))
    .pipe($.flatten())
    .pipe(gulp.dest(path.distCordovaAndroid));
  //gulp.src('platforms/ios/*.xcodeproj', {cwd: path.buildCordova})
  //  .pipe(debug({title: 'android dist :'}))
  //  .pipe(gulp.dest(path.distCcaIOS));
  cb();
});

