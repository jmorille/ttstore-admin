'use strict';
var gulp = require('gulp');

// Lint
var jshint = require('gulp-jshint');
var stylish = require('jshint-stylish');


// Cache
var cache = require('gulp-cached'),
// newer = require('gulp-newer'),
  changed = require('gulp-changed');

// Debug
var debug = require('gulp-debug');

// Build
var del = require('del');
var install = require("gulp-install");
var $ = require('gulp-load-plugins')();


var path = {
  source: 'src',
  dist: 'dist',
  distServer: 'dist/server'
};

// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~
// DEFAULT FOR 'gulp' COMMAND
// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~
gulp.task('default', ['lint']);

// Clean all files
gulp.task('clean', function (cb) {
  del([path.dist], cb); // Delete dist and build to allow for nice, clean files!
});

// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~
// Lint TASKS
// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~
gulp.task('lint', function () {
  return gulp.src(path.sources)
    .pipe(jshint())
    .pipe(jshint.reporter('jshint-stylish'));
});

// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~
// Dist
// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~

gulp.task('cp:src', function () {
  var DEST_DIR = path.distServer;
  return gulp.src(path.source + '/**', {base: './'})
    .pipe(cache('source', {optimizeMemory: true}))
    .pipe(changed(DEST_DIR))
    .pipe(debug({title: 'source :'}))
    .pipe(gulp.dest(DEST_DIR))
});

gulp.task('cp:package', function () {
  var DEST_DIR = path.distServer;
  return gulp.src('package.json')
    .pipe(cache('package.json', {optimizeMemory: true}))
    .pipe(changed(DEST_DIR))
    .pipe(debug({title: 'source :'}))
    .pipe(gulp.dest(DEST_DIR))
    .pipe(install({production: true}));
});


// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~
// Docker TASKS
// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~
var dockerNamespace = 'jmorille';
var dockerProjectName = 'ttstore-back-server';
var dockerRegistryUrl = '127.0.0.1:5001';

gulp.task('build:docker', ['cp:package', 'cp:src'], function () {
  var DEST_DIR = path.dist;
  gulp.src('docker/Dockerfile')
    .pipe(cache('Dockerfile'))
    .pipe(debug({title: 'docker :'}))
    .pipe(gulp.dest(DEST_DIR))
    .pipe($.shell(['docker build --rm -t ' + dockerNamespace + '/' + dockerProjectName + ' .'], {
      cwd: path.dist,
      ignoreErrors: false
    }));
});


gulp.task('dist:docker', ['build:docker'], function () {
  // Config Tag
  var fs = require('fs');
  var packageJson = JSON.parse(fs.readFileSync('package.json'));
  var dockerLocalName = dockerNamespace + '/' + dockerProjectName;
  var dockerRegistryName = dockerRegistryUrl + '/' + dockerProjectName;
  var dockerVersion = packageJson.version;
  // Call Docker Cmd
  gulp.src('Dockerfile', {read: false, cwd: path.dist})
    //   .pipe($.shell(['docker tag ' + dockerLocalName + ' ' + dockerRegistryName + ':latest'], {cwd: path.dist}))
    .pipe($.shell(['docker tag ' + dockerLocalName + ' ' + dockerRegistryName + ':' + dockerVersion], {cwd: path.dist}))
    .pipe($.shell(['docker push ' + dockerRegistryName], {cwd: path.dist, ignoreErrors: false}));

});

