'use strict';
const gulp=require('gulp');
const config=require('../config');


gulp.task('watch', ['browserSync'], function() {

  // Scripts are automatically watched by Watchify inside Browserify task
  gulp.watch(config.styles.src,               ['sass']);
  gulp.watch(config.images.src,               ['imagemin']);
  gulp.watch(
      config.sourceDir + '**.*',
      '!'+config.sourceDir + 'fonts/**/*',
      '!'+config.images.src,
      '!'+config.styles.src, ['copyMiscRootFiles']);

});
