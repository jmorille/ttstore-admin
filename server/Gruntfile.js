
'use strict';
module.exports = function (grunt) {

  grunt.initConfig({
    jshint: {
      all: [
        'Gruntfile.js',
        'tasks/*.js'
      ],
      options: {
        jshintrc: '.jshintrc'
      }
    },

    // Run the task to smoketest it
    retire: {
      node: ['server.js', 'models/**'],
      options: {
        verbose: true,
        packageOnly: false
      }
    }
  });

  // Actually load this plugin's task(s).
  grunt.loadNpmTasks('grunt-retire');
  grunt.loadNpmTasks('grunt-nsp-package');
  grunt.loadNpmTasks('grunt-contrib-jshint');


  // By default, lint and retire.
  grunt.registerTask('default', [ 'validate-package', 'retire', 'jshint']);

};
