/* globals angular */

define(["angular"], function() {
    var constants = angular.module("constants", []);
    constants.constant("SPECS", "/specs");
    constants.constant("BUILD", "/build");
    constants.constant("dropdownData", {
        zipRadii: [
            {value: 5, name: 5},
            {value: 10, name: 10},
            {value: 15, name: 15},
            {value: 20, name: 20},
            {value: 30, name: 30}
        ],
        
        jobTypes: [
            {value: "fulltime", name: "Full-time"},
            {value: "parttime", name: "Part-time"},
            {value: "internship", name: "Internship"},
            {value: "commission", name: "Commission"},
            {value: "contract", name: "Contract"},
            {value: "temporary", name: "Temporary"}
        ],
        
        lookBacks: [
            {value: 5, name: 5},
            {value: 10, name: 10},
            {value: 15, name: 15},
            {value: 30, name: 30},
            {value: 100, name: 100}
        ],
        
        sorts: [
            {value: "date", name: "date"},
            {value: "relevance", name: "relevance"}
        ]
    });
});