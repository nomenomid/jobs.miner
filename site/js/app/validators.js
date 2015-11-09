/* globals define angular */

define(["angular"], function() {
    var validators = angular.module("validators", []);
    validators.directive("salaryGroups", function() {
        return {
            require: "ngModel",
            link: function(scope, element, attrs, ctrl) {
                ctrl.$validators.salaryGroups = function(modelValue, viewValue) {
                    var salaries = viewValue + "";
                    salaries = salaries.split(",");
                    var oneNonRange = false;
                    var salaryGroup;
                    var integerRegex = /^\d+$/;
                    
                    for(var i = 0, l = salaries.length; i < l; i++) {
                        salaryGroup = salaries[i].split("-");
                        if(salaryGroup.length > 2) return false;
                        if(salaryGroup.length === 1) {
                            if(oneNonRange) return false;
                            else oneNonRange = true;
                        }
                        
                        for(var j = 0, lj = salaryGroup.length; j < lj; j++) {
                            if(!integerRegex.test(+salaryGroup[j])) return false;
                        }
                        
                        if(salaryGroup.length === 2 && +salaryGroup[0] >= +salaryGroup[1]) return false;
                    }
                    
                    return true;
                }; 
            }
        }; 
    });
    
    validators.directive("unique", function() {
        return {
            require: "ngModel",
            link: function(scope, element, attrs, ctrl) {
                ctrl.$validators.unique = function(modelValue, viewValue) {
                    var occupations = typeof scope.search === "undefined" ? [] : scope.search.occupations;
                    for(var i = 0, l = occupations.length; i < l && viewValue; i++) {
                        if(scope.edit && 
                           occupations[i][attrs.unique].toLowerCase() === viewValue.toLowerCase() && 
                           scope.currentIndex !== i ||
                           !scope.edit && 
                           occupations[i][attrs.unique].toLowerCase() === viewValue.toLowerCase()) {
                            return false;
                        }
                    }
                    
                    return true;
                };
            }    
        };
    });
});