'use strict';

const gulp = require('gulp');
const config = require('../config');

gulp.task('copyMiscRootFiles', function () {

    gulp.src(
        [
            config.sourceDir + '**/*',
            '!' + config.images.src,
            '!' + config.sass.src,
            '!' + config.sourceDir + 'js/**/*',
            '!' + config.sourceDir + '**/*.twig',
            '!' + config.sourceDir + '**/_*.*',//ignore files that start with underscore
            '!' + config.sourceDir + 'views/'//prevent copying views folder
        ]
    )
        .pipe(gulp.dest(config.buildDir));

});

