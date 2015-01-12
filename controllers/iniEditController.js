angular.module('mgmApp')
.controller('IniEditController', function ($scope, $modal, $state, $stateParams, $location, regionService, configService) {
    
    var routeRegion = decodeURI($stateParams.regionName);
    var reselectRegion = function(){
        if(routeRegion && !$scope.currentRegion){
            console.log("resuming region: " + routeRegion);
            var result = $.grep($scope.regions, function(obj, index){ return obj['name'] == routeRegion; });
            if(result.length > 0){
                loadRegion(result[0]);
            } else {
                console.log("failed to resume region");
            }
        } else {
            generateEditConfig();
        }
    };
        
    $scope.search = {
        name: "",
        estateName: "",
        isRunning: "",
        node: ""
    };
    
    $scope.editDefault = function(){
        $location.path("/config/");
    };
    
    $scope.currentRegion = null;
    $scope.defaultConfig = configService.getDefaultConfig();
    $scope.regionConfig = null;
    $scope.editConfig = null;
    
    var generateEditConfig = function(){
        var newConfig = {};
        //populate default options
        angular.forEach($scope.defaultConfig, function(row, section){
            if(newConfig[section] == undefined){
                newConfig[section] = {};
            }
            angular.forEach(row, function(value, key){
                newConfig[section][key] = {"value":value, "source":"default"};
            });
        });
        //insert region specific options, overwriting is by design
        angular.forEach($scope.regionConfig, function(row, section){
            if(newConfig[section] == undefined){
                console.log("adding section: " + section);
                newConfig[section] = {};
            }
            angular.forEach(row, function(value, key){
                newConfig[section][key] = {"value":value, "source":"region"};
            });
        });
        $scope.editConfig = newConfig;
    }
    
    //we clicked on a region in the left panel
    var loadRegion = function(region){
        $scope.currentRegion = region;
        alertify.log("loading config options for " + region.name);
        configService.getConfig(region).then(
            function(regionConfig) { $scope.regionConfig = regionConfig;  generateEditConfig(); },
            function(error) { alertify.error(error); }
        );
    }
    $scope.select = function(region){
        if(region.name != routeRegion){
            $location.path("/config/"+encodeURI(region.name));
            return;
        }
        loadRegion(region);
    }
    
    $scope.regions = regionService.getRegions();
    reselectRegion();
    $scope.$on("regionService", function(){
        $scope.regions = regionService.getRegions();
        reselectRegion();
        //TODO: test if the current region was removed, and exit region config edit if true
    });
    $scope.$on("configService", function(){
        $scope.defaultConfig = configService.getDefaultConfig();
        generateEditConfig();
    });
});
