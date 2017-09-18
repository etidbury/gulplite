'use strict';

const gulp=require('gulp');
const runSequence=require('run-sequence');


gulp.task('stage', ['clean'], function(cb) {

    cb = cb || function() {};

    global.isProd = true;
    global.isStage =true;

    runSequence(['sass', 'imagemin', 'browserify','copyMiscRootFiles','space-cms'], cb);

    process.exit(0);

});
