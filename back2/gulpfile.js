'use strict';
var gulp = require('gulp');
var $ = require('gulp-load-plugins')();
require('gulp-task-list')(gulp);
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
//var usemin = require('gulp-usemin');
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
var filter = require('gulp-filter');
var browserSync = require('browser-sync');
var browserSyncReload = browserSync.reload;

//var source = require('vinyl-source-stream');
//var buffer = require('vinyl-buffer');

// Mobile
//var shell = require('gulp-shell');

// Dist Packaging
//var gzip = require('gulp-gzip');
//var zip = require('gulp-zip');

//var rev = require('gulp-rev');
//var revReplace = require('gulp-rev-replace');

// Notification
var notifier = require('node-notifier');


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
  return [].concat.apply([], [].concat.call([], include, notGlob(excludes)));
};

var AUTOPREFIXER_BROWSERS = [
  'ie >= 10',
  'ie_mob >= 10',
  'ff >= 30',
  'chrome >= 34',
  'safari >= 7',
  'opera >= 23',
  'ios >= 7',
  'android >= 4.4',
  'bb >= 10'
];

// Config
var path = {
  app: 'app',
  sass: 'sass',
  build: 'build',
  buildMap: 'build/maps',
  buildVulcanized: 'build/vulcanized',
  buildCCA: 'build/cca',
  buildCordova: 'build/cordova',
  dist: 'dist',
  distWeb: 'dist/web',
  distCa: 'dist/ca',
  distCcaAndroid: 'dist/cca_android',
  distCordovaAndroid: 'dist/cordova_android',
  distCcaIOS: 'dist/cca_ios',
  sources: ['app/elements/**/*.html', 'app/scripts/{,*/}*.js']
};

//bower_components: ['bower_components{,/**/*}', '!bower_components{,/**/package.json,/**/bower.json,/**/index.html,/**/metadata.html,/**/*.md,/**/demo*,/**/demo**/**,/**/test,/**/test/**}'],
var src = {
  bowerComponents: ['bower_components{,/**}'],
  images: ['**/*.{gif,jpg,jpeg,png}'],
  sass: ['**/*.{scss,sass}', '!includes/**/*.*'],
  polymerElements: 'elements{,/*,/**/*.html,/**/*.css,/**/*.js}'
};

//TODO in module cf https://github.com/greypants/gulp-starter/tree/master/gulp/tasks

// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~
// DEFAULT FOR 'gulp' COMMAND
// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~
gulp.task('default', ['lint']);

// Help like command gulp --tasks
gulp.task('help', function () {
  return gulp.run('task-list');
});


// Clean all files
gulp.task('clean', function (cb) {
  del([path.build, path.dist], cb); // Delete dist and build to allow for nice, clean files!
});

// CLean css file
gulp.task('clean:css', function (cb) {
  del(withNotGlob([path.app + '/**/*.css'], [path.app + '/' + src.bowerComponents]), cb);
});

// Build app
gulp.task('build', function (cb) {
  return runSequence('clean', ['cp', 'images'], 'vulcanize', cb);
});


// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~
// Watch TASKS
// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~

var isErrorEatByWatch = false;


// Watch all files changes
gulp.task('watch', ['sass:watch', 'cp:watch', 'images:watch', 'vulcanize:watch'], function (cb) {
  isErrorEatByWatch = true;
  livereload.listen();
  cb();
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
gulp.task('lint:gulp', function () {
  return gulp.src('gulpfile.js')
    .pipe($.jshint.extract('auto'))
    .pipe($.jshint())
    .pipe($.jshint.reporter('jshint-stylish'));
});

// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~
// Watch Error Notification
// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~

var errorNotif = function (title) {
  title = title || 'Build Error';
  return function (err) {
    var path = require('path');
    notifier.notify({
      'title': title,
      'message': err.message,
      category: 'gulp watch',
      icon: path.join(__dirname, '../exclamation.png'),
      time: 5000, // How long to show balloons in ms
      wait: false, // if wait for notification to end
      sound: true
    });
    gutil.log(gutil.colors.red(err));
    this.emit('end');
  };
};

// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~
// Copy COMMAND to Generated
// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~
var configCp = {
  cpGlob: withNotGlob(['**/**.*'], [src.sass, src.bowerComponents, src.polymerElements, src.images]),
  imgGlob: withNotGlob([src.images], [src.bowerComponents])
};

// Copy all missing files
gulp.task('cp', function () {
  var DEST_DIR = path.buildVulcanized;
  var assets = $.useref.assets();
  return gulp.src(configCp.cpGlob, {cwd: path.app, base: path.app})
    .pipe(cache('cping', {optimizeMemory: true}))
    .pipe(changed(DEST_DIR))
    .pipe(debug({title: 'cp changed:'}))
    .pipe(assets)
    //   .pipe($.if('*.js', $.uglify()))
    //   .pipe($.if('*.css', cssChannel()))
    .pipe(assets.restore())
    .pipe($.useref())
    .pipe(gulp.dest(DEST_DIR))
    .pipe(livereload())
    .pipe(browserSyncReload({stream: true}));
});


// Watch for Copy files
gulp.task('cp:watch', ['cp'], function (cb) {
  gulp.watch(configCp.cpGlob, {cwd: path.app}, ['cp']);
  cb();
});

// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~
// Images TASKS
// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~

// Copy Images with Optimisation
gulp.task('images', function (cb) {
  var DEST_DIR = path.buildVulcanized;
  return gulp.src(configCp.imgGlob, {cwd: path.app, base: path.app})
    .pipe(cache('imaging'))
    .pipe(changed(DEST_DIR))
    .pipe(debug({title: 'img changed:'}))
    .pipe($.imagemin({
      progressive: true,
      interlaced: true
    }))
    .pipe(gulp.dest(DEST_DIR))
    .pipe(livereload());
});


// Watch for images copy
gulp.task('images:watch', ['images'], function (cb) {
  gulp.watch(configCp.imgGlob, {cwd: path.app}, ['images']);
  cb();
});


// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~
// Saas TASKS
// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~

// Sass generation
gulp.task('sass', function () {
  var DEST_DIR = path.app;
  var SASS_OPTS = {
    includePaths: [
      'sass/includes'
    ],
    errLogToConsole: false,
    sourceComments: !prod,
    outputStyle: prod ? 'compressed' : 'expanded'
  };
  return gulp.src(src.sass, {cwd: path.sass, base: path.sass})
    .pipe(cache('sassing'))
    .pipe(changed(DEST_DIR, {extension: '.css'}))
    .pipe($.if(isErrorEatByWatch, $.plumber({errorHandler: errorNotif('Vulcanize Error')})))
    .pipe(debug({title: 'sass changed:'}))
    .pipe($.sourcemaps.init())
    .pipe($.sass(SASS_OPTS))
    // Pass the compiled sass through the prefixer with defined
    .pipe($.autoprefixer({
      browsers: AUTOPREFIXER_BROWSERS,
      cascade: !prod
    }))
    .pipe($.if('*.css', $.cssmin()))
    .pipe($.sourcemaps.write('../' + path.buildMap, {
      includeContent: true
    }))
    .pipe(gulp.dest(DEST_DIR))
    .pipe(livereload())
    .pipe(browserSyncReload({stream: true}));
});

// Watch for Sass generation
gulp.task('sass:watch', ['sass'], function (cb) {
  gulp.watch(src.sass, {cwd: path.sass}, ['sass']);
  cb();
});


// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~
// Vulcanize TASKS
// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~

// Vulcanize html files
gulp.task('vulcanize', function (cb) {
  var DEST_DIR = path.buildVulcanized + '/elements';
  return gulp.src('elements/elements.html', {cwd: path.app, base: path.app})
    .pipe($.if(isErrorEatByWatch, $.plumber({errorHandler: errorNotif('Vulcanize Error')})))
    .pipe(debug({title: 'vulcanize :'}))
    //  .pipe($.rename('elements.vulcanized.html'))
    .pipe($.vulcanize({
      dest: DEST_DIR,
      abspath: path.app,
      strip: prod,
      inline: true,
      csp: true,
      excludes: {
        //imports: ['polymer.html$'],
        styles: ['/styles/main.css']
      }
    }))
    .pipe(gulp.dest(DEST_DIR))
    .pipe(livereload())
    .pipe(browserSyncReload({stream: true}));
});

// Watch for Vulcanize html files
gulp.task('vulcanize:watch', ['vulcanize'], function (cb) {
  gulp.watch(src.polymerElements, {cwd: path.app}, ['vulcanize']);
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
  httpHost: 'localhost',
  httpPort: '9000',
  httpsHost: 'localhost',
  httpsPort: '9001'
};

gulp.task('webserver', ['watch'], function () {
  return gulp.src(path.buildVulcanized)
    .pipe($.webserver({
      host: server.httpHost,
      port: server.httpPort,
      livereload: false,
      open: true
    }));
});
gulp.task('connect2', function () {
  var srcApp = gutil.env.build ? path.buildVulcanized : path.app;
  var connect = require('gulp-connect');
  var cros = require('connect-cors');
  connect.server({
    root: srcApp,
    port: 9000,
    middleware: function (connect, o) {
      return [
        (function () {
          var url = require('url');
          var proxy = require('proxy-middleware');
          var options = url.parse('http://localhost:8000/s');
          options.route = 's';
          return proxy(options);
        })
        ()];
    }
  });
});

gulp.task('connect', function () {
  // http://stackoverflow.com/questions/24546450/use-proxy-middleware-with-gulp-connect
  var serveStatic = require('serve-static');
  var serveIndex = require('serve-index');
  var srcApp = gutil.env.build ? path.buildVulcanized : path.app;
  // Proxy Options
  var fs = require('fs');
  var url = require('url');
  var proxyOptions = url.parse('http://127.0.0.1:8000/s/');
  proxyOptions.route = '/s/';


  // Connect Configuration
  var app = require('connect')()
    //  .use(require('connect-modrewrite')(['^/s/(.*)$ http://localhost:8000/s/$1 [P]']))
    .use(require('proxy-middleware')(proxyOptions))
    .use(require('cors')({origin: 'http://127.0.0.1:8000', methods: ['HEAD', 'GET', 'POST']}))
    .use(require('connect-livereload')({port: 35729}))
//    .use(serveStatic('.tmp'))
    .use(serveStatic(srcApp))
    // paths to bower_components should be relative to the current file
    //  .use('/bower_components', serveStatic('bower_components'))
    .use(serveIndex(srcApp));

  // Https Option
  var tlsOptions = {
    key: fs.readFileSync('../docker/nginx-spdy/build/ssl/server.key', 'utf8'),
    cert: fs.readFileSync('../docker/nginx-spdy/build/ssl/server.crt', 'utf8')
  };
  require('https').createServer(tlsOptions, app).listen(server.httpsPort).on('listening', function () {
    console.log('Started connect web server on https://' + server.httpsHost + ':' + server.httpsPort + ' on directory ' + srcApp);
  });
  // Http Server
  require('http').createServer(app)
    .listen(server.httpPort)
    .on('listening', function () {
      console.log('Started connect web server on http://' + server.httpHost + ':' + server.httpPort + ' on directory ' + srcApp);
    });
});

// Start liveReload Server. Options : --build
gulp.task('serve', ['connect', 'watch'], function () {
  return require('opn')('http://' + server.httpHost + ':' + server.httpPort);
});


// Start CSS Injection Server. Options : --build
gulp.task('serveBS', ['watch'], function () {
  //http://stackoverflow.com/questions/25410284/gulp-browser-sync-redirect-api-request-via-proxy
  var url = require('url');
  var proxyOptions = url.parse('http://localhost:3000/secret-api');
  proxyOptions.route = '/api';
  var proxy = require('proxy-middleware');
  //
  var srcApp = gutil.env.build ? path.buildVulcanized : path.app;
  browserSync({
    server: {
      baseDir: srcApp,
      server: {
        baseDir: './',
        middleware: [proxy(proxyOptions)]
      },
      ghostMode: {
        clicks: true,
        forms: true,
        scroll: true
      },
      logLevel: 'info'
    }
  });
});


// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~',
// Chrome App Mobile TASKS
// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~

gulp.task('cca:check', function () {
  return gulp.src('.', {read: false})
    .pipe($.shell(['cca checkenv']));
});


gulp.task('cca:create', ['cca:check'], function () {
  var ccaAction = ' --link-to=';
  //var ccaAction = ' --copy-from=';
  return gulp.src('.')
    .pipe(debug({title: 'cca create :'}))
    .pipe($.shell(['cca checkenv', 'cca create ' + path.buildCCA + ccaAction + path.buildVulcanized + '/manifest.json'], {ignoreErrors: true}));
});

gulp.task('cca:prepare', function () {
  return gulp.src('*', {read: false, cwd: path.buildCCA})
    .pipe($.shell(['cca prepare'], {cwd: path.buildCCA}));
});


gulp.task('cca:push', function () {
  return gulp.src('*', {read: false, cwd: path.buildCCA})
    .pipe($.shell(['cca push --watch'], {cwd: path.buildCCA}));
});


gulp.task('cca:dist-generated', ['cca:create'], function () {
  var releaseOpts = prod ? ' --release' : '';
  return gulp.src('*', {read: false, cwd: path.buildCCA})
    .pipe($.shell(['cca build' + releaseOpts], {cwd: path.buildCCA}));
});


// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~',
// Cordova App Mobile TASKS
// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~
gulp.task('cordova:create', function () {
  var ccaAction = ' --link-to=';
  //var ccaAction = ' --copy-from=';
  return gulp.src('.')
    .pipe($.shell(['cordova create ' + path.buildCordova + ccaAction + path.buildVulcanized], {ignoreErrors: true}));
});

gulp.task('cordova:config', ['cordova:create'], function () {
  var configPlateform = 'android';
  return gulp.src('*', {read: false, cwd: path.buildCordova})
    .pipe($.shell(['cordova platform add ' + configPlateform], {cwd: path.buildCordova, ignoreErrors: true}));
});


gulp.task('cordova:dist-generated', ['cordova:config'], function () {
  var releaseOpts = prod ? ' --release' : '';
  return gulp.src('*', {read: false, cwd: path.buildCordova})
    .pipe($.shell(['cordova build' + releaseOpts], {cwd: path.buildCordova}));
});


// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~',
// Dist TASKS
// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~

gulp.task('dist', function (cb) {
  return runSequence('build', ['dist:web', 'dist:ca', 'dist:cca', 'dist:cordova'], cb);
});

gulp.task('dist:web', function (cb) {
  var DEST_DIR = path.distWeb;
  var gzipOptions = {};
//  var gzipGlob = '**/*.{html,xml,json,css,js}';
  var gzipGlob = ['**/*.*'];
  gulp.src(gzipGlob, {cwd: path.buildVulcanized, base: path.buildVulcanized})
    .pipe(debug({title: 'web dist :'}))
//    .pipe($.rev())
//    .pipe($.revReplace())
    .pipe($.gzip(gzipOptions))
    .pipe(gulp.dest(DEST_DIR));
  //gulp.src(['**', notGlob(gzipGlob)], {cwd: path.buildVulcanized, base: path.buildVulcanized})
  //  .pipe(debug({title: 'web dist gzip :'}))
  //  .pipe($.gzip(gzipOptions))
  //  .pipe(gulp.dest(DEST_DIR));
  cb();
});

gulp.task('dist:ca', function (cb) {
  var DEST_DIR = path.distCa;
  gulp.src(['**/*.*'], {cwd: path.buildVulcanized, base: path.buildVulcanized})
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
  gulp.src('platforms/android/build/outputs/**/*.apk', {cwd: path.buildCCA})
    .pipe(debug({title: 'android dist :'}))
    .pipe($.flatten())
    .pipe(gulp.dest(path.distCcaAndroid));
  gulp.src('platforms/ios/*.xcodeproj', {cwd: path.buildCCA})
    .pipe(debug({title: 'android dist :'}))
    .pipe(gulp.dest(path.distCcaIOS));
  cb();
});


gulp.task('dist:cordova', ['cordova:dist-generated'], function (cb) {
  gulp.src('platforms/android/ant-build/**/*.apk', {cwd: path.buildCordova})
    .pipe(debug({title: 'android dist :'}))
    .pipe($.flatten())
    .pipe(gulp.dest(path.distCordovaAndroid));
  //gulp.src('platforms/ios/*.xcodeproj', {cwd: path.buildCordova})
  //  .pipe(debug({title: 'android dist :'}))
  //  .pipe(gulp.dest(path.distCcaIOS));
  cb();
});


// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~
// Docker TASKS
// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~
var dockerNamespace = 'jmorille';
var dockerProjectName = 'nginx-webapp';
var dockerRegistryUrl = '178.255.97.203:5000';

gulp.task('build:docker', function () {
  var DEST_DIR = path.dist;
  return gulp.src('docker/Dockerfile')
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
  return gulp.src('Dockerfile', {read: false, cwd: path.dist})
 //   .pipe($.shell(['docker tag ' + dockerLocalName + ' ' + dockerRegistryName + ':latest'], {cwd: path.dist}))
    .pipe($.shell(['docker tag ' + dockerLocalName + ' ' + dockerRegistryName + ':'+ dockerVersion], {cwd: path.dist}))
    .pipe($.shell(['docker push ' + dockerRegistryName], {cwd: path.dist, ignoreErrors: false}));

});
// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~
// Maven TASKS
// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~

gulp.task('deployOne', function () {
  var maven = require('gulp-maven-deploy');
  gulp.src('dist/cca_android/**/*armv7*.apk', {base: '.'})
    .pipe(debug({title: 'maven deploy :'}))
    .pipe(maven.deploy({
      'config': {
        'groupId': 'fr.generali.ccj.test',
        'artifactId': 'chromeapp-mobile',
        'classifier': 'armv7',
        'type': 'apk',
        'repositories': [
          {
            'id': 'artifacts-server',
            'url': 'http://maven-proxy.groupe.generali.fr/nexus/content/repositories/socles-releases/'
          }
        ]
      }
    }))
});

gulp.task('deploy', function () {
  var maven = require('gulp-maven-deploy');
  gulp.src('dist/cca_android/**/*.apk', {base: '.'})
    .pipe(debug({title: 'maven deploy :'}))
    .pipe(maven.deploy(function (fileParsed) {
        return {
          'config': {
            'groupId': 'fr.generali.ccj.test',
            'artifactId': fileParsed.name,
            'type': fileParsed.extname,
            'classifier': 'android',
            'repositories': [{
              'id': 'artifacts-server',
              'url': 'http://maven-proxy.groupe.generali.fr/nexus/content/repositories/socles-releases/'
            }]
          }
        };
      }
    ))
});
