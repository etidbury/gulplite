'use strict';
const gulp=require('gulp');
const config=require('../config');


gulp.task('watch', ['browserSync'], function() {

  // Scripts are automatically watched by Watchify inside Browserify task
  gulp.watch(config.sass.src,               ['sass']);
  gulp.watch(config.images.src,               ['imagemin']);
  gulp.watch([
      config.sourceDir + '**/*',
      '!'+config.images.src,
      '!'+config.sass.src,
      '!' + config.sourceDir + 'js/**/*',
      '!' + config.sourceDir + '**/*.twig',
      '!' + config.sourceDir + '**/[^_]*.*'//ignore files that start with underscore
      ], ['copyMiscRootFiles']);


  gulp.watch(config.sourceDir + '**/*.twig',['space-cms']);


});
