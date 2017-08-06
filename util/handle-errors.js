'use strict';
const notify=require('gulp-notify');
const chalk = require('chalk');
const gutil = require('gulp-util');
module.exports=function(error) {

  if( !global.isProd ) {

    const args = Array.prototype.slice.call(arguments);

    // Send error to notification center with gulp-notify
   /* notify.onError({
      title: 'Compile Error',
      message: '<%= error.message %>'
    }).apply(this, args);*/

    gutil.log(chalk.red(error));
    // Keep gulp from hanging on this task
    this.emit('end');

  } else {
    // Log the error and stop the process
    // to prevent broken code from building
    console.log(error);
    process.exit(1);
  }

};
