'use strict';

import gulp   from 'gulp';
import config from '../config';

gulp.task('copyIndex', function() {

  gulp.src(config.sourceDir + config.browserSync.defaultFile).pipe(gulp.dest(config.buildDir));

});
