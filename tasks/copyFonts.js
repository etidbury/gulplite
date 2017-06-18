'use strict';

const gulp=require('gulp');
const config=require('../config');

gulp.task('copyFonts', function() {

  return gulp.src([config.sourceDir + 'fonts/**/*'])
    .pipe(gulp.dest(config.buildDir + 'fonts/'));

});
