'use strict';

const gulp = require('gulp');
const config = require('../config');
const print = require('gulp-print');
const changed = require('gulp-changed');
const del = require('del');
const gutil = require('gulp-util');
const chalk = require('chalk');
const path = require('path');
const vinylPaths = require('vinyl-paths');
const fs = require('fs');

gulp.task('copyMiscRootFiles', function () {

    var to = null;

    var allSourceFiles = path.join(process.cwd(), config.sourceDir, '**/*');

    var p = function (cb, initial) {


        var targetList = [
            config.sourceDir + '**/*',
            '!' + config.images.src,
            '!' + config.sass.src,
            '!' + config.sourceDir + 'js/**/*',
            '!' + config.sourceDir + '**/*.twig',
            '!' + config.sourceDir + '**/_*.*',//ignore files that start with underscore
            '!' + config.sourceDir + 'views/'//prevent copying views folder
        ];

        var s = gulp.src(targetList)
        /*.pipe(vinylPaths(function (path) {//todo: implement deleting
                console.log("copyMiscRootFiles.js[36]:",path);//fordebug: print debug
                fs.access(path, function (err) {
                    if (err) {
                        gutil.log(chalk.magenta("Misc. File"), "Deleting " + chalk.magenta(path));
                        return del(path);
                    }
                });
            }))*/
            .pipe(changed(config.buildDir))
            .pipe(print(function (filepath) {
                gutil.log(chalk.magenta("Misc. File"), "Updating " + chalk.magenta(filepath));
            }))
            .pipe(gulp.dest(config.buildDir))
            .on("end", function () {
                clearTimeout(to);
                to = setTimeout(function () {
                    cb(cb);
                }, 3000);
            });

    };//end p;
    p(p, true);

});

