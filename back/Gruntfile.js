'use strict';

module.exports = function(grunt) {

    // Project configuration.
    grunt.initConfig({
        // QA
        jshint: {
            all: [
                'Gruntfile.js',
                'tasks/*.js',
                '<%= nodeunit.tests %>'
            ],
            options: {
                jshintrc: '.jshintrc'
            }
        },


        // Before generating any new files, remove any previously-created files.
        clean: {
            tests: ['dist']
        },

        // set up tmp folders
        mkdir: {
            all: {
                options: {
                    create: ['dist']
                }
            }
        },

        //
        vulcanize: {
            default: {
                options: {
                    inline: true,
                    excludes: {
                        imports: ['polymer.html']
                    }
                },
                files: {
                    'dist/index.html': ['index.html']
                }
            },
            csp: {
                options: {
                    csp: true,
                    strip: true
                },
                files: {
                    'dist/index.html': ['index.html']
                }
            }
        },
        // Unit tests.
        nodeunit: {
            tests: ['test/*_test.js'],
        }

    });

   // Actually load this plugin's task(s).
    grunt.loadTasks('tasks');


    // These plugins provide necessary tasks.
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-mkdir');
    grunt.loadNpmTasks('grunt-contrib-nodeunit');

    // These plugins provide necessary tasks.
     grunt.loadNpmTasks('grunt-vulcanize');

    // Default task.
    grunt.registerTask('default', ['clean', 'mkdir', 'vulcanize']);

};