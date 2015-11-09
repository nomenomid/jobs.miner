/* globals PromiseKeeper */

require("./promise.js");
var fsp = require("./fs.promise.js");
var Iterator = require("./iterator.js");
var Indeed = require("./indeedApi.js");
var fs = require("fs");

var fetches = [];
var dataDir = "./data/";
var searchCriteria = {};
var dataFile;

Object.values = function(obj) {
    var values = [];
    Object.keys(obj).forEach(function(key) {
        values.push(obj[key]);    
    });
    return values;
};

var datasetVariables = {
    "occupation": "occupation",
    "l": "zip",
    "radius": "radius",
    "fromage": "recency",
    "jt": "job type",
    "salary": "salary",
    "description": "description",
    "jobtitle": "job title",
    "company": "company",
    "city": "city",
    "state": "state",
    "formattedLocation": "location",
    "source": "source",
    "date": "post date",
    "url": "url"
};

var searchParams = 6;

function arrayifyCriteria(criteria) {
    searchCriteria = criteria;
    var keys = Object.keys(criteria);
    keys.forEach(function(key) {
        if(typeof criteria[key].splice === "undefined") {
            criteria[key] = [criteria[key]];
        }    
    });
    return criteria;
}

function changeCriteriaNames(criteria) {
    criteria.occupation = criteria.occupations;
    delete criteria.occupations;
    return criteria;
}

function fetchAllData(criteria) {
    var iterator = new Iterator(criteria);
    iterator.iterate(fetchSpecific);
    return PromiseKeeper.sequence(fetches);
}

    function fetchSpecific(search) {
        var indeed = new Indeed(search);
        fetches.push(function(resolve, reject) {
            indeed.getData(resolve, reject);
        });
    }

function generateDataFileName() {
    do {
        dataFile = (Math.random() + "").split(".")[1] + ".txt";
    } while(fs.exists(dataDir + dataFile));
}

function writeDataFile(datasets) {
    var data = [];
    var variables = Object.keys(datasetVariables);
    var searchVariables = variables.slice(0, searchParams);
    var indeedVariables = variables.slice(searchParams);
    
    generateDataFileName();
    
    datasets.forEach(function(dataset) {
        dataset.data.forEach(function(row) {
            var record = [];
            searchVariables.forEach(function(searchVariable) {
                record.push(dataset.criteria[searchVariable]);    
            });
            
            indeedVariables.forEach(function(indeedVariable) {
                record.push(row[indeedVariable]);
            });
            
            data.push(record.join("\t"));
        });
    });
    
    data.unshift(Object.values(datasetVariables).join("\t"));
    return fsp.writeFile(dataDir + dataFile, data.join("\n"));
}

function buildDataset() {
    fetches = [];
    return new PromiseKeeper(function(resolve, reject) {
        fsp.readFile(dataDir + "searchSpecification.json")
           .then(JSON.parse)
           .then(arrayifyCriteria)
           .then(changeCriteriaNames)
           .then(fetchAllData)
           .then(writeDataFile)
           .then(function() {
               resolve(dataFile);
           })
           .catch(reject);
    });
}
   
module.exports = {
    buildDataset: buildDataset
};