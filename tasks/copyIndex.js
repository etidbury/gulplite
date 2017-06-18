'use strict';
const gulp=require('gulp');
const config=require('../config');

gulp.task('copyIndex', function() {

  gulp.src(config.sourceDir + config.browserSync.defaultFile).pipe(gulp.dest(config.buildDir));

});
