angular.module('mgmApp')
.controller('RegionController', function($scope, $modal, regionService, estateService, hostService, consoleService){
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
        content: "",
        manage: "",
        showManage: function(region){
            if( region.uuid == this.manage ){
                this.manage = "";
                consoleService.close();
            } else {
                this.manage = region.uuid;
                this.content = "";
                consoleService.open(region);
            }
        },
        showContent: function(region){
            if(region == this.content){
                this.content = "";
            } else {
                this.content = region.uuid;
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
            regionService.setHost(region, host).then(
                function(){ alertify.success("Region " + region.name + " moved to Host " + host.address); },
                function(msg){ alertify.error(msg); }
            );
        },
        setEstate: function(region, estate){
            regionService.setEstate(region, estate).then(
                function(){ alertify.success("Region " + region.name + " moved to Estate " + estate.name); },
                function(msg){ alertify.error(msg); }
            );
        },
        start: function(region){
            regionService.start(region).then(
                function(){ alertify.success("Region " + region.name + " signalled to start"); },
                function(msg){ alertify.error(msg); }
            );
        },
        stop: function(region){
            regionService.stop(region).then(
                function(){ alertify.success("Region " + region.name + " signalled to stop"); },
                function(msg){ alertify.error(msg); }
            );
        }
    }
    
    regionService.updateRegions();
    hostService.updateHosts();
    estateService.updateEstates();
});
