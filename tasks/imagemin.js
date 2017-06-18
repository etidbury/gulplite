'use strict';
const gulp=require('gulp');
const config=require('../config');
const gulpif=require('gulp-if');
const imagemin=require('gulp-imagemin');
const browserSync=require('browser-sync');

gulp.task('imagemin', function() {

  return gulp.src(config.images.src)
    .pipe(gulpif(global.isProd, imagemin()))
    .pipe(gulp.dest(config.images.dest))
    .pipe(gulpif(browserSync.active, browserSync.reload({ stream: true, once: true })));

});
