angular.module('mgmApp')
.controller('RegionController', function($scope, regionService, estateService){
    $scope.regions = regionService.getRegions();
    $scope.$on("regionService", function(){
        $scope.regions = regionService.getRegions();
    });
    $scope.estates = estateService.getEstates();
    $scope.$on("estateService", function(){
        $scope.estates = estateService.getEstates();
    });
    
    $scope.delete = function(id){
        alertify.log("deleting a region is not currently implemented");
    };
    
    $scope.getEstate = function(uuid){
        return estateService.getEstateNameForRegion(uuid);
    }
    
    $scope.lastSeen = function(timestamp){
        if(timestamp == undefined || timestamp == ""){
            return "~";
        }
        var last = new Date(timestamp);
        var seconds = Math.floor(((new Date()).getTime() - last.getTime())/1000);
        
        var numdays = Math.floor(seconds / 86400);
        if(numdays > 0){
            return numdays + " days ago";
        }
        var numhours = Math.floor((seconds % 86400) / 3600);
        if(numhours > 0){
            return numhours + " hours ago";
        }
        var numminutes = Math.floor(((seconds % 86400) % 3600) / 60);
        return numminutes + " minutes ago";
    }
    
    $scope.hostInfo = function(node){
        return node;
    }
    
    $scope.collapse = {
        current: "",
        toggle: function(section){
            if( section == this.current ){
                this.current = "";
            } else {
                this.current = section;
            }
        }
    }
    
    $scope.search = {
        name: "",
        estateName: "",
        isRunning: "",
        node: ""
    };
    
    $scope.region = {
        viewLog: function(region){
            alertify.log(region.name);
        }
    }
    
    regionService.updateRegions();
    estateService.updateEstates();
});
