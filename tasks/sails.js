'use strict';
const gulp = require('gulp');
const config = require('../config');
const sass = require('gulp-sass');
const gulpif = require('gulp-if');
const sourcemaps = require('gulp-sourcemaps');
const browserSync = require('browser-sync');
const autoprefixer = require('gulp-autoprefixer');
const handleErrors = require('../util/handle-errors');
const fs = require('fs');
const path = require('path');
const _ = require('underscore');
const gutil = require('gulp-util');
const chalk = require('chalk');
const fsExtra = require('fs-extra');

const walkSync = (dir, filelist = []) => {
    fs.readdirSync(dir).forEach(file => {

        filelist = fs.statSync(path.join(dir, file)).isDirectory()
            ? walkSync(path.join(dir, file), filelist)
            : filelist.concat(path.join(dir, file));

    });
    return filelist;
};

gulp.task('sails', function (cb) {
    /**
     * Removes a module from the cache
     */
    function purgeCache(moduleName) {
        // Traverse the cache looking for the files
        // loaded by the specified module name
        searchCache(moduleName, function (mod) {
            delete require.cache[mod.id];
        });

        // Remove cached paths to the module.
        // Thanks to @bentael for pointing this out.
        Object.keys(module.constructor._pathCache).forEach(function (cacheKey) {
            if (cacheKey.indexOf(moduleName) > 0) {
                delete module.constructor._pathCache[cacheKey];
            }
        });
    }

    /**
     * Traverses the cache to search for all the cached
     * files of the specified module name
     */
    function searchCache(moduleName, callback) {
        // Resolve the module identified by the specified name
        var mod = require.resolve(moduleName);

        // Check if the module has been resolved and found within
        // the cache
        if (mod && ((mod = require.cache[mod]) !== undefined)) {
            // Recursively go over the results
            (function traverse(mod) {
                // Go over each of the module's children and
                // traverse them
                mod.children.forEach(function (child) {
                    traverse(child);
                });

                // Call the specified callback providing the
                // found cached module
                callback(mod);
            }(mod));
        }
    }

    var initTmpDirectories = function () {
        try {
            fsExtra.removeSync(path.join(process.cwd(), tmpDir, sailsDir));
        } catch (err) {
            //console.log("sails.js[49]:",err);//fordebug: print debug
            /*ignore*/
        }


        try {

            fs.mkdirSync(path.join(process.cwd(), tmpDir));

        } catch (err) {
            /*ignore*/
        }

        try {
            fs.mkdirSync(path.join(process.cwd(), tmpDir, sailsDir));

        } catch (err) {
            // console.log("sails.js[104]:mkdir",err);//fordebug: print debug
            /*ignore*/
        }
    };


    const sailsDir = 'sails';

    try {
        //detect if project has sails with config directory in root
        if (fs.statSync(path.join(process.cwd(), '.sailsrc')).isFile() && fs.statSync(path.join(process.cwd(), 'config')).isDirectory()) {

            (function addSailsConfigIDESourceMapping() {
                gutil.log(chalk.blue("SailsJs Helper"), "Mapping Sails configuration variables...");
                let allSailsConfig = {};
                let allSailsService = {};
                let allSailsModel = {};


                /**
                 * Map all configuration to one object
                 */
                walkSync(path.join(process.cwd(), 'config')).forEach(function (fileName) {
                    if (fileName.indexOf(".js") <= -1) return;

                    purgeCache(fileName);

                    allSailsConfig = _.extend(allSailsConfig, require(fileName));

                });

                /**
                 * Map available service objects and register function names
                 */
                walkSync(path.join(process.cwd(), 'api/services')).forEach(function (fileName) {
                    if (fileName.indexOf(".js") <= -1) return;

                    purgeCache(fileName);


                    const serviceName = function (fn) {
                        fn = fn.split('/');
                        fn = fn[fn.length - 1].split('.js')[0];
                        return fn;
                    }(fileName);

                    const s = {};
                    s[serviceName] = require(fileName);


                    allSailsService = _.extend(allSailsService, s);

                });
                const concatServiceToString = function () {
                    const FUNC_PLACEHOLDER = "function(){}";

                    let m = allSailsService;
                    for (let serviceName in allSailsService) {
                        //if (!allSailsService.hasOwnProperty(serviceName)){
                        const singleService = allSailsService[serviceName];

                        for (let prop in singleService) {
                            //if (!singleService.hasOwnProperty(prop)){
                            switch (typeof singleService[prop]) {
                                case "function":
                                    m[serviceName][prop] = FUNC_PLACEHOLDER;
                                    break;
                                case "object":
                                case "string":
                                    //ignore, keep the same
                                    break;

                                default:
                                    delete m[serviceName][prop];
                                    break;
                            }

                            //}
                        }
                        //}
                    }

                    m = JSON.stringify(m, null, "\t").split('"' + FUNC_PLACEHOLDER + '"').join(FUNC_PLACEHOLDER);

                    return m;

                }();


                /**
                 * Map available model objects and register function names
                 */

                global = _.extend(global, allSailsService);//make services available to avoid undefined errors when requiring models

                walkSync(path.join(process.cwd(), 'api/models')).forEach(function (fileName) {
                    if (fileName.indexOf(".js") <= -1) return;

                    purgeCache(fileName);

                    const modelName = function (fn) {
                        fn = fn.split('/');
                        fn = fn[fn.length - 1].split('.js')[0];
                        return fn;
                    }(fileName);

                    const s = {};
                    try {


                        s[modelName] = require(fileName);

                    } catch (err) {
                        gutil.log(chalk.blue("SailsJs Helper"), chalk.red("Failed to write source mapping for SailsJs model:", modelName));
                    }

                    allSailsModel = _.extend(allSailsModel, s);

                });

                function camelize(str) {
                    return str.replace(/(?:^\w|[A-Z]|\b\w)/g, function (letter, index) {
                        return index == 0 ? letter.toLowerCase() : letter.toUpperCase();
                    }).replace(/\s+/g, '');
                }

                const concatModelToString = function () {

                    let m = "";

                    const mapSailsAttributeType = function (sailsAttributeType) {
                        switch (sailsAttributeType) {

                            default:
                                return sailsAttributeType;
                                break
                        }
                    };

                    for (let modelName in allSailsModel) {
                        const attrs = allSailsModel[modelName].attributes;

                        m += `/**\n * @typedef {Object} ` + modelName + "\n";

                        m += ` * @typedef {Project} ` + camelize(modelName) + "\n";
                        ['created', 'updated', 'deleted'].forEach(function (prefix) {
                            m += ` * @typedef {Project} ` + prefix + modelName + "\n";
                        });

                        m += " * \n";

                        //iterate through attributes
                        for (let attributeName in attrs) {
                            if (typeof attrs[attributeName].type !== "undefined") {
                                m += " * @property {" + mapSailsAttributeType(attrs[attributeName].type) + "} " + attributeName + "\n";
                            }
                        }
                        m += ` **/\n`;
                    }


                    m += "\n\n";

                    return m;

                }();


                initTmpDirectories();


                fs.writeFile(path.join(process.cwd(), tmpDir, sailsDir, 'map.js')
                    , "global.sails={};" +
                    "sails.config=" + JSON.stringify(allSailsConfig, null, "\t") + ";" +
                    "sails.services=" + concatServiceToString + ";\n\n"
                    + concatModelToString
                    , null, function (err) {
                        if (err) {
                            gutil.log(chalk.blue("SailsJs Helper"), chalk.red("Failed to write source mapping for Sails\n", err));
                            cb();
                            return;
                        }
                        gutil.log(chalk.blue("SailsJs Helper"), "Source Mapping - Complete");
                        cb();
                    });

            })();


        } else {
            //console.log("sails.js[71]:","ignore");//fordebug: print debug
            cb();
        }
    }catch(sailsErr){
        gutil.log(chalk.blue("SailsJs Helper"), "Not in use.");
        cb();
    }


});
