#! /usr/bin/env node

const spawn = require('child_process').spawn;

const pkg=require('./package');

/*
console.log("Gulp Lite Version:",pkg.version);
console.log("Gulp Lite Directory:",__dirname);//fordebug: debug print
console.log("Project Directory:",process.cwd());//fordebug: debug print
console.log("Arguments:",process.argv.slice(2));//fordebug: debug print
*/

const gulpCommands=process.argv.slice(2).length?process.argv.slice(2):['dev'];

if (gulpCommands.includes('-v')||gulpCommands.includes('--version'))
    return console.log("Version: ",pkg.version);

//console.log("Setting up Gulp for project: ",project_pkg.name);//fordebug: debug print
spawn(__dirname+'/node_modules/.bin/gulp',gulpCommands, {stdio:'inherit'});



