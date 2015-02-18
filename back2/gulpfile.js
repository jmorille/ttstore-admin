'use strict';
var gulp = require('gulp');
var $ = require('gulp-load-plugins')();

// Lint
//var jshint = require('gulp-jshint');
//var stylish = require('jshint-stylish');

// Cache
var cache = require('gulp-cached'),
  remember = require('gulp-remember'),
 // newer = require('gulp-newer'),
  changed = require('gulp-changed');

// Build
var del = require('del');
var runSequence = require('run-sequence');
//var imagemin = require('gulp-imagemin');
//var sass = require('gulp-sass');
//var autoprefixer = require('gulp-autoprefixer');
//var vulcanize = require('gulp-vulcanize');

// Debug
var debug = require('gulp-debug');
//var sourcemaps = require('gulp-sourcemaps');

// Command line conf
var gutil = require('gulp-util'),
  prod = gutil.env.prod;

// Browser reload
var livereload = require('gulp-livereload');
//var webserver = require('gulp-webserver');
//var opn = require('opn');
var source = require('vinyl-source-stream');
var buffer = require('vinyl-buffer');
//var watchify = require('watchify');
//var browserify = require('browserify');

// Mobile
//var shell = require('gulp-shell');

// Dist Packaging
//var gzip = require('gulp-gzip');
//var zip = require('gulp-zip');

//var rev = require('gulp-rev');
//var revReplace = require('gulp-rev-replace');


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
        acc = [].concat(acc, notelt);
      }
      return acc;
    }, []);
  }
};
var withNotGlob = function (include, excludes) {
  return [].concat.apply( [],  [].concat.call([], include, notGlob(excludes)) ) ;
};


// Config
var path = {
  app: 'app',
  build: 'build',
  build_generated: 'build/generated',
  build_vulcanized: 'build/vulcanized',
  build_cca: 'build/cca',
  build_cordova: 'build/cordova',
  dist: 'dist',
  dist_web: 'dist/web',
  dist_ca: 'dist/ca',
  dist_cca_android: 'dist/cca_android',
  dist_cca_ios: 'dist/cca_ios',
  sources: ['app/elements/**/*.html', 'app/scripts/{,*/}*.js']
};

//bower_components: ['bower_components{,/**/*}', '!bower_components{,/**/package.json,/**/bower.json,/**/index.html,/**/metadata.html,/**/*.md,/**/demo*,/**/demo**/**,/**/test,/**/test/**}'],
var src = {
  bower_components: ['bower_components{,/**}' ],
  images: ['**/*.{gif,jpg,jpeg,png}' ],
  sass: '**/*.{scss,sass}',
  polymer_elements: 'elements{,/*,/**/*.html,/**/*.css,/**/*.js}'
};

// TODO in module cf https://github.com/greypants/gulp-starter/tree/master/gulp/tasks

// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~
// DEFAULT FOR 'gulp' COMMAND
// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~
gulp.task('default', ['lint']);

gulp.task('clean', function (cb) {
  del([path.build, path.dist], cb); // Delete dist and build to allow for nice, clean files!
});

gulp.task('clean:css', function (cb) {
  del(withNotGlob([path.app + '/**/*.css'], [path.app + '/' + src.bower_components]), cb);
});

gulp.task('build', function (cb) {
  return runSequence('clean', ['cp', 'images'], 'vulcanize', cb);
});


// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~
// Watch TASKS
// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~
// , 'sass:watch'
gulp.task('watch', ['cp:watch', 'images:watch', 'vulcanize:watch'], function (done) {
//  livereload.listen();
  $.livereload.listen();
  done();
});


// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~
// Copy COMMAND to Generated
// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~
var config_cp = {
  cp_glob: withNotGlob(['**'], [src.sass, src.bower_components, src.polymer_elements, src.images]),
  img_glob:  withNotGlob([src.images], [src.bower_components])
}


gulp.task('cp', function (cb) {
  var DEST_DIR = path.build_vulcanized;
  return gulp.src(config_cp.cp_glob, {cwd: path.app, base: path.app})
    .pipe(cache('cping', {optimizeMemory: true}))
    .pipe(changed(DEST_DIR))
    .pipe(debug({title: 'cp changed:'}))
    .pipe(gulp.dest(DEST_DIR));
});




gulp.task('cp:watch', ['cp'], function (cb) {
  gulp.watch(config_cp.cp_glob, {cwd: path.app}, ['cp'])
//    .on('change', livereload.changed)
    ;
  cb();
});

// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~
// Images TASKS
// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~

gulp.task('images', function (cb) {
  var DEST_DIR = path.build_vulcanized;
  return gulp.src(config_cp.img_glob, {cwd: path.app, base: path.app})
    .pipe(cache('imaging'))
    .pipe(changed(DEST_DIR))
    .pipe(debug({title: 'img changed:'}))
    .pipe($.imagemin({
      progressive: true,
      interlaced: true
    }))
    .pipe(gulp.dest(DEST_DIR));
});

gulp.task('images:watch', ['images'], function (cb) {
  gulp.watch(config_cp.img_glob, {cwd: path.app}, ['images']);
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
    .pipe(debug({title: 'sass changed:'}))
    //.pipe($.sourcemaps.init())
    .pipe($.sass(SASS_OPTS))
    // Pass the compiled sass through the prefixer with defined
    .pipe($.autoprefixer({
      browsers: ['last 2 versions'],
      cascade: !prod
    }))
    //.pipe($.sourcemaps.write())
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
    .pipe($.vulcanize({
      dest: DEST_DIR,
      abspath: path.app,
      strip: prod,
      inline: true,
      csp: true,
      "excludes": {
        "styles": [
          "/styles/main.css"
        ]
      }
    }))

    .pipe(gulp.dest(DEST_DIR))
   ;
});


gulp.task('vulcanize:watch', ['vulcanize'], function (cb) {
  gulp.watch(src.polymer_elements, {cwd: path.app}, ['vulcanize'])
    .on('change', $.livereload.changed)
    //.on('change', $.livereload.changed)
  ;
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
// Browsers TASKS
// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~
var server = {
  host: 'localhost',
  port: '9000'
}

gulp.task('webserver', ['watch'], function () {
  return gulp.src(path.build_vulcanized)
    .pipe($.webserver({
      host: server.host,
      port: server.port,
      livereload: true,
      directoryListing: false,
      open: gutil.env.open
    }));
});

gulp.task('connect',  function () {
  var serveStatic = require('serve-static');
  var serveIndex = require('serve-index');
  var app = require('connect')()
    .use(require('connect-livereload')({port: 35729}))
//    .use(serveStatic('.tmp'))
    .use(serveStatic(path.app))
    // paths to bower_components should be relative to the current file
    // e.g. in app/index.html you should use ../bower_components
  //  .use('/bower_components', serveStatic('bower_components'))
    .use(serveIndex(path.app));

  require('http').createServer(app)
    .listen(9000)
    .on('listening', function () {
      console.log('Started connect web server on http://' +server.host +  ':' + server.port );
    });
});

gulp.task('serve', ['connect', 'watch'], function () {
  return require('opn')('http://' + server.host + ':' + server.port);
});


// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~
// Lint TASKS
// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~
gulp.task('lint', function () {
  return gulp.src(path.sources)
    .pipe($.jshint.extract('auto'))
    .pipe($.jshint())
    .pipe($.jshint.reporter('jshint-stylish'));
});


// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~',
// Chrome App Mobile TASKS
// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~

gulp.task('cca:check', function () {
  return gulp.src('.', {read: false})
    .pipe($.shell(['cca checkenv']));
});


gulp.task('cca:create', ['cca:check'], function () {
  var cca_action = ' --link-to=';
  //var cca_action = ' --copy-from=';
  return gulp.src('.')
    .pipe(debug({title: 'cca create :'}))
    .pipe($.shell(['cca checkenv', 'cca create ' + path.build_cca + cca_action + path.build_vulcanized + '/manifest.json'], {ignoreErrors: true}));
});

gulp.task('cca:prepare', function () {
  return gulp.src('*', {read: false, cwd: path.build_cca})
    .pipe($.shell(['cca prepare'], {cwd: path.build_cca}));
});


gulp.task('cca:push', function () {
  return gulp.src('*', {read: false, cwd: path.build_cca})
    .pipe($.shell(['cca push --watch'], {cwd: path.build_cca}));
});


gulp.task('cca:dist-generated', ['cca:create'], function () {
  var releaseOpts = prod ? ' --release' : '';
  return gulp.src('*', {read: false, cwd: path.build_cca})
    .pipe($.shell(['cca build' + releaseOpts], {cwd: path.build_cca}));
});


// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~',
// Cordova App Mobile TASKS
// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~
gulp.task('cordova:create',  function () {
  var cca_action = ' --link-to=';
  //var cca_action = ' --copy-from=';
  return gulp.src('.')
    .pipe(debug({title: 'cordova create :'}))
    .pipe($.shell(['cordova create ' + path.build_cordova + cca_action + path.build_vulcanized  ], {ignoreErrors: true}));
});


// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~',
// Dist TASKS
// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~

gulp.task('dist', function (cb) {
  return runSequence('build', ['dist:web', 'dist:ca', 'dist:cca'] , cb);
});

gulp.task('dist:web', function (cb) {
  var DEST_DIR = path.dist_web;
  var gzipOptions = {};
//  var gzipGlob = '**/*.{html,xml,json,css,js}';
  var gzipGlob = ['**/*'];
  gulp.src(gzipGlob, {cwd: path.build_vulcanized, base: path.build_vulcanized})
    .pipe(debug({title: 'web dist :'}))
//    .pipe($.rev())
//    .pipe($.revReplace())
      .pipe($.gzip(gzipOptions))
    .pipe(gulp.dest(DEST_DIR));
  //gulp.src(['**', notGlob(gzipGlob)], {cwd: path.build_vulcanized, base: path.build_vulcanized})
  //  .pipe(debug({title: 'web dist gzip :'}))
  //  .pipe($.gzip(gzipOptions))
  //  .pipe(gulp.dest(DEST_DIR));
  cb();
});

gulp.task('dist:ca', function (cb) {
  var DEST_DIR = path.dist_ca;
  gulp.src(['**'], {cwd: path.build_vulcanized, base: path.build_vulcanized})
    .pipe(debug({title: 'ca dist :'}))
    .pipe($.if('**/manifest.json', $.replace(/"\/scripts\/ca_chromereload\.js",/g, '')))
    .pipe(gulp.dest(DEST_DIR))
    .pipe($.size({title: 'Uncompressed'}))
    .pipe($.zip('chromeapp.zip'))
    .pipe($.size({title: 'Zip Compressed'}))
    .pipe(gulp.dest(path.dist));
  cb();
});


gulp.task('dist:cca', ['cca:dist-generated'], function (cb) {
  gulp.src('platforms/android/build/outputs/**/*.apk', {cwd: path.build_cca})
    .pipe(debug({title: 'android dist :'}))
    .pipe($.flatten())
    .pipe(gulp.dest(path.dist_cca_android));
  gulp.src('platforms/ios/*.xcodeproj', {cwd: path.build_cca})
    .pipe(debug({title: 'android dist :'}))
    .pipe(gulp.dest(path.dist_cca_ios));
  cb();
});
