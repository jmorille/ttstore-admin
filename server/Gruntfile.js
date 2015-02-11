module.exports = function (grunt) {
  "use strict";

  retire: {
      node: ['node_module/'], /** Scan node project in directory module/. Should be ['.'] for normal projects **/
        options: {
      }
  }

  grunt.loadNpmTasks('grunt-nsp-package');
  grunt.loadNpmTasks('grunt-retire');

  grunt.registerTask("default", 'validate-package');
}

