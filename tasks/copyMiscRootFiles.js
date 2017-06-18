'use strict';

import gulp   from 'gulp';
import config from '../config';

gulp.task('copyMiscRootFiles', function() {


    gulp.src(config.sourceDir + '*.*').pipe(gulp.dest(config.buildDir));

});