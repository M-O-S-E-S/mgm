angular.module('mgmApp')
.controller('IniEditController', function($scope, $modal, regionService){
    
    $scope.regions = regionService.getRegions();
    $scope.$on("regionService", function(){
        $scope.regions = regionService.getRegions();
    });
    
    $scope.search = {
        name: "",
        estateName: "",
        isRunning: "",
        node: ""
    };
    
    $scope.currentRegion = null;
    
    $scope.select = function(region){
        alertify.success(region.name);
        $scope.currentRegion = region;
    }
});
