angular.module('mgmApp')
.controller('IniEditController', function ($scope, $modal, $state, $stateParams, $location, regionService, configService) {
    
    var routeRegion = decodeURI($stateParams.regionName);
    var reselectRegion = function(){
        if(routeRegion && !$scope.currentRegion){
            var result = $.grep($scope.regions, function(obj, index){ return obj['name'] == routeRegion; });
            if(result.length > 0){
                loadRegion(result[0]);
            }
        } else {
            generateEditConfig();
        }
    };
    
    $scope.config = {
        current: undefined,
        candidate: {section: "", key: "", value: ""},
        modal: undefined,
        modify: function(sec, k, v){
            this.current = {section:sec, key: k, value: v};
            this.candidate = {section:sec, key: k, value: v};
            this.modal = $modal.open({
                templateUrl: '/templates/configModal.html',
                keyboard: false,
                scope: $scope
            });
        },
        create: function(){
            this.current = {section:"", key: "", value: ""};
            this.candidate = {section:"", key: "", value: ""};
            this.modal = $modal.open({
                templateUrl: '/templates/configModal.html',
                keyboard: false,
                scope: $scope
            });
        },
        default: function(sec, k){
            //remove an overriding config from a region
            alertify.confirm("Do you really want to revert " + sec + " -> " + k + " to default?", function(confirmed){
				if(confirmed){
					configService.deleteConfig($scope.currentRegion, sec, k).then(
						function(){
                            alertify.success("Config " + sec + " -> " + k + " has been reverted");
                            if($scope.defaultConfig[sec]){
                                if($scope.defaultConfig[sec][k]){
                                    $scope.editConfig[sec][k].value = $scope.defaultConfig[sec][k];
                                    $scope.editConfig[sec][k].source = "default";
                                    return;
                                }
                            }
                            //we do not have a default value, remove the record locally
                            delete $scope.editConfig[sec][k];
                        },
						function(msg){ alertify.error(msg); }
					);
				};
			});
        },
        submit: function(){
            if(this.candidate.section == ""){
                alertify.error("Error: Section is required");
                return;
            }
            if(this.candidate.key == ""){
                alertify.error("Error: Key is required");
                return;
            }
            if(this.candidate.value == ""){
                alertify.error("Error: Value is required");
                return;
            }
            if(this.candidate.section == this.current.section && this.candidate.key == this.current.key && this.candidate.value == this.current.value){
                alertify.error("Error: no fields have changed, not submitting to server");
                return;
            }
            
            //clear to submit
            configService.setConfig($scope.currentRegion, $scope.config.candidate.section,  $scope.config.candidate.key,  $scope.config.candidate.value).then(
                function(){
                    alertify.success("Config updated");
                    $scope.config.modal.close();
                    if($scope.currentRegion){
                        if(!$scope.regionConfig[$scope.config.candidate.section])
                            $scope.regionConfig[$scope.config.candidate.section] = {};
                        $scope.regionConfig[$scope.config.candidate.section][$scope.config.candidate.key] = $scope.config.candidate.value;
                    } else {
                        if(!$scope.defaultConfig[$scope.config.candidate.section])
                            $scope.defaultConfig[$scope.config.candidate.section] = {};
                        $scope.defaultConfig[$scope.config.candidate.section][$scope.config.candidate.key] = $scope.config.candidate.value;
                    }
                    generateEditConfig();
                },
                function(reason){   alertify.error("Error updating config: " + reason); }
            );
        },
        delete: function(sec, k){
            //this is for default options only, delete option....
             alertify.confirm("Do you really want to delete the MGM default value for " + sec + " -> " + k + "?  This can have averse affects if Opensim requires it", function(confirmed){
				if(confirmed){
                    configService.deleteConfig(null, sec, k).then(
                        function(){
                            alertify.success("The default value has been deleted");
                            delete $scope.defaultConfig[sec][k];
                            generateEditConfig();
                        },
                        function(reason){
                            alertify.error(reason);
                        }
                    );
                }
             });
        }
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
        alertify.log("loading config options for " + region.name);
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
        if($scope.currentRegion)
            loadRegion($scope.currentRegion);
        generateEditConfig();
    });
});
