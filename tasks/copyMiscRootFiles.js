'use strict';

const gulp=require('gulp');
const config=require('../config');

gulp.task('copyMiscRootFiles', function() {

    gulp.src(
        config.sourceDir + '**.*',
        '!'+config.sourceDir + 'fonts/**/*',
        '!'+config.images.src,
        '!'+config.styles.src

    ).pipe(gulp.dest(config.buildDir));

});