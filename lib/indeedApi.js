/* globals PromiseKeeper */

require("./promise.js");
var jsdom = require("node-jsdom");
var httpClient = require("./httpClient.js");
var jquery = "http://code.jquery.com/jquery.js";

function Indeed(search) {
    this.data = [];
    this.numberOfRecords;
    this.connection = new httpClient();
    this.criteria = {
        publisher: "1018862029525284",
        format: "json",
        v: "2",
        highlight: 0,
        start: 0,
        filter: 1,
        limit: 25
    };
    
    if(search) this.setSearchCriteria(search);
}

Indeed.prototype.urlProto = "http://api.indeed.com/ads/apisearch?";

Indeed.prototype.setSearchCriteria = function(search) {
    this.numberOfRecords = search.numberOfRecords;
    this.criteria.occupation = search.occupation.name;
    this.setKeywordsCriteria(search.occupation);
    delete search.numberOfRecords;
    delete search.occupation;
    Object.keys(search).forEach(function(key) {
        this.criteria[key] = (search[key] + "").replace(/\s+/g, "");
    }.bind(this));
};

Indeed.prototype.setKeywordsCriteria = function(occupation) {
    var exclude = ["name"];
    this.criteria.q = "";
    Object.keys(occupation).forEach(function(key) {
        if(exclude.indexOf(key) !== -1) return;
        switch(key) {
            case "allWords":
                this.criteria.q += occupation[key].replace(/\s+/g, "+");
                break;
            case "anyWords":
                this.criteria.q += "(" + occupation[key].replace(/\s+/g, "+or+") + ")";
                break;
            case "excludeWords":
                this.criteria.q += occupation[key].replace(/(\b\w+\.?\w*\b)/g, "-$1").replace(/\s+/g, "+");
                break;
            case "titleWords":
                this.criteria.q += "title:(" + occupation[key].replace(/\s+/g, "+") + ")";
                break;
            case "exactPhrase":
                this.criteria.q += "\"" + occupation[key].replace(/\s+/g, "+") + "\"";
        }
        this.criteria.q += "+";
    }.bind(this));
    this.criteria.q = this.criteria.q.substring(0, this.criteria.q.length - 1);
};

Indeed.prototype.generateUrl = function() {
    var keys = Object.keys(this.criteria);
    var exclude = ["occupation"];
    this.url = this.urlProto;
    keys.forEach(function(key) {
        if(exclude.indexOf(key) === -1) {
            this.url += key + "=" + this.criteria[key] + "&";
        }
    }.bind(this));
    this.url = this.url.substring(0, this.url.length - 1);
    return this.url;
};

    function getDescriptions(results) {
        var descriptionFetches = [];
        results.forEach(function(result) {
            descriptionFetches.push(new PromiseKeeper(function(resolve, reject) {
                getDescription(result, resolve, reject);
            }));   
        });
        
        return PromiseKeeper.all(descriptionFetches);
    }
    
    function getDescription(result, resolve, reject) {
        jsdom.env({
            url: result.url,
            scripts: [jquery],
            done: function(errors, window) {
                result.description = window.$("#job_summary").html().replace(/<br\s*\/?>/gi, " ").replace(/(<([^>]+)>)+/gi, " ").replace(/\s+/g, " ").replace(/^\s+/gi, "");
                resolve(true);
            }
        }); 
    }

Indeed.prototype.getData = function(resolve, reject, run) {
    this.connection.setUrl(this.generateUrl()).get().then(function(data) {
        data = JSON.parse(data);
        
        if(typeof run === "undefined") {
            if(this.numberOfRecords.indexOf("%") !== -1) {
                this.numberOfRecords = Math.floor((data.totalResults * this.numberOfRecords.replace("%", "")) / 100);
            } else {
                this.numberOfRecords = +this.numberOfRecords;
            }
            run = 1;
        }

        if(+data.totalResults < this.numberOfRecords || this.numberOfRecords === 0) {
            reject("Number of requested records below available");
        } else {
            if(data.results.length > this.numberOfRecords) {
                data.results = data.results.slice(0, this.numberOfRecords);
            }
            
            getDescriptions(data.results).then(function() {
                this.data = this.data.concat(data.results);
                var toGet = this.numberOfRecords - this.data.length;
                console.log(this.criteria.start);
                if(toGet > 0) {
                    this.criteria.start = this.criteria.start + this.criteria.limit;
                    if(toGet < this.criteria.limit) this.criteria.limit = toGet;
                    this.getData(resolve, reject, run + 1);
                } else {
                    console.log("finished with dataset");
                    resolve(this);
                }
                
            }.bind(this), console.log);
        }
    }.bind(this), console.log);
};

module.exports = Indeed;