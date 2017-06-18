'use strict';
let config;

const defaultConfig= require(__dirname+'/package.json').config['default'];

try{
    config=require(process.cwd()+'/package.json').config['gulplite'];

    if (typeof config!=="object") throw("Invalid configuration format specified");

}catch(err){
    config={};
}

module.exports=Object.assign(defaultConfig, config);
