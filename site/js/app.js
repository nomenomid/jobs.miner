/* globals angular */

require(["angular", "app/controllers", "app/validators"], function() {
    angular.module("jobsMiner", ["controllers", "validators"]);
    angular.bootstrap(document, ["jobsMiner"]);     
});