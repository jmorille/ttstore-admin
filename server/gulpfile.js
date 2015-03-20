'use strict';
var gulp = require('gulp');

// Lint
var jshint = require('gulp-jshint');
var stylish = require('jshint-stylish');

var path = {
  sources: ['src/**/*.js']
};
// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~
// DEFAULT FOR 'gulp' COMMAND
// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~
gulp.task('default', ['lint']);

// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~
// Lint TASKS
// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~
gulp.task('lint', function () {
  return gulp.src(path.sources)
    .pipe(jshint())
    .pipe(jshint.reporter('jshint-stylish'));
});


// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~
// Docker TASKS
// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~
var dockerNamespace = 'jmorille';
var dockerProjectName = 'nginx-webapp';
var dockerRegistryUrl = 'jmorille';

gulp.task('build:docker', function () {
  var DEST_DIR = path.dist;
  gulp.src('docker/Dockerfile')
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
  gulp.src('Dockerfile', {read: false, cwd: path.dist})
    //   .pipe($.shell(['docker tag ' + dockerLocalName + ' ' + dockerRegistryName + ':latest'], {cwd: path.dist}))
    .pipe($.shell(['docker tag ' + dockerLocalName + ' ' + dockerRegistryName + ':' + dockerVersion], {cwd: path.dist}))
    .pipe($.shell(['docker push ' + dockerRegistryName], {cwd: path.dist, ignoreErrors: false}));

});

