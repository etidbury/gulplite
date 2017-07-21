'use strict';
const gulp=require('gulp');
const runSequence=require('run-sequence');


gulp.task('dev', ['clean'], function(cb) {

  cb = cb || function() {};

  global.isProd = false;

  return runSequence(['sass', 'imagemin', 'browserify','copyMiscRootFiles','space-cms'], 'watch', cb);
   // runSequence(['sass', 'imagemin', 'browserify','copyMiscRootFiles','space-cms'], cb);

});
