'use strict';

const gulp=require('gulp');
const gulpif=require('gulp-if');

const source=require('vinyl-source-stream');
const streamify=require('gulp-streamify');
const sourcemaps=require('gulp-sourcemaps');
const rename=require('gulp-rename');
const watchify=require('watchify');
const browserify=require('browserify');
const babelify=require('babelify');
const uglify=require('gulp-uglify');
const browserSync=require('browser-sync');
const debowerify=require('debowerify');
const handleErrors=require('../util/handle-errors');
const config=require('../config');

const print=require('gulp-print');
const gutil=require('gulp-util');
const chalk=require('chalk');


// Based on: http://blog.avisi.nl/2014/04/25/how-to-keep-a-fast-build-with-browserify-and-reactjs/
function buildScript(file, watch) {

    let bundler = browserify({
        entries: [config.sourceDir + 'js/' + file],
        debug: !global.isProd,
        cache: {},
        packageCache: {},
        fullPaths: !global.isProd
    });

    if (watch) {
        bundler = watchify(bundler);
        bundler.on('update', rebundle);
    }

    //bundler.transform(babelify);
    bundler.transform(babelify, {
        presets: [__dirname + "/../node_modules/babel-preset-es2015", __dirname + "/../node_modules/babel-preset-react"]
        , plugins: [__dirname + "/../node_modules/babel-plugin-transform-object-rest-spread", __dirname + "/../node_modules/babel-plugin-transform-class-properties"]
    });
    bundler.transform(debowerify);

    function rebundle(updatedFiles) {

        if (updatedFiles&&updatedFiles.length)
            updatedFiles.forEach(function(file){

                file=file.replace(process.cwd(),'');

                gutil.log("Compiling:",chalk.blue(file),"->",chalk.magenta(config.browserify.outputFileName+'.js'));


            });



        const stream = bundler.bundle();

        return stream.on('error', handleErrors)

            .pipe(source(file))
            //.pipe(print())
            .pipe(gulpif(global.isProd, streamify(uglify())))
            .pipe(streamify(rename({
                basename: config.browserify.outputFileName
            })))
            .pipe(gulpif(!global.isProd, sourcemaps.write('./')))
            .pipe(gulp.dest(config.scripts.dest))
            .pipe(gulpif(browserSync.active, browserSync.reload({stream: true, once: true})));
    }

    return rebundle();

}


gulp.task('browserify', function () {

    // Only run watchify if NOT production
    return buildScript(config.browserify.defaultFile, !global.isProd);

});
