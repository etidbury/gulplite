'use strict';
const gulp=require('gulp');
const runSequence=require('run-sequence');


gulp.task('dev', ['clean'], function(cb) {

  cb = cb || function() {};

  global.isProd = false;

  return runSequence(['sass', 'imagemin', 'browserify', 'copyFonts', 'copyIndex', 'copyIcons','copyMiscRootFiles'], 'watch', cb);

});
