'use strict';

const gulp = require('gulp');
const config = require('../config');
const print=require('gulp-print');
gulp.task('copyMiscRootFiles', function () {

    gulp.src(
        [
            config.sourceDir + '**/*',
            '!' + config.images.src,
            '!' + config.sass.src,
            '!' + config.sourceDir + 'js/**/*'
        ]
    )
        .pipe(print())
        .pipe(gulp.dest(config.buildDir));

});

