/* globals define angular */

define(["angular", "app/constants", "jquery"], function() {
    var controllers = angular.module("controllers", ["constants"]);
    controllers.controller("MainCtrl", mainCtrl);
    
    function mainCtrl($scope, $http, $timeout, SPECS, BUILD, dropdownData) {
        $http.get(SPECS)
             .then(function(specs) {
                 processSpecs(specs.data);
                 initialize(specs.data);
             });
        
        function processSpecs(specs) {
            var list = ["radius", "fromage"];
            list.forEach(function(spec) {
                if(typeof specs[spec] !== "undefined") {
                    specs[spec] = +specs[spec];
                }    
            });
        }
        
        function initialize(specs) {
            $scope.search = specs;
            $scope.occupation = {};
            $scope.edit = false;
            $scope.currentIndex = -1;
            $scope.modal = false;
            $scope.processing = false;
            $scope.download = false;
            $scope.complete = false;
            
            $scope.zipRadii = dropdownData.zipRadii;
            $scope.jobTypes = dropdownData.jobTypes;
            $scope.lookBacks = dropdownData.lookBacks;
            $scope.sorts = dropdownData.sorts;
            
            if(typeof $scope.search.occupations === "undefined") {
                $scope.search.occupations = [];
                $scope.search.radius = $scope.zipRadii[1].value;
                $scope.search.fromage = $scope.lookBacks[2].value;
                $scope.search.sort = $scope.sorts[1].value;
            }
        
            $scope.displayOccupationForm = function(display) {
                $scope.showOccupationForm = display;
                $scope.edit = false;
                $scope.occupation = {};
            };
            
            $scope.saveOccupation = function() {
                var occupation = angular.copy($scope.occupation);
                $scope.occupation = {};
                
                $scope.edit ?
                    $scope.search.occupations.splice($scope.currentIndex, 1, occupation) :
                    $scope.search.occupations.push(occupation);
                $scope.showOccupationForm = false;
                $scope.edit = false;
            };
            
            $scope.removeOccupation = function(index) {
                $scope.search.occupations.splice(index, 1);
            };
            
            $scope.emptyCriteria = function() {
                var keys = Object.keys($scope.occupation);
                var numComplete = 0;
    
                for(var i = 0, l = keys.length; i < l; i++) {
                    if($scope.occupation[keys[i]]) {
                        numComplete++;
                    }
                }

                return numComplete > 1 ? false : true;
            };
            
            $scope.editOccupation = function(index) {
                $scope.showOccupationForm = true;
                $scope.edit = true;
                $scope.currentIndex = index;
                $scope.occupation = angular.copy($scope.search.occupations[index]);
                console.log($scope.occupation);
            };
                
                function processing() {
                    $scope.modal = true;
                    $scope.processing = true;
                }
                
            $scope.saveSearchSpecs = function() {
                processing();
                $http.post(SPECS, $scope.search)
                     .then(function(response) {
                         $timeout(function() {
                             $scope.complete = true;
                             $timeout(function() {
                                 $scope.modal = false; 
                                 $scope.complete = false;
                             }, 500);
                         }, 1000);
                     });
            };
            
            $scope.generateData = function() {
                processing();
                $http.post(BUILD, $scope.search)
                     .then(function(response) {
                         $timeout(function() {
                              $scope.processing = false;
                              $scope.download = true;
                              $scope.dataFile = response.data;
                         }, 1000); 
                     });
                
            };
            
            $scope.downloadFile = function() {
                $scope.modal = false;
                $scope.download = false;
            };
        }
    }
});