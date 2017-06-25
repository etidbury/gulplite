#! /usr/bin/env node

const spawn = require('child_process').spawn;

/*console.log("Gulp Lite Version:",pkg.version);
console.log("Gulp Lite Directory:",__dirname);//fordebug: debug print
console.log("Project Directory:",process.cwd());//fordebug: debug print
console.log("Arguments:",process.argv.slice(2));//fordebug: debug print*/

const gulpCommands=process.argv.slice(2).length?process.argv.slice(2):['dev'];

if (gulpCommands.includes('-v')||gulpCommands.includes('--version')){
    const pkg=require('./package');
    console.log("Version: ",pkg.version);
    process.exit(1);
}

const e=__dirname+'/node_modules/.bin/babel-node';

const args=  [  '--presets=es2015,react'
    ,'--plugins=transform-object-rest-spread,transform-class-properties'
    ,__dirname+'/node_modules/.bin/gulp'
    ,'--gulpfile'
    ,__dirname+'/gulpfile.babel.js'
    ,'--cwd',process.cwd()

].concat(gulpCommands);

spawn('pwd',[] , {stdio:'inherit'});
spawn(e,args , {stdio:'inherit'});



