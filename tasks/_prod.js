'use strict';

const gulp=require('gulp');
const runSequence=require('run-sequence');

gulp.task('prod', ['clean'], function(cb) {

  cb = cb || function() {};

  global.isProd = true;


  runSequence(['sass', 'imagemin', 'browserify', 'copyFonts', 'copyIndex', 'copyIcons','copyMiscRootFiles'], cb);

});
