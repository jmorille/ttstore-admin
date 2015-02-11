'use strict';
var gulp            = require('gulp');

// Lint
var jshint = require('gulp-jshint');
var stylish = require('jshint-stylish');

// Build
var clean = require('gulp-clean');
var sass = require('gulp-sass');
var vulcanize = require('gulp-vulcanize');


// Config
var path = {
  app: 'app',
  build: 'build',
  dist: 'dist',
  sources: ['app/elements/**/*.html', 'app/scripts/{,*/}*.js'],
  sass: ['**/*.{scss,sass}', '!bower_components/**' ],
  sass_not: ['**', '!**/*.{scss,sass}' ]
};

// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~
// DEFAULT FOR 'gulp' COMMAND
// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~
gulp.task('default', ['lint'] );

gulp.task('clean', function () {
  return gulp.src([path.build, path.dist], {read: false})
    .pipe(clean()); // Delete dist and build to allow for nice, clean files!
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
  gulp.src(path.sass, {cwd: path.app })
    .pipe(sass())
    .pipe(gulp.dest(path.build ));

  gulp.src(path.sass_not, {cwd: path.app})
    .pipe(gulp.dest(path.build ) );

});

// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~
// Vulcanize TASKS
// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~
gulp.task('vulcanize', function () {
  var DEST_DIR = path.dist;

  return gulp.src(  'index.html', {cwd: path.build })
    .pipe(vulcanize({
      dest: DEST_DIR,
      strip: false,
      inline: true,
      csp: true
    }))
    .pipe(gulp.dest(DEST_DIR));
});


// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~
// Chrome App TASKS
// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~
gulp.task('cca-create', function(cb) {
  gulp
    .src('.').pipe(exec('cca create spa-mobile --link-to=spa-dist/manifest.json', function (err, stdout, stderr) {
      console.log(stdout);
      console.log(stderr);
      cb(err);
    }));
});
