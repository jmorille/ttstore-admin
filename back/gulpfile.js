var gulp = require('gulp');
var path = require('path');

var exec = require('gulp-exec');

var vulcanize = require('gulp-vulcanize');

var paths = {
  scripts: [ 'app/scripts/**.js' ],
  images: 'app/**/*',
  components: 'app/components'

}

gulp.task('lint', function(){
  return gulp.src('files/*.js')
    .pipe(cache('linting'))
    .pipe(jshint())
    .pipe(jshint.reporter())
});




gulp.task('default', ['vulcanize', 'statics']);

gulp.task('vulcanize', function () {
  var DEST_DIR = 'spa-dist';

  return gulp.src('spa/index.html')
    .pipe(vulcanize({
      dest: DEST_DIR,
      strip: false,
      inline: true,
      csp: true
    }))
    .pipe(gulp.dest(DEST_DIR));
});


// Copy all static files.
// TODO: figure out if we can copy less things, especially considering the vulcanized main files.
gulp.task('statics', function () {
  staticFiles = [
    'spa/*.js', 'spa/*.css'
  ];
  return gulp.src(staticFiles )
    .pipe(gulp.dest('./dest-test'));
});


// cca create
gulp.task('cca-create', function(cb) {
  gulp
    .src('.').pipe(exec("cca create spa-mobile --link-to=spa-dist/manifest.json", function (err, stdout, stderr) {
    console.log(stdout);
    console.log(stderr);
    cb(err);
  }));
});


