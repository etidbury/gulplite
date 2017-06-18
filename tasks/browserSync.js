'use strict';

import url         from 'url';
import browserSync from 'browser-sync';
import gulp        from 'gulp';
import config      from '../config';

gulp.task('browserSync', function() {


  const ASSET_EXTENSION_REGEX = new RegExp(`\\b(?!\\?)\\.(${config.browserSync.assetExtensions.join('|')})\\b(?!\\.)`, 'i');

  browserSync.init({
    server: {
      baseDir: config.buildDir,
      middleware: function(req, res, next) {
        const fileHref = url.parse(req.url).href;

        if ( !ASSET_EXTENSION_REGEX.test(fileHref)) {
          req.url = '/' + config.browserSync.defaultFile;
        }

        return next();
      }
    },
    port: config.browserPort,
    ui: {
      port: config.UIPort
    },
    ghostMode: {
      links: false
    }
  });

});
