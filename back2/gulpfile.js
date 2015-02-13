'use strict';
var gulp = require('gulp');

// Lint
var jshint = require('gulp-jshint');
var stylish = require('jshint-stylish');

// Cache
var cache = require('gulp-cached'),
  remember = require('gulp-remember');

// Build
var clean = require('gulp-clean');
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

// Mobile
var exec = require('gulp-exec');
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

gulp.task('clean', ['clean:css'], function () {
  return gulp.src(['build', 'dist'], {read: false})
    .pipe(clean()); // Delete dist and build to allow for nice, clean files!
});

gulp.task('clean:css', function () {
  return gulp.src(['app/**/*.css', '!app/bower_components/**/*.*'], {read: false}).pipe(clean());
});


gulp.task('build', function (callback) {
  return runSequence('sass', 'vulcanize', callback);
});

gulp.task('bb', ['sass', 'vulcanize']);

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
  var SASS_OPTS = prod ? { outputStyle: 'compressed'} : {};
  return gulp.src(path.sass, {cwd: path.app})
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
var consolePrinter = function (cb) {
  return function (err, stdout, stderr) {
    gutil.log(gutil.colors.cyan(stdout));
    gutil.log(gutil.colors.red(stderr));
    // console.log(stdout);
    // console.log(stderr);
    cb();
  };
};


gulp.task('cca:create', function (cb) {
  //var cca_action = ' --link-to=';
  var cca_action = ' --copy-from=';
  gulp.src('.')
    .pipe(exec('cca create ' + path.build_cca + cca_action + path.build_web + '/manifest.json', consolePrinter(cb) ));
});

gulp.task('cca:checkenv', function (cb) {
  gulp.src(path.build_cca)
    .pipe(exec('cca checkenv', consolePrinter(cb)));
});

gulp.task('cca:push', function (cb) {
  gulp.src(path.build_cca, {cwd: path.build_cca})
    .pipe(exec('cca push', consolePrinter(cb) ));
});


gulp.task('cca:build', function (cb) {
  gulp.src( '*', {read: false, cwd: path.build_cca+'/'})
    .pipe(debug({title: 'unicorn:'}))
    .pipe(exec('cca build android', consolePrinter(cb)));
});

gulp.task('pwd', function (cb) {
  gulp.src(path.build_cca, {cwd: path.build_cca})
    .pipe(exec('pwd', function (err, stdout, stderr) {
      gutil.log(stdout);
      gutil.log(gutil.colors.red(stderr));
      console.log('Current directory: ' + process.cwd());
      // console.log(stdout);
      // console.log(stderr);
      //cb(err);
    }));
});
gulp.task('shorthand', shell.task([
  'pwd',
  'ls ' + path.build_cca,
  'pwd'
], {cwd: path.build_cca}));
