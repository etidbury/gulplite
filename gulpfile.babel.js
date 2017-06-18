'use strict';
const fs = require('fs');
const onlyScripts = require('./util/script-filter');

//import fs          from 'fs';
//import onlyScripts from './util/script-filter';

const TASKS = fs.readdirSync(__dirname + '/tasks/').filter(onlyScripts);

TASKS.forEach(function (task) {
    require('./tasks/' + task);
});
