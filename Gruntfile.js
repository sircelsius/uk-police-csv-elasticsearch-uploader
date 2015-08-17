'use strict';

module.exports = function(grunt){
  // auto-load grunt tasks
  require('load-grunt-tasks')(grunt);

  var config = {
    src: './src'
  };

  grunt.initConfig({
    config: config,
    jshint: {
      options: {
        jshintrc: '.jshintrc'
      },
      all: [
        'Gruntfile.js',
        '<%= config.src %>/**/*.js'
      ]
    }
  });
};