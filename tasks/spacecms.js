'use strict';

const gulp = require('gulp');
const config = require('../config');

/**
 * Record + Hide any console.log output by twig.js module for later use with custom handler.
 */
(function polyfillExtractHideDebugTwigJs() {

    const oldConsoleLog = console.log;

    const logs = [];
    const tokenReferences = [];


    console.log = function () {
        logs.push(arguments[0]);

        //console.warn(arguments);

        var getStackTrace = function () {
            var obj = {};
            Error.captureStackTrace(obj, getStackTrace);
            return obj.stack;
        };

        const x = getStackTrace();
        //console.warn("spacecms.js: (139)",);//fordebug: debug print


        if (x.indexOf("twig/twig.js:") <= -1) {

            Array.prototype.unshift.call(arguments);
            oldConsoleLog.apply(this, arguments);
        }

        else {

            const stringOut = JSON.stringify(arguments[0]);
            // console.warn("spacecms.js:stringout (44)",stringOut);//fordebug: debug print
            if (stringOut.indexOf('space.') > -1 && stringOut.indexOf("Tokenizing expression ") > -1) {

                const objectExpression = arguments[0][arguments[0].length - 1];

                tokenReferences.push(objectExpression);

            }

        }
    };

    /**
     * Get last object expression that was printed as error in twig.js debug output.
     */
    global.debugGetLastTwigExpressionOut = function () {

        try {


            const vals = logs[logs.length - 1][logs[logs.length - 1].length - 1];
            let m = [];

            vals.forEach(function (k) {
                m.push(k.value || k.key);
            });

            return m.join('.');
        } catch (err) {
            //todo: handle better
            return false;
        }

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
                console.warn("failed get value for ref:", ref, err);
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

                        gutil.log(chalk.red("Undefined Property Found"));

                        gutil.log(chalk.gray(objectToken.ref.replace(invalidProps, chalk.underline.red(invalidProps))));

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


                        gutil.log(chalk.blue("Valid Properties"));

                        getRefKeys(lastParentSpecified.val).forEach(function (reco) {
                            gutil.log(chalk.gray(objectToken.ref
                                    .replace(
                                        invalidProps, chalk.blue(reco.ref)
                                        , objectToken.ref.indexOf(lastParentSpecified.ref)
                                    )//replace
                                )//chalk.gray
                                ,
                                chalk.bold.gray((typeof (reco.val)).toUpperCase())
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


gulp.task('space-cms', function () {

    //const ftpSync = require('ftpsync');

    let pkg, projectName;

    const API_URL = "https://spacecms.com/";


    try {


        pkg = require(process.cwd() + '/package');


        //console.log("spacecms.js:pkg (44)",pkg);//fordebug: debug print

        projectName = pkg.name;

        //projectName=fs.readFileSync('')
        //conf = yaml.safeLoad(fs.readFileSync('./cms.config.yml', 'utf8'));
        //confEnv = conf[global.isProd ? 'prod' : 'dev'];

    } catch (e) {
        console.error("Error parsing configuration. Please make sure configuration has maintained YAML structure \n(i.e. no duplicate keys, correct spaces, line breaks etc.)");
        return;
    }


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
            //agentOptions: {
            //   ca: fs.readFileSync(__dirname+'/../ca.spacecms.api.pem')
            // }
            json: true,
            "rejectUnauthorized": false
            //rejectUnauthorised: false
        });
    };

    if (!fs.existsSync(tmpDir))
        fs.mkdirSync(tmpDir);


    const jsTemplate = "<script>var gn = '__etcms_global';window[gn] = {config: {{ config|json_encode }},space:{{ space|json_encode }},project:{{ project|json_encode }}};window['_space'] = window[gn].space;</script>";


    //ignore twig inside body tags for realtime updating
    if (!isProd) {
        g.pipe(greplace("<body", "{% verbatim %}<body"));
        g.pipe(greplace("</body>", "</body>{% endverbatim %}"));
    }


    //inject js code
    g.pipe(greplace("<head>", "<head>" + jsTemplate));

    g
    // .pipe(rename({extname: '.twig'}))
        .pipe(gulp.dest(tmpDir));

    g.on('end', function () {
        loadSpaceData().then(function onLoadSpaceData(body) {

            const g = gulp.src(
                [
                    tmpDir + "**/*.twig",
                    '!' + tmpDir + "views/**/*.twig"
                ]);

            g.pipe(print());
            //  g
            //   .pipe(greplace("<body", "{% verbatim %}<body"))
            //  .pipe(greplace("</body>", "</body>{% endverbatim %}"));

            //global.console = {};


            const reportedTwigErrors = [];


            g.pipe(twig({
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
                        env: process.env.NODE_ENV
                    },
                    project: {
                        name: projectName
                    }
                },
                onError: function (err) {
                    // console.log=origConsoleLog;//reset


                    const relativeFilePath = err.file.replace(process.cwd() + "/" + tmpDir, config.sourceDir);

                    const errId = err.message + debugGetLastTwigExpressionOut();

                    if (!reportedTwigErrors[errId]) {
                        console.warn(chalk.red("Twig Error:"), chalk.red(err.message), chalk.bold(debugGetLastTwigExpressionOut() ? "'" + debugGetLastTwigExpressionOut() + "'" : ""), chalk.magenta(relativeFilePath));
                        reportedTwigErrors[errId] = 1;
                    }
                }
            }));


            g.on('end', function () {
                debugGetTwigTokenObjectReferences(body);
            });


            /* if (isProd)
             g.pipe(rename({extname: '.html'}));*/

            g
                .pipe(gulp.dest(config.buildDir));


            browserSync.reload();

        }).catch(function onAPIError(err, s, r) {
            gutil.log(chalk.red("Failed to request from Space CMS API:"), chalk.magenta(err));
        });

    });


});
