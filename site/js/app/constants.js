/* globals angular */

define(["angular"], function() {
    var constants = angular.module("constants", []);
    constants.constant("SPECS", "/specs");
    constants.constant("BUILD", "/build")
});