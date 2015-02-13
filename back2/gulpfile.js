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
  prod  = gutil.env.prod;

// Browser reload
var webserver = require('gulp-webserver');
var opn       = require('opn');

// Mobile
var exec = require('gulp-exec');

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
  return gulp.src(['app/**/*.css'], {read: false}) .pipe(clean());
});




gulp.task('build', function(callback) {
  runSequence('sass',  'vulcanize',  callback);
});


// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~
// Browsers TASKS
// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~
var server = {
  host: 'localhost',
  port: '8001'
}

gulp.task('webserver', ['watch'], function() {
  gulp.src(path.build_web)
    .pipe(webserver({
      host:             server.host,
      port:             server.port,
      livereload: true,
      directoryListing: false,
      open: gutil.env.open
    }));
});

gulp.task('openbrowser', function() {
  opn( 'http://' + server.host + ':' + server.port );
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
  var SASS_OPTS = prod ? {
    outputStyle: 'compressed',
    sourceComments: 'map'
  } : {};
  gulp.src(path.sass, {cwd: path.app})
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
    .pipe(gulp.dest(DEST_DIR)) ;
});

// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~
// CCA TASKS
// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~
gulp.task('chromeapp:cp', function () {
 return gulp.src(path.src_chromeapp+"/**")
   .pipe(gulp.dest(path.build_web)) ;
});

// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~
// Watch TASKS
// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~
gulp.task('watch',  [ 'sass', 'vulcanize'], function () {
  gulp.watch(path.sass, ['sass', 'vulcanize']);
  gulp.watch(path.src_polymer, ['vulcanize']);

});



// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~
// Chrome App Mobile TASKS
// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~
gulp.task('cca:create', function (cb) {
  var cca_action = ' --link-to=';
  //var cca_action = ' --copy-from=';
  gulp.src('.')
    .pipe(exec('cca create '+ path.build_cca + cca_action + path.build_web +  '/manifest.json', function (err, stdout, stderr) {
      gutil.log(  gutil.colors.cyan(stdout));
      gutil.log(  gutil.colors.red(stderr));
     // console.log(stdout);
    // console.log(stderr);
      cb(err);
    }));
});

gulp.task('cca:checkenv', function (cb) {
  gulp.src( path.build_cca)
    .pipe(exec('cca checkenv', function (err, stdout, stderr) {
      gutil.log(  stdout);
      gutil.log(  gutil.colors.red(stderr));
      // console.log(stdout);
      // console.log(stderr);
      cb(err);
    }));
});

gulp.task('cca:push', function (cb) {
  gulp.src( path.build_cca , {cwd: path.build_cca } )
    .pipe(exec('cca push', function (err, stdout, stderr) {
      gutil.log(  stdout);
      gutil.log(  gutil.colors.red(stderr));
      // console.log(stdout);
      // console.log(stderr);
      cb(err);
    }));
});

gulp.task('cca:build', function (cb) {
  gulp.src( path.build_cca , {cwd: path.build_cca } )
    .pipe(exec('cca build android', function (err, stdout, stderr) {
      gutil.log(  stdout);
      gutil.log(  gutil.colors.red(stderr));
      // console.log(stdout);
      // console.log(stderr);
      cb(err);
    }));
});
