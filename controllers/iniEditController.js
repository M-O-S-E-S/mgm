angular.module('mgmApp')
.controller('IniEditController', function($scope, $modal, $routeParams, $location, regionService, configService){
    
    var defaultSettingsStub = {"uuid":"0","name":"default settings","estateName":"MGM","node":"","isRunning":false};
    var routeRegion = decodeURI($routeParams.regionUuid);
    
    $scope.regions = regionService.getRegions();
    $scope.$on("regionService", function(){
        $scope.regions = regionService.getRegions();
        $scope.regions.push(defaultSettingsStub);
        if(routeRegion && !$scope.currentRegion){
            var result = $.grep($scope.regions, function(e){ return e['name'] == routeRegion; });
            if(result.length > 0){
                $scope.select(result[0]);
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
    $scope.editConfig = null;
    
    var generateEditConfig = function(){
        $scope.editConfig = {};
        //populate default options
        angular.forEach($scope.defaultConfig, function(row, section){
            if($scope.editConfig[section] == undefined){
                $scope.editConfig[section] = {};
            }
            angular.forEach(row, function(value, key){
                $scope.editConfig[section][key] = {"value":value, "source":"default"};
            });
        });
        //insert region specific options, overwriting is by design
        angular.forEach($scope.regionConfig, function(row, section){
            if($scope.editConfig[section] == undefined){
                $scope.editConfig[section] = {};
            }
            angular.forEach(row, function(value, key){
                $scope.editConfig[section][key] = {"value":value, "source":"default"};
            });
        });
    }
    
    //we clicked on a region in the left panel
    $scope.select = function(region){
        if(region.name != routeRegion){
            $location.path("/config/"+encodeURI(region.name));
            return;
        }
        
        $scope.regionConfig = null;
        
        if(region.uuid == "0"){
            $scope.currentRegion = defaultSettingsStub;
            generateEditConfig();
        } else {
            $scope.currentRegion = region;
            alertify.success("loading config options for " + region.name);
            configService.getConfig(region).then(
                function(data) { generateEditConfig(); },
                function(error) { alertify.error(error); }
            );
        }
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
