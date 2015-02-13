'use strict';
var gulp = require('gulp');

// Lint
var jshint = require('gulp-jshint');
var stylish = require('jshint-stylish');

// Cache
var cache = require('gulp-cached'),
  remember = require('gulp-remember'),
  newer = require('gulp-newer'),
  changed = require('gulp-changed');

// Build
var del = require('del');
var runSequence = require('run-sequence');
var sass = require('gulp-sass');
//var prefix = require('gulp-autoprefixer');
var vulcanize = require('gulp-vulcanize');

// Command line conf
var gutil = require('gulp-util'),
  prod = gutil.env.prod;

// Browser reload
var webserver = require('gulp-webserver');
var opn = require('opn');

//var browserify = require('browserify');


// Mobile
var shell = require('gulp-shell');
var debug = require('gulp-debug');

// Config
var path = {
  app: 'app',
  src_chromeapp: 'chromeapp',
  build_web: 'build/web',
  build_chromeapp: 'build/chromeapp',
  build_cca: 'build/cca',
  dist: 'dist',
  src_polymer: ['app/elements/**/*.html'],
  sources: ['app/elements/**/*.html', 'app/scripts/{,*/}*.js'],
  sass: ['**/*.{scss,sass}', '!bower_components/**'],
  sass_not: ['**', '!**/*.{scss,sass}']
};

// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~
// DEFAULT FOR 'gulp' COMMAND
// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~
gulp.task('default', ['lint']);

gulp.task('clean', ['clean:css'], function (cb) {
  del(['build', 'dist'], cb); // Delete dist and build to allow for nice, clean files!
});

gulp.task('clean:css', function (cb) {
  del(['app/**/*.css', '!app/bower_components/**/*.*'], cb);
});


gulp.task('build', function (cb) {
  return runSequence('sass', 'vulcanize', cb);
});


// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~
// Browsers TASKS
// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~
var server = {
  host: 'localhost',
  port: '8001'
}

gulp.task('webserver', ['watch'], function () {
  return gulp.src(path.build_web)
    .pipe(webserver({
      host: server.host,
      port: server.port,
      livereload: true,
      directoryListing: false,
      open: gutil.env.open
    }));
});

gulp.task('openbrowser', function () {
  return opn('http://' + server.host + ':' + server.port);
});


// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~
// Lint TASKS
// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~
gulp.task('lint', function () {
  return gulp.src(path.sources)
    .pipe(jshint.extract('auto'))
    .pipe(jshint())
    .pipe(jshint.reporter('jshint-stylish'));
});


// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~
// Saas TASKS
// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~

gulp.task('sass', function () {
  var DEST_DIR = path.app;
  var SASS_OPTS = prod ? {outputStyle: 'compressed'} : {};
  return gulp.src(path.sass, {cwd: path.app})
    //  .pipe(cache('sassing', {optimizeMemory: true}))
    //  .pipe(changed(DEST_DIR, {extension: '.css'}))
    .pipe(sass(SASS_OPTS))
    // Pass the compiled sass through the prefixer with defined
    //.pipe(prefix(
    //  'last 2 version', 'safari 5', 'ie 8', 'ie 9', 'opera 12.1', 'ios 6', 'android 4'
    //))
    .pipe(gulp.dest(DEST_DIR));
  //gulp.src(path.sass_not, {cwd: path.app}).pipe(gulp.dest(DEST_DIR));


});

// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~
// Vulcanize TASKS
// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~
gulp.task('vulcanize', function () {
  var DEST_DIR = path.build_web;
  return gulp.src('index.html', {cwd: path.app})
//    .pipe(cache('vulcanizing', {optimizeMemory: true}))
//    .pipe(changed(DEST_DIR))
    .pipe(vulcanize({
      dest: DEST_DIR,
      strip: prod,
      inline: true,
      csp: true
    }))
    .pipe(gulp.dest(DEST_DIR));
});


// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~
// Watch TASKS
// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~
gulp.task('watch', ['sass', 'vulcanize'], function (cb) {
  gulp.watch(path.sass, ['sass', 'vulcanize']);
  gulp.watch(path.src_polymer, ['vulcanize']);
  cb();
});


// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~
//  Chrome App TASKS
// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~
gulp.task('chromeapp:cp', function () {
  return gulp.src(path.src_chromeapp + "/**")
    .pipe(gulp.dest(path.build_web));
});

// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~
// Chrome App Mobile TASKS
// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~

gulp.task('cca:check', function () {
  return gulp.src('.', {read: false})
    .pipe(shell(['cca checkenv']));
});

gulp.task('cca:create', function (cb) {
  var cca_action = ' --link-to=';
  //var cca_action = ' --copy-from=';
  gulp.src('.')
    .pipe(shell(['cca checkenv', 'cca create ' + path.build_cca + cca_action + path.build_web + '/manifest.json']));
});

gulp.task('cca:prepare', function () {
  return gulp.src('*', {read: false, cwd: path.build_cca})
    .pipe(shell(['cca prepare'], {cwd: path.build_cca}));
});



gulp.task('cca:push', function () {
  return gulp.src('*', {read: false, cwd: path.build_cca})
    .pipe(shell(['cca push'], {cwd: path.build_cca}));
});


gulp.task('cca:build', function () {
  return gulp.src('*', {read: false, cwd: path.build_cca})
    .pipe(shell(['cca build ios'], {cwd: path.build_cca}));
});

