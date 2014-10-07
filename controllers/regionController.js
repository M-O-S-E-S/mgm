angular.module('mgmApp')
.controller('RegionController', function($scope, $modal, $filter, regionService, estateService, hostService, consoleService, taskService){
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
        var last = new Date(timestamp*1000);
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
                if(region.isRunning){
                    consoleService.open(region);
                }
            }
        },
        showContent: function(region){
            if(region.uuid == this.content){
                this.content = "";
            } else {
                this.content = region.uuid;
                this.manage = "";
            }
        }
    }
    
    $scope.oar = {
        file: "",
        modal: undefined,
        current: undefined,
        showLoad: function(region){
			this.current = region;
			this.modal = $modal.open({
                templateUrl: 'templates/loadOarModal.html',
                keyboard: false,
                scope: $scope
            });
		},
        showSave: function(region){
			this.current = region;
			this.modal = $modal.open({
                templateUrl: 'templates/saveOarModal.html',
                keyboard: false,
                scope: $scope
            });
		},
        save: function(){
			taskService.saveOar(this.current).then(
				function(){ alertify.success("Save oar initiated for region " + $scope.oar.current.name);  $scope.oar.modal.close();  },
				function(msg){ alertify.error(msg);  }
			);
        },
        nuke: function(region){
            alertify.confirm("Are you sure? This will irreversably wipe out any content you have in your region.", function(confirmed){
                if(confirmed){
                    taskService.nukeRegion(region).then(
                        function(){ alertify.success("Nuke initiated for region " + region.name);  },
                        function(msg){ alertify.error(msg);  }
                    );
                };
            });
        },
        load: function(merge, x, y ,z){
			if(merge == undefined) merge = false;
            var data = new FormData();
            data.append('file', $scope.oar.file[0]);
            
            taskService.loadOar($scope.oar.current, data, merge, x, y, z).then(
                function(){ alertify.success("Load oar initiated for region " + $scope.oar.current.name); $scope.oar.modal.close(); },
                function(msg){ alertify.error(msg);  }
            );
        }
    };
    
    $scope.search = {
        name: "",
        estateName: "",
        isRunning: "",
        node: ""
    };
    
    $scope.estateFromName = function(name){
		for(var i = 0; i < $scope.estates.length; i++){
			if($scope.estates[i].name == name){
				return $scope.estates[i];
			}
		}
		return null;
	};
	
	$scope.hostFromAddress = function(address){
		for(var i = 0; i < $scope.hosts.length; i++){
			if($scope.hosts[i].address == address){
				return $scope.hosts[i];
			}
		}
		return {'name':'none'};
	};
    
    $scope.region = {
        modal: undefined,
        log: "",
        current: undefined,
        viewLog: function(region){
            this.current = region;
            regionService.getLog(region).then(
                function(logs){ 
                    $scope.region.log = logs.split("\n");
                    $scope.region.modal = $modal.open({
                        templateUrl: 'templates/regionLogModal.html',
                        keyboard: false,
                        scope: $scope,
                        windowClass: 'log-dialog'
                    });
                },
                function(){
                    alertify.error("Logs not found for region " + region.name);
                }
            );
        },
        setHost: function(region, host){
			var hostName = "None";
			if( host && host.name != "none"){
				hostName = host.name;
			}
            regionService.setHost(region, host).then(
                function(){ alertify.success("Region " + region.name + " moved to Host " + hostName ); },
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
        },
        remove: function(region){
			alertify.confirm("Do you really want to destroy " + region.name + " and all content?", function(confirmed){
				if(confirmed){
					regionService.remove(region).then(
						function(){ alertify.success("Region " + region.name + " has been deleted"); },
						function(msg){ alertify.error(msg); }
					);
				};
			});
        },
        showAdd: function(){
            this.modal = $modal.open({
                templateUrl: 'templates/createRegionModal.html',
                keyboard: false,
                scope: $scope
            });
        },
        add: function(name, x, y, size, estate){
            if(name == undefined || name == ""){
                alertify.error("Name is required");
                return;
            }
            if(x == undefined || x == ""){
                alertify.error("position x is required");
                return;
            }
            if(y == undefined || y == ""){
                alertify.error("position y is required");
                return;
            }
            if(size == undefined){
				alertify.error("size is required");
				return;
			}
            if( Math.floor(x) != x || Math.floor(y) != y){
                alertify.error("X and Y must be integer coordinates");
                return;
            }
            if( Math.floor(size) != size ){
				alertify.error("Region Size must be an integer value");
				return;
			}
			if( size <= 0 || size > 32){
				alertify.error("Region size must be a positive integer between 1 and 32");
				return;
			}
            if(estate == null || estate == undefined){
                alertify.error("estate is required");
                return;
            }
            for(var i = 0; i < $scope.regions.length; i++){
				console.log(size, $scope.regions[i].size);
				//check for existing region origin in new region space
				var diff = $scope.regions[i].x - x;
				if(diff >= 0 && diff < size){
					diff = $scope.regions[i].y - y;
					if(diff >= 0 && diff < size){
						alertify.error("Error, region " + $scope.regions[i].name + " overlaps at those coordinates");
						return;
					}
				}
				//check for new region origin in existing region space
				var diff = x - $scope.regions[i].x;
				if(diff >= 0 && diff < $scope.regions[i].size){
					diff = y - $scope.regions[i].y;
					if(diff >= 0 && diff < $scope.regions[i].size){
						alertify.error("Error, region " + $scope.regions[i].name + " overlaps at those coordinates");
						return;
					}
				}
            }
            regionService.add(name,x,y,size,estate).then(
                function(){ alertify.success("Region " + name + " created");  $scope.region.modal.close(); },
                function(msg){ alertify.error(msg); }
            );
        },
        startListed: function(){
            var listed = $filter('filter')($scope.regions, $scope.search);
            for(var i = 0; i < listed.length; i++){
                $scope.region.start(listed[i]);
            }
        },
        stopListed: function(){
            var listed = $filter('filter')($scope.regions, $scope.search);
            for(var i = 0; i < listed.length; i++){
                $scope.region.stop(listed[i]);
            }
        }
    }
});
