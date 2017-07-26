'use strict';
const API_URL = "https://spacecms.com/";
const GLOBAL_VAR_NAME = "__spacecms_global";
const DEFAULT_SPACE_UPDATE_COOLDOWN = 300;//ms
const SPACE_LIB_JS_URL='https://cdn.jsdelivr.net/gh/etidbury/spacecms@v0.0.24/index.js';

//const SPACE_LIB_JS_URL='http://localhost:9006/index.js';


const gulp = require('gulp');
const config = require('../config');
/**
 * Record + Hide any console.log output by twig.js module for later use with custom handler.
 */
(function polyfillExtractHideDebugTwigJs() {

    const oldConsoleLog = console.log;

    let logs = [];
    let tokenReferences = [];
    let fileReferences = [];

    global.console.log = function () {


        logs.push(arguments[0]);


        //console.warn(arguments);

        var getStackTrace = function () {
            var obj = {};
            Error.captureStackTrace(obj, getStackTrace);
            return obj.stack;
        };


        const x = getStackTrace();


        //console.warn("spacecms.js: (139)",);//fordebug: debug print

        //oldConsoleLog("spacecms.js:log (32)",arguments[0]);//fordebug: debug print


        if (x.indexOf("twig/twig.js:") <= -1) {
            Array.prototype.unshift.call(arguments);
            oldConsoleLog.apply(this, arguments);

        } else {


            const stringOut = JSON.stringify(arguments[0]);
            // console.warn("spacecms.js:stringout (44)",stringOut);//fordebug: debug print

            if (stringOut.indexOf('space.') > -1 && stringOut.indexOf("Tokenizing expression ") > -1) {

                const objectExpression = arguments[0][arguments[0].length - 1];
                tokenReferences.push(objectExpression);

            }
            //oldConsoleLog("spacecms.js:stringout (49)",stringOut);//fordebug: debug print
            if (stringOut.indexOf("Twig.Template.reset") > -1) {
                const fileExpression = arguments[0];
                //oldConsoleLog("spacecms.js:fil (49)",);//fordebug: debug print

                fileReferences.push(fileExpression[fileExpression.length - 1].split('Reseting template ')[1]);

            }

        }
    };


    global.debugReset = function () {
        logs = [];
        tokenReferences = [];
        fileReferences = [];
    };

    /**
     * Get last object expression that was printed as error in twig.js debug output.
     */
    global.debugGetLastTwigExpressionOut = function () {

        try {

            const vals = logs[logs.length - 1][logs[logs.length - 1].length - 1];
            let m = [];


            if (!vals.length || !vals[0].type) return false;

            vals.forEach(function (k) {

                switch (k.type) {
                    case "Twig.expression.type.variable":
                        m.push(k.value);
                        break;
                    case "Twig.expression.type.key.period":
                        m.push("." + k.key);
                        break;
                    case "Twig.expression.type.key.brackets":
                        m.push("[x]");
                        break;
                    case "Twig.expression.type.filter":
                        m.push(" | " + k.match[1]);
                        break;

                    default:
                        spacelog("Unrecognised type:", k.type);
                        break;
                }

            });


            return m.join('');

        } catch (err) {
            //todo: handle better
            return false;
        }

    };

    global.debugGetLastFileReference = function () {
        return fileReferences.length ? fileReferences[fileReferences.length - 1] : false;
    };
    global.debugGetTwigTokenObjectReferences = function (space) {

        function onlyUnique(value, index, self) {
            return self.indexOf(value) === index;
        }


        let m = tokenReferences.filter(onlyUnique);


        var getValueFromRef = function (ref) {
            try {
                return eval(ref);
            } catch (err) {
                //console.warn("failed get value for ref:", ref, err);
                return undefined;
            }
        };

        m = m.map(function (ref) {
            const start = ref.indexOf('space.');
            const end = ref.indexOf(' ', start) > -1 ? ref.indexOf(' ', start) : ref.length;
            const name = ref.substr(start, end);


            return {
                ref: name,
                val: function () {

                    return getValueFromRef(name);

                }()
            };
        });

        m.forEach(function (objectToken) {

            if (typeof objectToken.val === "undefined") {
                const refParts = objectToken.ref.split('.');


                const lastParentSpecified = function () {

                    for (let i = refParts.length - 1; i >= 0; i--) {
                        const refPart = refParts[i];

                        const fullRef = refParts.slice(0, i + 1).join('.');


                        const v = getValueFromRef(fullRef);

                        if (typeof v !== "undefined") {
                            return {
                                ref: fullRef,
                                val: v
                            };
                        }


                    }
                    return undefined;

                }();

                if (typeof lastParentSpecified !== "undefined") {

                    const printUndefinedMessage = function () {

                        let invalidProps = objectToken.ref.replace(lastParentSpecified.ref, '');

                        //remove dot at start if exists
                        invalidProps = invalidProps[0] === "." ? invalidProps.substr(1) : invalidProps;

                        spacelog(chalk.red("Twig Error: " + "Undefined Properties Found"));

                        gutil.log("\t", chalk.gray(objectToken.ref.replace(invalidProps, chalk.underline.red(invalidProps))));

                        const getRefKeys = function (validObject) {

                            let m = [];

                            for (let key in validObject) {
                                if (!validObject.hasOwnProperty(key)) continue;
                                m.push({ref: key, val: validObject[key]});
                            }

                            return m;
                        };
                        var shortenText = function (text) {
                            if (typeof text === "string")
                                return text.substr(0, 40) + (text.length > 40 ? '...' : '');

                            return text;
                        };

                        gutil.log("\t", chalk.blue("Available Properties"));

                        getRefKeys(lastParentSpecified.val).forEach(function (reco) {

                            //console.log("spacecms.js:objectTokenref (198)",reco.ref,objectToken.ref);//fordebug: debug print
                            gutil.log("\t", chalk.gray(objectToken.ref
                                    .replace(
                                        invalidProps, chalk.blue(reco.ref)
                                        , objectToken.ref.indexOf(lastParentSpecified.ref)
                                    )//replace
                                )//chalk.gray
                                ,
                                chalk.bold.gray(reco.val === null ? "NULL" : (typeof (reco.val)).toUpperCase())
                                ,
                                chalk.gray(
                                    shortenText(
                                        function outputObjectTokenValToString() {
                                            switch (typeof reco.val) {
                                                case "object":
                                                    return JSON.stringify(reco.val);
                                                    break;

                                                default:
                                                    return reco.val;
                                                    break;
                                            }
                                        }()
                                    )//shortenText
                                )//chalk.gray

                            );//log
                        });


                    }();//printUndefinedMessage


                } else {
                    //todo: handle when space not defined?
                }

            } else {

                //Value is specified and ok.

            }
        });
    }

})();


const gutil = require('gulp-util');

(function applyNamespaceToLogs() {//brand namespace

    const originalGutilLog = gutil.log;

    global.spacelog = function () {
        const mainArguments = [].slice.call(arguments);

        mainArguments.unshift(chalk.bold("SpaceCMS"));

        return originalGutilLog.apply(this, mainArguments);
    };

})();

const chalk = require('chalk');

const twig = require('gulp-twig');

const yaml = require('js-yaml');
const fs = require('fs');
const greplace = require('gulp-replace-fix');
const print = require('gulp-print');
const rp = require('request-promise');
const browserSync = require('browser-sync');


/*
 import config from '../config';
 import twig from 'gulp-twig';
 import yaml from 'js-yaml';
 import fs from 'fs';
 import greplace from 'gulp-replace-fix';
 import rename from 'gulp-rename';

 import print from 'gulp-print';
 import rp from 'request-promise';

 import browserSync from 'browser-sync';*/


gulp.task('space-cms', function (cb) {


    debugReset();
    //const ftpSync = require('ftpsync');

    let pkg, projectName;


    /*---------determine project name---------*/
    const projectNameArgId = "--project=";
    const projectNameArgIdPos = process.argv.join('').indexOf(projectNameArgId);

    console.log("spacecms.js:pr (327)", projectNameArgIdPos);//fordebug: debug print
    let overriddenProjectName = false;

    if (process.argv.join('').indexOf(projectNameArgId) > -1) {
        for (let i = 0; i < process.argv.length; i++) {
            let arg = process.argv[i].split(projectNameArgId);
            if (arg[1] && arg[1].length > 0) {
                projectName = arg[1].trim();
                overriddenProjectName = true;
                spacelog(chalk.blue("Overriding Project Name:", projectName));
            }
        }
    }


    if (!overriddenProjectName) {
        try {

            pkg = require(process.cwd() + '/package');


            //console.log("spacecms.js:pkg (44)",pkg);//fordebug: debug print

            projectName = pkg.name;

            //projectName=fs.readFileSync('')
            //conf = yaml.safeLoad(fs.readFileSync('./cms.config.yml', 'utf8'));
            //confEnv = conf[global.isProd ? 'prod' : 'dev'];

            if (!projectName || !projectName.length) throw("Unspecified project name");

        } catch (e) {
            spacelog(chalk.red("Error finding project name. Please make sure you have specified a project name within your package.json file."));
            cb();
            return;
        }
    }


    /*---------determine project name---------*/


    /* return gulp.src(files)
     .pipe(twig({
     data: {
     space: {hello: "test"}
     },
     errorLogToConsole:true
     }))
     .pipe(gulp.dest(config.buildDir));
     */

    const g = gulp.src([
        config.sourceDir + '**/*.twig'
        , '!' + config.sourceDir + '**/_*.*'//ignore files that start with underscore
    ]);


    const loadSpaceData = function () {
        return rp({
            url: API_URL + 'project/' + projectName + '/spaces',
            headers: {
                'User-Agent': 'gulplite'
            },

            json: true,
            "rejectUnauthorized": false
        });
    };


    if (!fs.existsSync(tmpDir))
        fs.mkdirSync(tmpDir);

    //ignore twig inside body tags for realtime updating
    if (!isProd || isStage) {
        g.pipe(greplace("<body", "{% verbatim %}<body"));
        g.pipe(greplace("</body>", "</body>{% endverbatim %}"));
    }

    if (!isProd || isStage) {
        //inject js code
        const jsTemplate = "<script>var gn = '" + GLOBAL_VAR_NAME + "';window[gn] = {config: {{ config|json_encode }},space:{{ space|json_encode }},project:{{ project|json_encode }}};window['_space'] = window[gn].space;</script>" +
            "<script src='"+SPACE_LIB_JS_URL+"'></script>";
        g.pipe(greplace("<head>", "<head>" + jsTemplate));
    }

    g
    // .pipe(rename({extname: '.twig'}))
        .pipe(gulp.dest(tmpDir));


    g.on('end', function () {
        loadSpaceData().then(function onLoadSpaceData(body) {

            const x = gulp.src(
                [
                    tmpDir + "**/*.twig",
                    '!' + tmpDir + "views/**/*.twig"
                ]);


            //g.pipe(print());

            //  g
            //   .pipe(greplace("<body", "{% verbatim %}<body"))
            //  .pipe(greplace("</body>", "</body>{% endverbatim %}"));

            //global.console = {};

            const reportedTwigErrors = [];


            x.pipe(twig({
                //trace:true,
                debug: true,
                strict_variables: true,
                //errorLogToConsole: true,
                base: config.sourceDir,
                rethrow: true,
                data: {
                    timestamp: new Date().toString(),
                    space: body,
                    config: {
                        api_url: API_URL,
                        env: process.env.NODE_ENV,
                        space_update_cooldown: DEFAULT_SPACE_UPDATE_COOLDOWN
                    },
                    project: {
                        name: projectName
                    }
                },
                onError: function (err) {
                    // console.log=origConsoleLog;//reset
                    //console.log("spacecms.js: (424)",debugGetLastFileReference());//fordebug: debug print
                    err.file = err.file ? err.file : debugGetLastFileReference();

                    const relativeFilePath = err.file && err.file.length ? err.file.replace(process.cwd() + "/" + tmpDir, config.sourceDir) : "[UNKNOWN FILE]";

                    const errId = err.message + debugGetLastTwigExpressionOut();

                    //const specifiedTokenExpression=chalk.bold(debugGetLastTwigExpressionOut() ? "'" + debugGetLastTwigExpressionOut() + "'" : "");

                    if (!reportedTwigErrors[errId]) {

                        spacelog(chalk.red("Twig Error:"), chalk.red(err.message));
                        gutil.log("\t", chalk.magenta("In File: " + relativeFilePath));
                        reportedTwigErrors[errId] = 1;

                    }

                    //cb();


                }
            }));

            //if (isProd)
            //x.pipe(rename({extname: '.html'}));

            x.on('end', function () {

                debugGetTwigTokenObjectReferences(body);

                browserSync.reload();
                cb();

            });


            x
                .pipe(gulp.dest(config.buildDir));


        }).catch(function onAPIError(err, s, r) {
            spacelog(chalk.red("Failed to request from Space CMS API:"), chalk.magenta(err));
            cb();
        });

    });


});
