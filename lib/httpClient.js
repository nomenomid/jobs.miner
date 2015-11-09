/* globals PromiseKeeper */

require("./promise.js");
var http = require("http");

function httpClient(url) {
    if(url) this.setUrl(url);
}

httpClient.prototype.setUrl = function(url) {
    this.url = url;
    return this;
};

httpClient.prototype.get = function() {
    return new PromiseKeeper(function(resolve, reject) {
        http.get(this.url, function(response) {
            var data = "";
            response.on("data", function(d) {
                data += d; 
            });
            
            response.on("end", function() {
                resolve(data);
            });
        });  
    }.bind(this));
};


module.exports = httpClient;