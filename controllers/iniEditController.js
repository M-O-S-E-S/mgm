angular.module('mgmApp')
.controller('IniEditController', function($scope, $modal, $routeParams, regionService, configService){
    
    var defaultSettingsStub = {"uuid":"0","name":"default settings","estateName":"MGM","node":"","isRunning":false};
    
    $scope.regions = regionService.getRegions();
    $scope.$on("regionService", function(){
        $scope.regions = regionService.getRegions();
        $scope.regions.push(defaultSettingsStub);
        var routeRegion = $routeParams.regionUuid;
        if(routeRegion && !$scope.currentRegion){
            var result = $.grep($scope.regions, function(e){ return e['name'] == routeRegion; });
            if(result.length > 0){
                $scope.currentRegion = result[0];
            }
        }
    });
    
    $scope.search = {
        name: "",
        estateName: "",
        isRunning: "",
        node: ""
    };
    
    $scope.currentRegion = null;
    $scope.defaultConfig = null;
    $scope.regionConfig = null;
    
    $scope.configEdit = function(){
        var config = [];
        config = $scope.defaultConfig;
        return config;
    }
    
    //we clicked on a region in the left panel
    $scope.select = function(region){
        if(region.uuid == "0"){
            $scope.currentRegion = defaultSettingsStub;
            return;
        }
        alertify.success("loading config options for " + region.name);
        configService.getConfig(region).then(
            function(data) {},
            function(error) { alertify.error(error); }
        );
        $scope.currentRegion = region;
    }
    
    
    configService.getDefaultConfig().then(
        function(config){
            if(config.Success)
                $scope.defaultConfig = config.Config;
            else
                alertify.error("Error loading default configuration: " + config.Message)
        },
        function(readon){ alertify.error(reason); }
    );
});
