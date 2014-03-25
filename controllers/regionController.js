angular.module('mgmApp')
.controller('RegionController', function($scope, $modal, regionService, estateService, hostService){
    $scope.regions = regionService.getRegions();
    $scope.$on("regionService", function(){
        $scope.regions = regionService.getRegions();
    });
    $scope.estates = estateService.getEstates();
    $scope.$on("estateService", function(){
        $scope.estates = estateService.getEstates();
    });
    $scope.hosts = hostService.getHosts();
    $scope.$on("hostService", function(){
        $scope.hosts = hostService.getHosts();
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
        modal: undefined,
        log: "",
        current: undefined,
        viewLog: function(region){
            this.current = region;
            this.modal = $modal.open({
                templateUrl: '/templates/regionLogModal.html',
                keyboard: false,
                scope: $scope,
                windowClass: 'log-dialog'
            });
            regionService.getLog(region).then(
                function(logs){ $scope.region.log = logs;}
            );
        },
        setHost: function(region, host){
            console.log(region.name + " " + host.name);
        }
    }
    
    regionService.updateRegions();
    hostService.updateHosts();
    estateService.updateEstates();
});
