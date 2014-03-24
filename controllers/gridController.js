angular.module('mgmApp')
.controller('GridController', function($scope, $modal, estateService, hostService, userService, regionService){
    $scope.estates = estateService.getEstates();
    $scope.$on("estateService", function(){
        $scope.estates = estateService.getEstates();
    });
    $scope.hosts = hostService.getHosts();
    $scope.$on("hostService", function(){
        $scope.hosts = hostService.getHosts();
    });
    $scope.users = userService.getUsers();
    $scope.$on("userService", function(){
        $scope.users = userService.getUsers();
    });
    $scope.regions = regionService.getRegions();
    $scope.$on("regionService", function(){
        $scope.regions = regionService.getRegions();
    });
    
    $scope.regionCount = function(address){
        var count = 0;
        for(var i = 0; i < $scope.regions.length; i++){
            if($scope.regions[i].node == address){
                count = count + 1;
            }
        }
        return count;
    };
    
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
    
    $scope.userName = function(uuid){
        for(var i = 0; i < $scope.users.length; i++){
            if($scope.users[i].uuid == uuid){
                return $scope.users[i].name
            }
        }
        return "~";
    };
    $scope.userNameList = function(users){
        var names = [];
        for(var i = 0; i < users.length; i++){
            for(var j = 0; j < $scope.users.length; j++){
                if($scope.users[j].uuid == users[i]){
                    names.push($scope.users[j].name);
                    break;
                }
            }
        }
        return names.join();
    }
    
    $scope.host = {
        remove: function(host){
            alertify.confirm("Are you sure you want to delete this host?  Any processes still running may need to be manually shut down.", function(confirmed){
                if(confirmed){
                    hostService.remove(host);//.then(function(){ console.log("success"); },function(msg){console.log(msg);});
                }
            });
        },
        add: function(){
            alertify.prompt("Register a new region host by entering its ip address as seen from MGM:", function(confirmed, address){
                if(confirmed){
                    Pattern = /^\d{1,3}.\d{1,3}.\d{1,3}.\d{1,3}$/
                    if( ! address.match(Pattern)){
                        alertify.error('Add Host Error: Invalid ip entered');
                        return;
                    }
                    hostService.add(address);//.then(function(){ console.log("success"); },function(msg){console.log(msg);});
                }
            });
        }
    }

    
    $scope.estate = {
        modal: undefined,
        name: "",
        owner: "",
        remove: function(est){
            alertify.confirm("Are you sure you want to delete this estate?  Any running processes in this estate will need to be restarted", function(confirmed){
                if(confirmed){
                    estateService.remove(est);
                }
            });
        },
        showAddModal: function(){
            this.modal = $modal.open({
                templateUrl: '/templates/addEstateModal.html',
                keyboard: false,
                scope: $scope
            });
        },
        add: function(){
            //check for empty name
            if(this.name == ""){
                alertify.error("Estate name cannot be empty");
                return;
            }
            //check for duplicate estate name
            for(var i = 0; i < $scope.estates.length; i++){
                if($scope.estates[i].name == this.name){
                    alertify.error("Estate name " + this.name + " already exists");
                    return;
                }
            }
            estateService.add(this.owner.uuid, this.name);
            this.modal.close();
        },
        cancel: function(){
            this.modal.close();
        }
    }
    
    estateService.updateEstates();
    hostService.updateHosts();
    userService.updateUsers();
    regionService.updateRegions();
});
