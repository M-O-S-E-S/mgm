angular.module('mgmApp')
.controller('IniEditController', function($scope, $modal, regionService, configService){
    
    var defaultSettingsStub = {"uuid":"0","name":"default settings","estateName":"MGM","node":"","isRunning":false};
    
    $scope.regions = regionService.getRegions();
    console.log($scope.regions);
    $scope.$on("regionService", function(){
        $scope.regions = regionService.getRegions();
        $scope.regions.push(defaultSettingsStub);
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
