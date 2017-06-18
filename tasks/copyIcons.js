'use strict';
const gulp=require('gulp');
const config=require('../config');

gulp.task('copyIcons', function() {

  return gulp.src(['./*.png', './favicon.ico'])
    .pipe(gulp.dest(config.buildDir));

});
