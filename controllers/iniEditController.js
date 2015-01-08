angular.module('mgmApp')
.controller('IniEditController', function($scope, $modal, regionService, configService){
    
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
        alertify.success("loading config options for " + region.name);
        configService.read(region.uuid).then(
            function(data) {},
            function(error) { alertify.error(error); }
        );
        $scope.currentRegion = region;
    }
});
