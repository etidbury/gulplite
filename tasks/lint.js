'use strict';
const gulp=require('gulp');
const config=require('../config');
const eslint=require('gulp-eslint');
gulp.task('lint', function() {

  return gulp.src([config.scripts.src, config.scripts.test, config.scripts.gulp])
    .pipe(eslint())
    .pipe(eslint.format())
    .pipe(eslint.failAfterError());

});
