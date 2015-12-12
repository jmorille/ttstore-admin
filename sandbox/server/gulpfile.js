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

// LiveRlead
var nodemon = require('gulp-nodemon'),
  livereload = require('gulp-livereload');

// Config
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
    .pipe(gulp.dest(DEST_DIR));
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
// LiveReload
// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~
gulp.task('serve', function () {
  livereload.listen();
  nodemon({
    script: 'src/server.js'
    , ext: 'js'
    , env: { ES_ADDR: 'localhost' }
  }).on('restart', function () {
    setTimeout(function () {

      livereload.changed(__dirname);
    }, 500);
  });
});


// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~
// Build
// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~
gulp.task('build', ['cp:package', 'cp:src']);

gulp.task('dist', ['clean'], function (cb) {
  gulp.run('build');
  cb();
});

// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~
// Docker TASKS
// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~
var dockerOpt = {
  namespace: 'jmorille',
  image: 'ttstore-back-server',
  registryHost: '178.255.97.203:5000'
};


gulp.task('build:docker', ['build'], function () {
  var DEST_DIR = path.dist;
  return gulp.src('docker/Dockerfile')
    .pipe(cache('Dockerfile'))
    .pipe(debug({title: 'docker :'}))
    .pipe(gulp.dest(DEST_DIR))
    .pipe($.shell(['docker build --rm -t ' + dockerOpt.namespace + '/' + dockerOpt.image + ' .'], {
      cwd: path.dist,
      ignoreErrors: false
    }));
});


gulp.task('dist:docker', ['build:docker'], function () {
  var DEST_DIR = path.dist + '/docker-server';
  var DEST_TAR = dockerOpt.image + '.tar';
  return gulp.src('docker/README.md')
    .pipe(gulp.dest(DEST_DIR))
    .pipe($.shell(['docker save --output ' + DEST_TAR + ' ' + dockerOpt.namespace + '/' + dockerOpt.image], {
      cwd: DEST_DIR,
      ignoreErrors: false
    }));
});


gulp.task('release:docker', ['build:docker'], function () {
  // Config Tag
  var fs = require('fs');
  var packageJson = JSON.parse(fs.readFileSync('package.json'));
  var dockerLocalName = dockerOpt.namespace + '/' + dockerOpt.image;
  var dockerRegistryName = dockerOpt.registryHost + '/' + dockerOpt.image;
  var dockerVersion = packageJson.version;
  // Call Docker Cmd
  return gulp.src('Dockerfile', {read: false, cwd: path.dist})
    .pipe($.shell(['docker tag -f ' + dockerLocalName + ' ' + dockerRegistryName + ':latest'], {cwd: path.dist}))
    .pipe($.shell(['docker tag -f ' + dockerLocalName + ' ' + dockerRegistryName + ':' + dockerVersion], {cwd: path.dist}))
    .pipe($.shell(['docker push ' + dockerRegistryName], {cwd: path.dist, ignoreErrors: false}));

});

