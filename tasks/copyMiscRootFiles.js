'use strict';

const gulp = require('gulp');
const config = require('../config');
const print = require('gulp-print');
const changed = require('gulp-changed');
const gutil = require('gulp-util');
const chalk = require('chalk');

gulp.task('copyMiscRootFiles', function () {

    var to = null;

    var p = function (cb, initial) {

        var s = gulp.src(
            [
                config.sourceDir + '**/*',
                '!' + config.images.src,
                '!' + config.sass.src,
                '!' + config.sourceDir + 'js/**/*',
                '!' + config.sourceDir + '**/*.twig',
                '!' + config.sourceDir + '**/_*.*',//ignore files that start with underscore
                '!' + config.sourceDir + 'views/'//prevent copying views folder
            ]
        );

        s
            .pipe(changed(config.buildDir))
            .pipe(print(function (filepath) {
                gutil.log(chalk.magenta("Misc. File"), "Copying " + chalk.magenta(filepath));
            }))//
            .pipe(gulp.dest(config.buildDir))
            .on("end", function () {
                clearTimeout(to);
                to = setTimeout(function () {
                    cb(cb);
                }, 3000);
            });
    };

    p(p, true);


});

