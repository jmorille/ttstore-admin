'use strict';

module.exports = function(grunt) {

    // Project configuration.
    grunt.initConfig({
        vulcanize: {
            options: {
                csp: true,
                excludes: {
                    imports: [
                        "polymer.html"
                    ]
                }
            },
            files: {
                'dist/build-csp.html': 'index.html'
            },
        },
    });

    // These plugins provide necessary tasks.
    grunt.loadNpmTasks('grunt-vulcanize');

    // Default task.
    grunt.registerTask('default', ['vulcanize']);

};