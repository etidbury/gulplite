'use strict';

const gulp=require('gulp');
const config=require('../config');

gulp.task('copyMiscRootFiles', function() {


    gulp.src(config.sourceDir + '*.*').pipe(gulp.dest(config.buildDir));

});