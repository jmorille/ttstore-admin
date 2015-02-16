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
var autoprefixer = require('gulp-autoprefixer');
var vulcanize = require('gulp-vulcanize');

// Debug
var debug = require('gulp-debug');
var sourcemaps = require('gulp-sourcemaps');

// Command line conf
var gutil = require('gulp-util'),
  prod = gutil.env.prod;

// Browser reload
var webserver = require('gulp-webserver');
var opn = require('opn');
var source = require('vinyl-source-stream');
var buffer = require('vinyl-buffer');
var watchify = require('watchify');
var browserify = require('browserify');

// Mobile
var shell = require('gulp-shell');


var notGlob = function (elt) {
  if (!elt) {
    return undefined;
  }
  if ('string' === typeof elt) {
    if ('!' === elt.slice(0, 1)) {
      return elt.slice(1);
    } else {
      return '!' + elt;
    }
  } else if (Array.isArray(elt)) {
    return elt.reduce(function (acc, current) {
      var notelt = notGlob(current);
      if (notelt) {
        acc.push(notelt);
      }
      return acc;
    }, []);
  }
};

// Config
var path = {
  app: 'app',
  src_chromeapp: 'chromeapp',
  build_generated: 'build/generated',
  build_web: 'build/web',
  build_chromeapp: 'build/chromeapp',
  build_cca: 'build/cca',
  dist: 'dist',
  src_polymer: ['app/elements/**/*.html'],
  sources: ['app/elements/**/*.html', 'app/scripts/{,*/}*.js'],
  sass: ['**/*.{scss,sass}', '!bower_components/**'],
  sass_not: ['**', '!**/*.{scss,sass}']
};

var src = {
  bower_components: 'bower_components{,/**}',
  sass: '**/*.{scss,sass}'
};

// TODO in module cf https://github.com/greypants/gulp-starter/tree/master/gulp/tasks

// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~
// DEFAULT FOR 'gulp' COMMAND
// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~
gulp.task('default', ['lint']);

gulp.task('clean', function (cb) {
  del(['build', 'dist'], cb); // Delete dist and build to allow for nice, clean files!
});

gulp.task('clean:css', function (cb) {
  del(['app/**/*.css',  notGlob(src.bower_components)] , cb);
});


gulp.task('build', ['sass', 'cp'], function (cb) {
  return runSequence(  'vulcanize', cb);
});

// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~
// Copy COMMAND to Generated
// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~
var config_cp = {
  src_patch: ['**', notGlob(src.sass)]
}

gulp.task('cp', function (cb) {
  var DEST_DIR = path.build_generated;
  return gulp.src(config_cp.src_patch, {cwd: path.app, base: path.app})
    .pipe(cache('cping', {optimizeMemory: true}))
    .pipe(changed(DEST_DIR))
    .pipe(debug({title: 'changed:'}))
    .pipe(gulp.dest(DEST_DIR));
});

gulp.task('cp:watch', ['cp'], function (cb) {
  gulp.watch(config_cp.src_patch, {cwd: path.app}, ['cp']);
  cb();
});


// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~
// Saas TASKS
// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~
gulp.task('sass', function () {
  var DEST_DIR = path.build_generated;
  var SASS_OPTS =  {
    sourceComments: !prod,
    outputStyle: prod ? 'compressed':'nested'
  }
  return gulp.src(src.sass, {cwd: path.app, base: path.app})
    .pipe(cache('sassing', {optimizeMemory: true}))
    .pipe(changed(DEST_DIR, {extension: '.css'}))
    .pipe(debug({title: 'changed:'}))
    .pipe(sourcemaps.init())
    .pipe(sass(SASS_OPTS))
    // Pass the compiled sass through the prefixer with defined
    .pipe(autoprefixer({
      browsers: ['last 2 versions'],
      cascade: !prod
    }))
    .pipe(sourcemaps.write())
    .pipe(gulp.dest(DEST_DIR));
});

gulp.task('sass:watch', ['sass'], function (cb) {
  gulp.watch(src.sass, {cwd: path.app}, ['sass']);
  cb();
});


// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~
// Vulcanize TASKS
// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~
gulp.task('vulcanize', function () {
  var DEST_DIR = path.build_web;
  return gulp.src('index.html', {cwd: path.build_generated})
    .pipe(cache('vulcanizing', {optimizeMemory: true}))
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
// Browserify TASKS
// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~

//var bundler = watchify(browserify('./src/index.js', watchify.args));
//// add any other browserify options or transforms here
//bundler.transform('brfs');
//
//gulp.task('js', bundle); // so you can run `gulp js` to build the file
//bundler.on('update', bundle); // on any dep update, runs the bundler
//
//function bundle() {
//  return bundler.bundle()
//    // log errors if they happen
//    .on('error', gutil.log.bind(gutil, 'Browserify Error'))
//    .pipe(source('bundle.js'))
//    // optional, remove if you dont want sourcemaps
//    .pipe(buffer())
//    .pipe(sourcemaps.init({loadMaps: true})) // loads map from browserify file
//    .pipe(sourcemaps.write('./')) // writes .map file
//    //
//    .pipe(gulp.dest('./dist'));
//}
//

// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~
// Browsers TASKS
// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~
var server = {
  host: 'localhost',
  port: '8001'
}

gulp.task('webserver', ['sass:watch', 'cp:watch'], function () {
  return gulp.src(path.build_generated)
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
    .pipe(shell(['cca push'], {cwsd: path.build_cca}));
});


gulp.task('cca:build', function () {
  return gulp.src('*', {read: false, cwd: path.build_cca})
    .pipe(shell(['cca build ios'], {cwd: path.build_cca}));
});

