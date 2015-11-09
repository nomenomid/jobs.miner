/* globals PromiseKeeper */

require("./lib/promise.js");
var express = require("express");
var fsp = require("./lib/fs.promise.js");
var bodyParser = require("body-parser");
var jobsApiManager = require("./lib/jobsApiManager.js");
var app = express();
var port = process.env.PORT || 5000;
var dataDir = __dirname + "/data/";
var searchSpecificationFile = "./data/searchSpecification.json";
var rimraf = require("rimraf");

app.use(express.static("site"));
app.use(bodyParser());

function saveData(data) {
    return fsp.writeFile(searchSpecificationFile, JSON.stringify(data));
}

app.get("/specs", function(request, response) {
    fsp.readFile(searchSpecificationFile)
       .then(response.send.bind(response));
});

app.get("/file/:file", function(request, response) {
    response.sendFile(dataDir + request.params.file, function(err) {
        if(err) response.status(404).send("File [" + request.params.file + "] not found.");
        else rimraf(dataDir + request.params.file, function() {});
    });
});

app.post("/specs", function(request, response) {
    saveData(request.body).then(response.send.bind(response));
});

app.post("/build", function(request, response) {
    saveData(request.body)
        .then(jobsApiManager.buildDataset, console.log)
        .then(response.send.bind(response), console.log);
});

app.listen(port, function() {
    console.log("Express server listening on port %d in %s mode", port, app.settings.env);    
});