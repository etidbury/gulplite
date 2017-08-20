'use strict';

const url=require('url');
const browserSync=require('browser-sync');
const gulp=require('gulp');
const config=require('../config');


gulp.task('browserSync', function() {


  const ASSET_EXTENSION_REGEX = new RegExp(`\\b(?!\\?)\\.(${config.browserSync.assetExtensions.join('|')})\\b(?!\\.)`, 'i');

  browserSync.init({
    server: {
      baseDir: config.buildDir,
     /* routes: {
          "/bower_components": "bower_components"
      },
      middleware: function(req, res, next) {
        const fileHref = url.parse(req.url).href;

        if ( !ASSET_EXTENSION_REGEX.test(fileHref)) {
          req.url = '/' + config.browserSync.defaultFile;
        }

        return next();
      }*/
    },
    port: config.browserPort,
    ui: {
      port: config.UIPort
    },
    ghostMode: {
      clicks: false,
        forms:false
    },

  });

});
