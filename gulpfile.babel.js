'use strict';
const fs = require('fs');
const onlyScripts = require('./util/script-filter');

const TASKS = fs.readdirSync(__dirname + '/tasks/').filter(onlyScripts);

global.tmpDir = "._gulplite/";
global.isStage =false;

try {fs.rmdirSync(tmpDir);}catch(e){/*ignore*/}
try {fs.mkdirSync(tmpDir);}catch(e){/*ignore*/}


TASKS.forEach(function (task) {
    require('./tasks/' + task);
});
