'use strict';
const gulp=require('gulp');
const config=require('../config');
const sass=require('gulp-sass');
const gulpif=require('gulp-if');
const sourcemaps=require('gulp-sourcemaps');
const browserSync=require('browser-sync');
const autoprefixer=require('gulp-autoprefixer');
const handleErrors=require('../util/handle-errors');


gulp.task('sass', function() {

  return gulp.src(config.styles.src)
    .pipe(gulpif(!global.isProd, sourcemaps.init()))
    .pipe(sass({
      sourceComments: global.isProd ? false : 'map',
      outputStyle: global.isProd ? 'compressed' : 'nested'
    }))
    .on('error', handleErrors)
    .pipe(autoprefixer('last 2 versions', '> 1%', 'ie 8'))
    .pipe(gulpif(!global.isProd, sourcemaps.write('.')))
    .pipe(gulp.dest(config.styles.dest))
    .pipe(gulpif(browserSync.active, browserSync.reload({ stream: true })));

});
