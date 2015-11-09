/* globals PromiseKeeper */

require("./promise.js");
var fs = require("fs");

var fsp = {}

fsp.readFile = function(fileName) {
    return new PromiseKeeper(function(resolve, reject) {
        fs.readFile(fileName, {encoding: "utf-8"}, function(err, data) {
            err ? reject(err) : resolve(data);
        });
    });  
};

fsp.writeFile = function(fileName, data) {
    return new PromiseKeeper(function(resolve, reject) {
        fs.writeFile(fileName, data, function(err) {
            err ? reject(err) : resolve(true);    
        });  
    });    
};

module.exports = fsp;