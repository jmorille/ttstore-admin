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

// Dist Packaging
var gzip   = require('gulp-gzip');
var zip = require('gulp-zip');


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
  build_generated: 'build/generated',
  build_vulcanized: 'build/vulcanized',
  build_cca: 'build/cca',
  dist: 'dist',
  dist_web: 'dist/web',
  dist_ca: 'dist/ca',
  dist_cca_android: 'dist/cca_android',
  dist_cca_ios: 'dist/cca_ios',
  src_polymer: ['app/elements/**/*.html'],
  sources: ['app/elements/**/*.html', 'app/scripts/{,*/}*.js'],
  sass: ['**/*.{scss,sass}', '!bower_components/**'],
  sass_not: ['**', '!**/*.{scss,sass}']
};

var src = {
  bower_components: 'bower_components{,/**/*}',
  sass: '**/*.{scss,sass}',
  polymer_elements: 'elements{,/**/*}'
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
  del(['app/**/*.css', notGlob('app/' + src.bower_components)], cb);
});


gulp.task('build', ['vulcanize', 'cp'], function (cb) {
  return runSequence('vulcanize', cb);
});

// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~
// Copy COMMAND to Generated
// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~
var config_cp = {
  src_patch: ['**', notGlob(src.sass), notGlob(src.bower_components), notGlob(src.polymer_elements)]
}

gulp.task('cp', function (cb) {
  var DEST_DIR = path.build_vulcanized;
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
  var DEST_DIR = path.app;
  var SASS_OPTS = {
    sourceComments: !prod,
    outputStyle: prod ? 'compressed' : 'nested'
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
  var DEST_DIR = path.build_vulcanized;
  return gulp.src('index.html', {cwd: path.app, base: path.app})
    .pipe(vulcanize({
      dest: DEST_DIR,
      strip: prod,
      inline: true,
      csp: true
    }))
    .pipe(gulp.dest(DEST_DIR));
});


gulp.task('vulcanize:watch', ['vulcanize'], function (cb) {
  gulp.watch(src.polymer_elements, {cwd: path.app}, ['vulcanize']);
  cb();
});

// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~
//  Chrome App TASKS
// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~


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
// Watch TASKS
// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~
gulp.task('watch', ['cp:watch', 'sass:watch', 'vulcanize:watch']);


// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~
// Browsers TASKS
// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~
var server = {
  host: 'localhost',
  port: '8001'
}

gulp.task('webserver', ['watch'], function () {
  return gulp.src(path.build_vulcanized)
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


// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~',
// Chrome App Mobile TASKS
// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~

gulp.task('cca:check', function () {
  return gulp.src('.', {read: false})
    .pipe(shell(['cca checkenv']));
});

gulp.task('cca:create', function () {
  var cca_action = ' --link-to=';
  //var cca_action = ' --copy-from=';
  return gulp.src('.')
    .pipe(shell(['cca checkenv', 'cca create ' + path.build_cca + cca_action + path.build_vulcanized + '/manifest.json']));
});

gulp.task('cca:prepare', function () {
  return gulp.src('*', {read: false, cwd: path.build_cca})
    .pipe(shell(['cca prepare'], {cwd: path.build_cca}));
});


gulp.task('cca:push', function () {
  return gulp.src('*', {read: false, cwd: path.build_cca})
    .pipe(shell(['cca push'], {cwd: path.build_cca}));
});


gulp.task('cca:dist-generated', function () {
  var releaseOpts = prod ? ' --release' : '';
  return gulp.src('*', {read: false, cwd: path.build_cca})
    .pipe(shell(['cca build' + releaseOpts], {cwd: path.build_cca}));
});




// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~',
// Dist TASKS
// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~

gulp.task('dist', ['dist:web', 'dist:ca', 'dist:cca']);

gulp.task('dist:web', function (cb) {
  var DEST_DIR = path.dist_web;
  var gzipOptions = {};
  var gzipGlob = '**/*.{html,xml,json,css,js}';
  gulp.src([gzipGlob], { cwd: path.build_vulcanized, base: path.build_vulcanized})
    .pipe(debug({title: 'web dist :'}))
    .pipe(gzip(gzipOptions))
    .pipe(gulp.dest(DEST_DIR));
  gulp.src(['**', notGlob(gzipGlob) ], { cwd: path.build_vulcanized, base: path.build_vulcanized})
    .pipe(debug({title: 'web dist gzip :'}))
    .pipe(gzip(gzipOptions))
    .pipe(gulp.dest(DEST_DIR));
  cb();
});

gulp.task('dist:ca', function (cb) {
  var DEST_DIR = path.dist_ca;
  gulp.src(['**'], { cwd: path.build_vulcanized, base: path.build_vulcanized})
    .pipe(debug({title: 'ca dist :'}))
    .pipe(zip('chromeapp.zip'))
    .pipe(gulp.dest(DEST_DIR));
  cb();
});


gulp.task('dist:cca', ['cca:dist-generated'], function (cb) {
  gulp.src('platforms/android/build/outputs/**/*.apk', { cwd: path.build_cca})
    .pipe(debug({title: 'android dist :'}))
    .pipe(gulp.dest(path.dist_cca_android));
  gulp.src('platforms/ios/*.xcodeproj', { cwd: path.build_cca})
    .pipe(debug({title: 'android dist :'}))
    .pipe(gulp.dest(path.dist_cca_ios));
  cb();
});
