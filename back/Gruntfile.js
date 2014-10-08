'use strict';

// # Globbing
// for performance reasons we're only matching one level down:
// 'test/spec/{,*/}*.js'
// use this if you want to match all subfolders:
// 'test/spec/**/*.js'

module.exports = function (grunt) {
    // show elapsed time at the end
    require('time-grunt')(grunt);
    // load all grunt tasks
    require('load-grunt-tasks')(grunt);

    // configurable paths
    var yeomanConfig = {
        app: 'app',
        dist: 'dist'
    };
    // Project configuration.
    grunt.initConfig({
        yeoman: yeomanConfig,
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
            dist: ['.tmp', '<%= yeoman.dist %>/*']
        },

        // set up tmp folders
        mkdir: {
            all: {
                options: {
                    create: ['dist']
                }
            }
        },
        // Add Css Prefix
        autoprefixer: {
            options: {
                browsers: ['last 2 versions']
            },
            dist: {
                files: [
                    {
                        expand: true,
                        cwd: '<%= yeoman.dist %>',
                        src: ['**/*.css', '**/*.html','!components/**/*.css','!components/**/*.html'],
                        dest: '<%= yeoman.dist %>'
                    }
                ]
            }
        },

        // vulcanize
        vulcanize: {
            default: {
                options: {
                    inline: true,
                    csp: false,
                    strip: true,
                    excludes: {
                        imports: ['polymer.html']
                    }
                },
                files: {
                    '<%= yeoman.dist %>/index.html': [ '<%= yeoman.app %>/index.html'
                    ]
                }
            }
        },


        // gzip assets 1-to-1 for production
        compress: {
            default: {
                options: {
                    mode: 'gzip'
                },
                expand: true,
                src: ['dist/*.html'],
                dest: 'distgz/'
            }
        },

        pagespeed: {
            options: {
                nokey: true
            },
            prod: {
                options: {
                    url: "http://localhost:8000/dist/",
                    locale: "en_GB",
                    strategy: "desktop",
                    threshold: 80
                }
            },
            paths: {
                options: {
                    paths: ["/back/app/index.html"],
                    locale: "en_GB",
                    strategy: "desktop",
                    threshold: 80
                }
            }
        },

        // Unit tests.
        nodeunit: {
            tests: ['test/*_test.js']
        }

    });



    grunt.registerTask('build', [
        'clean:dist',
        'autoprefixer',
        'vulcanize'
    ]);

    grunt.registerTask('default', [
        //'jshint',
        // 'test'
        'build'
    ]);
};
