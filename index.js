#! /usr/bin/env node

const spawn = require('child_process').spawn;

/*console.log("Gulp Lite Version:",pkg.version);
console.log("Gulp Lite Directory:",__dirname);//fordebug: debug print
console.log("Project Directory:",process.cwd());//fordebug: debug print
console.log("Arguments:",process.argv.slice(2));//fordebug: debug print*/



/*
todo: use this method instead...
// (from sails app.js)
// Ensure we're in the project directory, so cwd-relative paths work as expected
// no matter where we actually lift from.
// > Note: This is not required in order to lift, but it is a convenient default.
process.chdir(__dirname);
 */



const gulpCommands=process.argv.slice(2).length?process.argv.slice(2):['dev'];

if (gulpCommands.includes('-v')||gulpCommands.includes('--version')){
    const pkg=require('./package');
    console.log("Version: ",pkg.version);
    process.exit(1);
}

const execExtension=(process.platform.indexOf('win32')>-1 ||process.platform.indexOf('win64')>-1? '.cmd' : '');

const e=__dirname+'/node_modules/.bin/babel-node'+execExtension;

/*
const babel={
    plugins:[
        'transform-object-rest-spread'
        ,'transform-class-properties'
    ],
    presets:[
        'es2015',
        'react'
    ]
};*/


const fs=require('fs');


let bc=fs.readFileSync(__dirname+'/.babelrc');

bc=JSON.parse(bc);

const args=  [  '--presets='+bc.presets.join(',')
    ,'--plugins='+bc.plugins.join(',')
    ,__dirname+'/node_modules/gulp/bin/gulp.js'
    ,'--gulpfile'
    ,__dirname+'/gulpfile.babel.js'
    ,'--cwd',process.cwd()

].concat(gulpCommands);

//spawn('pwd',[] , {stdio:'inherit'});
spawn(e,args , {stdio:'inherit'});



