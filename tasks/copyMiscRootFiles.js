'use strict';

const gulp = require('gulp');
const config = require('../config');

gulp.task('copyMiscRootFiles', function () {

    gulp.src(
        [
            config.sourceDir + '**/*',
            '!' + config.images.src,
            '!' + config.sass.src,
            '!' + config.sourceDir + 'js/**/*'
        ]
    )
        .pipe(gulp.dest(config.buildDir));

});

