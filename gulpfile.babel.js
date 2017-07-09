'use strict';
const fs = require('fs');
const onlyScripts = require('./util/script-filter');

const TASKS = fs.readdirSync(__dirname + '/tasks/').filter(onlyScripts);

global.tmpDir = ".build_tmp/";

TASKS.forEach(function (task) {
    require('./tasks/' + task);
});
