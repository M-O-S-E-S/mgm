
var mgmApp = angular.module('mgmApp',['ngRoute','ui.bootstrap']);

mgmApp.service('taskService', function($rootScope, $http){
    var tasks = [];
    this.getTasks = function(){ return tasks; };
    this.addTask = function(task) { 
        tasks.push(task);
        $rootScope.$broadcast("taskService", "update");
    };
    this.updateTasks = function(){
        $http.get("/server/task").success(function(data, status, headers, config){
            if(data.Success){
                tasks = data.Tasks;
                $rootScope.$broadcast("taskService", "update");
            }
        });
    };
    this.remove = function(id){
        $http.post("/server/task/delete/" + id)
            .success(function(data, status, headers, config){
                if(data.Success){
                    delete tasks[id];
                    $rootScope.$broadcast("taskService", "update");
                } else {
                    alertify.error(data.Message);
                }
            });
    };
    $rootScope.$on("mgmUpdate", this.updateTasks);
});

mgmApp.service('regionService', function($rootScope, $http, $q){
    var regions = [];
    this.getRegions = function(){
        return regions;
    };
    this.addRegion = function(region) { 
        regions.push(region);
        $rootScope.$broadcast("regionService");
    };
    this.updateRegions = function(){
        $http.get("/server/region").success(function(data, status, headers, config){
            if(data.Success){
                regions = data.Regions;
                $rootScope.$broadcast("regionService");
            }
        });
    };
    this.remove = function(id){
        $http.post("/server/region/delete/" + id)
            .success(function(data, status, headers, config){
                if(data.Success){
                    delete regions[id];
                    $rootScope.$broadcast("regionService");
                } else {
                    alertify.error(data.Message);
                }
            });
    };
    this.getLog = function(region){
        var defer = new $q.defer();
        $http.get("/server/region/logs/" + region.uuid)
        .success(function(data, status, headers, config){
            defer.resolve(data);
        });
        return defer.promise;
    };
    this.setEstate = function(region, estate){
        var defer = new $q.defer();
        $http.post("/server/region/estate/" + region.uuid, {'estate': estate.id})
        .success(function(data, status, headers, config){
            if(data.Success){
                region.estateName = estate.name;
                defer.resolve();
            } else {
                defer.reject(data.Message);
            }
        });
        return defer.promise;
    };
    this.setHost = function(region, host){
        var defer = new $q.defer();
        $http.post("/server/region/host/" + region.uuid, {'host': host? host.address : 'none'})
        .success(function(data, status, headers, config){
            if(data.Success){
                region.node = host.address;
                defer.resolve();
            } else {
                defer.reject(data.Message);
            }
        });
        return defer.promise;
    };
    this.start = function(region){
        var defer = new $q.defer();
        $http.post("/server/region/start/" + region.uuid)
        .success(function(data, status, headers, config){
            if(data.Success){
                defer.resolve();
            } else {
                defer.reject(data.Message);
            }
        });
        return defer.promise;
    };
    this.stop = function(region){
        var defer = new $q.defer();
        $http.post("/server/region/start/" + region.uuid)
        .success(function(data, status, headers, config){
            if(data.Success){
                defer.resolve();
            } else {
                defer.reject(data.Message);
            }
        });
        return defer.promise;
    };
    $rootScope.$on("mgmUpdate", this.updateRegions);
});

mgmApp.service('estateService', function($rootScope, $http, $q){
    var estates = [];
    this.getEstates = function(){ return estates; };
    this.add = function(owner, name) {
        var defer = new $q.defer();
        $http.post("/server/estate/create", {'name': name, 'owner': owner.uuid})
        .success(function(data, status, headers, config){
            if(data.Success){
                estates.push({name:name, owner:owner.uuid, managers:[], regions:[]});
                defer.resolve();
                $rootScope.$broadcast("estateService");
            } else {
                defer.reject("Error adding new estate: " + data.Message);
            }
        });
        return defer.promise;
    };
    this.updateEstates = function(){
        $http.get("/server/estate").success(function(data, status, headers, config){
            if(data.Success){
                estates = data.Estates;
                $rootScope.$broadcast("estateService");
            }
        });
    };
    this.remove = function(est){
        var defer = new $q.defer();
        $http.post("/server/estate/destroy/" + est.id)
            .success(function(data, status, headers, config){
                if(data.Success){
                    var index = estates.indexOf(est);
                    estates.splice(index,1);
                    defer.resolve();
                    $rootScope.$broadcast("estateService");
                } else {
                    defer.reject(data.Message);
                }
            });
        return defer.promise;
    };
    $rootScope.$on("mgmUpdate", this.updateEstates);
});

mgmApp.service('hostService', function($rootScope, $http, $q){
    var hosts = [];
    this.getHosts = function(){ return hosts; };
    this.add = function(address) {
        var defer = new $q.defer();
        $http.post("/server/host/add", {'name': null, 'host': address})
        .success(function(data, status, headers, config){
            if(data.Success){
                hosts.push({address:address,regions:[]});
                $rootScope.$broadcast("hostService");
                defer.resolve();
            } else {
                defer.reject(data.Message);
            }
        });
        return defer.promise;
    };
    this.updateHosts = function(){
        $http.get("/server/host").success(function(data, status, headers, config){
            if(data.Success){
                hosts = data.Hosts;
                $rootScope.$broadcast("hostService");
            }
        });
    };
    this.remove = function(host){
        var defer = new $q.defer();
        $http.post("/server/host/remove", {'host': host.address})
            .success(function(data, status, headers, config){
                if(data.Success){
                    var index = hosts.indexOf(host);
                    hosts.splice(index,1);
                    $rootScope.$broadcast("hostService");
                    defer.resolve();
                } else {
                    defer.reject(data.Message);
                }
            });
        return defer.promise;
    };
    $rootScope.$on("mgmUpdate", this.updateHosts);
});

mgmApp.service('userService', function($rootScope, $http, $q){
    var users = [];
    var pending = [];
    this.getUsers = function(){ return users; };
    this.getPending = function(){ return pending; };
    this.addUser = function(user) { 
        users.push(host);
        $rootScope.$broadcast("userService");
    };
    this.updateUsers = function(){
        $http.get("/server/user").success(function(data, status, headers, config){
            if(data.Success){
                users = data.Users;
                pending = data.Pending;
                $rootScope.$broadcast("userService");
            }
        });
    };
    this.remove = function(user){
        var defer = new $q.defer();
        $http.post("/server/user/destroy/" + user.uuid)
        .success(function(data, status, headers, config){
            if(data.Success){
                var index = users.indexOf(user);
                users.splice(index,1);
                defer.resolve();
                $rootScope.$broadcast("userService");
            } else {
                defer.reject(data.Message);
            }
        });
        return defer.promise;
    };
    this.approvePending = function(user){
        var defer = new $q.defer();
        $http.post("/server/user/approve", {"email": user.email})
        .success(function(data, status, headers, config){
            if(data.Success){
                var index = pending.indexOf(user);
                pending.splice(index,1);
                users.push(user);
                $rootScope.$broadcast("userService");
                defer.resolve();
            } else {
                defer.reject(data.Message);
            }
        });
        return defer.promise;
    };
    this.denyPending = function(user, reasons){
        var defer = new $q.defer();
        $http.post("/server/user/deny", {"email": user.email, 'reason': reasons})
        .success(function(data, status, headers, config){
            if(data.Success){
                var index = pending.indexOf(user);
                pending.splice(index,1);
                $rootScope.$broadcast("userService");
                defer.resolve();
            } else {
                defer.reject(data.Message);
            }
        });
        return defer.promise;
    };
    this.restore = function(user){
        var defer = new $q.defer();
        $http.post("/server/user/restore", { 'id': user.uuid })
        .success(function(data, status, headers, config){
            if(data.Success){
                for(var i = 0; i < user.identities.length; i++){
                    user.identities[i].Enabled = true;
                }
                defer.resolve();
            } else {
                defer.reject(data.Message);
            }
        }).error(function(data, status, headers, config){
            defer.reject("Error connecting to MGM");
        });
        return defer.promise;
    };
    this.suspend = function(user){
        var defer = new $q.defer();
        $http.post("/server/user/suspend", { 'id': user.uuid })
        .success(function(data, status, headers, config){
            if(data.Success){
                for(var i = 0; i < user.identities.length; i++){
                    user.identities[i].Enabled = false;
                }
                defer.resolve();
            } else {
                defer.reject(data.Message);
            }
        }).error(function(data, status, headers, config){
            defer.reject("Error connecting to MGM");
        });
        return defer.promise;
    };
    this.setEmail = function(user, email){
        var defer = new $q.defer();       
        $http.post("/server/user/email",{ 'id': user.uuid, 'email': email })
        .success(function(data, status, headers, config){
            if(data.Success){
                defer.resolve();
                user.email = email;
            } else {
                defer.reject("Error changing email for " + self.name + ": " + data.Message);
            }
        }).error(function(data, status, headers, config){
            defer.reject("Error connecting to MGM");
        });
        return defer.promise;
    };
    this.setPassword = function(user, password){
        var defer = new $q.defer();
        if(password == ""){
            alertify.error('Error changing password for ' + self.Name() + ': password cannot be blank');
            return;
        }
        $http.post("/server/user/password", {'id': user.uuid, 'password': password })
        .success(function(data, status, headers, config){
            if(data.Success){
                defer.resolve();
            } else {
                defer.reject("Error changing password for " + user.name + ": " + data.Message);
            }
        });
        return defer.promise;
    };
    $rootScope.$on("mgmUpdate", this.updateUsers);
});

/*
function TaskHandler(){
    
    this.resetPasswordName = ko.observable('');
    this.resetPasswordToken = ko.observable('');
    this.resetPasswordEmail = ko.observable('');
    this.resetPasswordPass1 = ko.observable('');
    this.resetPasswordPass2 = ko.observable('');
    this.resetPasswordCode = ko.observable('');
    this.showPasswordResetForm = function(){
        $( "#forgotPasswordWindow" ).dialog({
            width: "600px",
            height: "auto",
            closeOnEscape: false,
            close: self.close,
            modal: true
        });
    }
    this.sendPasswordResetCode = function(){
        if(self.resetPasswordEmail() == ""){
            alertify.error('Email cannot be blank');
            return;
        }
        $.post("task/resetCode", { 
                    'email': self.resetPasswordEmail() }).done(function(msg){
            var result = $.parseJSON(msg);
            if(result["Success"]){
                alertify.success("Email submitted Sucessfully");
            } else {
                alertify.error("Error submitting email for password reset: " + result["Message"]);
            }
        });
    }
    this.resetPassword= function(){
        if(self.resetPasswordName() == ""){
            alertify.error('Name cannot be blank');
            return;
        }
        if(self.resetPasswordName().trim().split(" ").length != 2){
            alertify.error('First and Last name are required');
            return;
        }
        if(self.resetPasswordToken() == ""){
            alertify.error('Token cannot be blank');
            return;
        }
        if(self.resetPasswordPass1() == ""){
            alertify.error('Password cannot be blank');
            return;
        }
        if(self.resetPasswordPass1() != self.resetPasswordPass2()){
            alertify.error('Passwords must match');
            return;
        }
        $.post("task/resetPassword", { 
                    'name': self.resetPasswordName(),
                    'token': self.resetPasswordToken(),
                    'password': self.resetPasswordPass1() }).done(function(msg){
            var result = $.parseJSON(msg);
            if(result["Success"]){
                alertify.success("Password changed successfully");
            } else {
                alertify.error(result["Message"]);
            }
        });
    }
}
*/

mgmApp.config(function($routeProvider, $locationProvider){
    $routeProvider
        .when('/', {
            templateUrl : '/pages/splash.html'
        })
        .when('/account', {
            templateUrl : '/pages/account.html',
            controller  : 'AccountController'
        })
        .when('/regions', {
            templateUrl : '/pages/regions.html',
            controller  : 'RegionController'
        })
        .when('/grid', {
            templateUrl : '/pages/grid.html',
            controller  : 'GridController'
        })
        .when('/map', {
            templateUrl : '/pages/map.html',
            controller  : 'MapController'
        })
        .when('/users', {
            templateUrl : '/pages/users.html',
            controller  : 'UserController'
        })
        .when('/pending', {
            templateUrl : '/pages/pendingUsers.html',
            controller  :  'PendingUserController'
        })
        .otherwise({
            templateUrl : '/pages/account.html'
        });
    $locationProvider.html5Mode(true);
});

/********************************************************************************************************************************************/
/********************************************************************************************************************************************/
/********************************************************************************************************************************************/
/********************************************************************************************************************************************/
/********************************************************************************************************************************************/
/********************************************************************************************************************************************/
/********************************************************************************************************************************************/
/********************************************************************************************************************************************/

/*
var strings = {
    "saveOar": "Saving an oar file may take in excess of 30 minutes.<br>MGM will process this offline, and send you an email when it is ready for download.<br>You do not need to stay logged in during this process.<br>Please press Save below to begin.",
    "destroyRegion": "Are you sure? Deleting a region is irreversable without a separate backup or oar file",
    "startListed": "Are you sure? This starts all regions currently displayed.  Regions already running are not affected",
    "stopListed": "Are you sure? This starts all regions currently displayed.  Regions already stopped are not affected",
    "dumpLogs": "Are you sure? This will download all logs available from this region, and can be large if MGM is  configured to retain logs for an extended amount of time, or if the region has logged excessively",
    "nukeContent": "Are you sure? This will irreversably wipe out any content you have in your region.",
}
*/

function downloadUrl(url){
    var iframe = document.getElementById('hiddenDownloader');
    if (iframe === null) {
        iframe = document.createElement('iframe');
        iframe.id = 'hiddenDownloader';
        iframe.style.display = 'none';
        document.body.appendChild(iframe);
    }
    iframe.src = url;
}

function Task(id, timestamp, type, user, data){
    var self = this;
    this.ID = ko.observable(id);
    this.Timestamp = ko.observable(timestamp);
    this.Type = ko.observable(type);
    this.User = ko.observable(user);
    this.Data = ko.observable(data);
    
    this.isDone = ko.computed(function(){
       if(self.Data().Status == "Done"){
           return true;
       }
       return false; 
    });
    
    this.destroy = function(){
        $.post("task/delete/" + self.ID()).done(function(msg){
            var result = $.parseJSON(msg);
            if(result["Success"]){
                MGM.task.tasks.remove(self);
                delete MGM.task.tasksModel[self.ID()];
            } else {
                alertify.error(result["Message"]);
            }
        });
    }
}

function SaveOarTask(id, timestamp, type, user, data){
    this.base = Task;
    this.base(id, timestamp, type, user, data)
    var self = this;
    
    this.download = function(task){
        downloadUrl('/task/ready/' + self.ID());
    }
}

function ResetPasswordTask(id, timestamp, type, user, data){
    this.base = Task;
    this.base(id, timestamp, type, user, data)
    
    this.isDone = ko.computed(function(){
       return false; 
    });

}

function Console(region){
	var self = this;
    this.region = region;
	this.connected = false;
	this.consoleInterval = null;
	this.isUpdating = false;
    this.terminal = region.Name()+"Console";
	
	this.close = function(){
		clearInterval(self.consoleInterval);
		if(self.connected){
			$.post( "console/close/" + self.region.UUID());
		}
        self.connected = false;
		$('#' + self.terminal).replaceWith($('<div>').attr('id',self.terminal));
	}
	this.sendCommand = function(cmd, term){
		$.post("console/write/" + self.region.UUID(), {"command": cmd});
	};
	this.updateConsoleTask = function(){
		if(self.isUpdating)
			return;
		self.isUpdating = true;
		$.post("console/read/" + self.region.UUID()).done(function(data){
            var result = JSON.parse(data);
            if( result['Success'] ){
                self.term.echo(result['Lines'].join('\n'));
            }
			self.isUpdating = false;
		});
	};
	this.open = function(){
        if(self.connected){
            self._disconnect();
        }
		$.post("console/open/" + self.region.UUID()).done(function(data){
			var result = JSON.parse(data);
            if(! result['Success'] ){
                alertify.error(result['Message']);
                return;
            }
            
            if(!result["Prompt"]){
                alertify.error("Problem connecting to console...");
                self.connected = false;
                return;
            }

            $('#' + self.terminal).terminal(self.sendCommand,{
                prompt:result["Prompt"] + ">",
                greetings: null,
                onInit: function(term){
                    self.term = term;
                    self.term.resize(1000, 600);
                    $(window).resize(self.resizeConsole);
                }
            });
            self.connected = true;
            self.updateConsoleTask();
            self.consoleInterval =  setInterval(self.updateConsoleTask, 1000);
		});
	}
};

function Region(name, x, y, uuid, host, isRunning){
	var self = this;
	
	this.Name = ko.observable(name);
	this.X = ko.observable(x);
	this.Y = ko.observable(y);
	this.UUID = ko.observable(uuid);
	this.isRunning = ko.observable(isRunning);
    this.node = ko.observable(host);
    this.Host = ko.computed(function(){
        var host = null;
        if( self.node()){
            MGM.hostUpdateDummy();
            $.each(MGM.hostsModel, function(index, candidate){
                if(self.node() == candidate.Address()){
                    host = candidate;
                }
            });
        }
        
        if( host == null ){
            return {'SelectName': ko.observable('No Host')};
        }
        return host;
    });
    
    this.cpuPercent = ko.observable("");
    this.memPercent = ko.observable("");
    this.memKb = ko.observable("");
    this.uptime = ko.observable("");
    this.numUsers = ko.observable("");
    this.stage = ko.observable("DNE");
    
    this.Console = new Console(self);
    
    this.setStatus = function(status){
        if(status && status.status != undefined){
            var ss = status.status;
            self.stage(ss.stage);
            if(self.isRunning()){
                if('cpuPercent' in ss){ self.cpuPercent(ss['cpuPercent'].toFixed(2) + "%"); } else { self.cpuPercent("-"); }
                if('memPercent' in ss){ self.memPercent(ss['memPercent'].toFixed(2) + "%"); } else { self.memPercent("-"); }
                if('memKB' in ss){ self.memKb(ss['memKB'] + "KB"); } else { self.memKb("-"); }
            }
            
            if(ss['simStats'] != undefined){
				self.uptime(ss['simStats']['Uptime'].split(".").slice(0,-1).join(" days "));
                self.numUsers(ss['simStats']['RootAg']);
            } else {
                self.uptime("-");
                self.numUsers("-");
            }
        }
    }
    
    this.dumpLogs = function(){
		alertify.confirm(strings["dumpLogs"], function(confirmed){
            if(confirmed){
				downloadUrl("region/logs/" + self.UUID());
            }
        });
	}
    
    this.manageVisible = false;
    this.toggleManage = function(recurse){
        if(recurse == 'undefined'){
            $.each(MGM.regionsModel, function(index, reg){
                if(reg.manageVisible){  reg.toggleManage(); }
                if(reg.oarVisible){ reg.toggleOar();    } 
            });
        }
        if(self.manageVisible){
            self.manageVisible = false;
            $('#' + self.Name() + 'ManageSlider').slideUp(function(){
                self.Console.close();
            });
        }else{
            self.manageVisible = true;
            self.CandidateHost(self.Host());
            if(self.isRunning()){
                self.Console.open();
            }
            $('#' + self.Name() + 'ManageSlider').slideDown();
        }

    };
    this.oarVisible = false;
    this.toggleOar = function(recurse){
        if(recurse == 'undefined'){
            $.each(MGM.regionsModel, function(index, reg){
               if(reg.oarVisible()){ reg.toggleOar(false); } 
               if(reg.manageVisible()){ reg.toggleManage(); }
            });
        }
        if(self.oarVisible){
            self.oarVisible = false;
            $('#' + self.Name() + 'ContentSlider').slideUp();
        } else {
            self.oarVisible = true;
            $('#' + self.Name() + 'ContentSlider').slideDown();
            if(self.manageVisible) { self.toggleManage(); }
        }
    };
    this.Estate = ko.computed(function(){
        MGM.estateUpdateDummy();
        var currentEstate = null;
        $.each(MGM.estatesModel, function(index, estate){
            if(estate.Regions.indexOf(self.UUID()) > -1){
                currentEstate = estate; 
            }
        });
        return currentEstate;
    });
    
    this.getEstateForRegion = function(region){
        var disp = "Error...";
        
        return disp;
    }
    this.updateStats = function(){
        $.getJSON("region/stats/" + self.UUID(), function(data){
            if(data['Success']){
                self.setStatus(data['status']);
            }
        });
    }
    
    this.nukeContent = function(){
        alertify.confirm(strings["nukeContent"], function(confirmed){
            //This is similar to oar load, except the blank oar of Nuking is already on the server
            $.post("task/nukeContent/" + self.UUID()).done(function(msg){
                var result = $.parseJSON(msg);
                if(result["Success"]){
                    var newTask = new Task(result['ID'], "", "nuke_content", "", {"Status":"Initializing"});
                    MGM.task.tasks.push(newTask);
                    MGM.task.tasksModel[result['ID']] = newTask;
                    alertify.success("Nuke Content initiated for " + self.Name());
                }
            });
        });
    };
    this.oarFile = ko.observable();
    this.loadOar = function(){
        if(self.oarFile() == null){
            return;
        }
        
        //create job ticket for oar
        $.post("task/loadOar/" + self.UUID()).done(function(msg){
            var result = $.parseJSON(msg);
            if(result["Success"]){
                var newTask = new Task(result['ID'], "", "load_oar", "", {"Status":"Initializing"});
                MGM.task.tasks.push(newTask);
                MGM.task.tasksModel[result['ID']] = newTask;

                //with valid ticket, upload file
                var data = new FormData();
                data.append('file', $('#oarFile' + self.Name())[0].files[0]);
                
                try{
                    var xmlHttp = new XMLHttpRequest();
                    xmlHttp.open('POST', 'task/upload/' + result['ID'], true);
                    xmlHttp.onreadystatechange = function(){
                        if(xmlHttp.readyState == 4){
                            var result = $.parseJSON(xmlHttp.responseText);
                            if( result['Success'] ){
                                alertify.success("Oar load initiated for " + self.Name());
                            } else {
                                alertify.error("Error loading oar for " + self.Name() + ": " + result['Message'] );
                            }
                        }
                    }
                    xmlHttp.send(data);
                    location.hash = MGM.sectionId();
                } catch(e){
                    alertify.error("Error: could not upload file");
                }
            } else {
                alertify.error("Error loading oar for " + self.Name() + ": " + result["Message"]);
            }
        });
    }
        
    this.saveOar = function(){
        alertify.confirm(strings["saveOar"], function(confirmed){
            if(confirmed){
                $.post("task/saveOar/" + self.UUID()).done(function(msg){
                    var result = $.parseJSON(msg);
                    if(result["Success"]){
                        var newTask = new SaveOarTask(result['ID'], "", "save_oar", "", {"Status":"Initializing"});
                        MGM.task.tasks.push(newTask);
                        MGM.task.tasksModel[result['ID']] = newTask;
                        $( "#saveOarWindow" ).dialog("close");
                    } else {
                        alertify.error("Error requesting oar save for " + self.Name() + ": " + result["Message"]);
                    }
                    location.hash = MGM.sectionId();
                });
            }
        });
    }
    
    this.destroy = function(){
        alertify.confirm(strings["destroyRegion"], function(confirmed){
            if(confirmed){
                $.post("region/destroy/" + self.UUID()).done(function(msg){
                    var result = $.parseJSON(msg);
                    if(result["Success"]){
                        delete MGM.regionsModel[self.UUID()];
                        MGM.regionUpdateDummy(self.UUID());
                        alertify.success("Region "+ self.Name() + " deleted successfully");
                    } else {
                        alertify.error(result["Message"]);
                    }
                });
            }
        });
    }
    
    this.start = function(){
        $.post("region/start/" + self.UUID()).done(function(data){
            var result = $.parseJSON(data);
            if( ! result['Success'] ){
                alertify.error(result['Message'] );
            } else {
                alertify.success("Region " + self.Name() + " signalled to start");
            }
        });
    };
    this.stop = function(){
		$.post("region/stop/" + self.UUID()).done(function(data){
			var result = $.parseJSON(data);
            if( ! result['Success'] ){
                alertify.error(result['Message'] );
            } else {
                if(self.manageVisible()){ self.toggleManage(); }
                if(self.oarVisible()){ self.toggleOar();    }
                alertify.success("Region " + self.Name() + " signalled to stop");
            }
		});
	};
    
    this.CandidateHost = ko.observable(self.Host());
    this.setHost = function(){
        $.post("region/host/" + self.UUID(), { 
                    'host': self.CandidateHost() ? self.CandidateHost().Address() : 'none'}).done(function(msg){
            var result = $.parseJSON(msg);
			if(result["Success"]){
                self.node(self.CandidateHost() ? self.CandidateHost().Address(): null);
                alertify.success("Host for region " + self.Name() + " changed successfully");
			} else {
                self.CandidateHost(self.Host());
                alertify.error(result["Message"]);
            }
            location.hash = MGM.sectionId();
		});
    };
    
    this.CandidateEstate = ko.observable(self.Estate());
    this.setEstate = function(){
        if(self.CandidateEstate() == self.Estate()){
            alertify.error("No estate change detected");
            return;
        }
        $.post("region/estate/" + self.UUID(), { 
                    'estate': self.CandidateEstate().ID()}).done(function(msg){
            var result = $.parseJSON(msg);
			if(result["Success"]){
                self.Estate().Regions.remove(self.UUID());
                self.CandidateEstate().Regions.push(self.UUID());
                alertify.success("Estate for region " + self.Name() + " changed successfully");
			} else {
                alertify.error(result["Message"]);
            }
            location.hash = MGM.sectionId();
		});
    };
};

function Host(name, address, lastSeen, system, capacity){
    var self = this;
    this.Name = ko.observable(name);
    this.Address = ko.observable(address);
    this.LastSeen = ko.observable(lastSeen);
    this.Capacity = ko.observable(capacity);
    
    this.cpuPercent = ko.observable();
    this.memPercent = ko.observable();
    this.memMb = ko.observable();
    this.netSentkBps = ko.observable();
    this.netRcvkBps = ko.observable();
    
    this._system = ko.observable();
    this.Status = ko.computed({
      read: function(){
            if(self._system()){
                var stat = "Mem: " + self.memPercent() + "[" + self.memMb() + "]";
                stat += ", Cpu(per core): " + self.cpuPercent();
                stat += ", Network: " + (self.netSentkBps());
                stat += (self.netRcvkBps());
                return stat;
            }
            return "Stale/DNE, is this host running?";
      },
      write: function(system){
            if( system != undefined){
                self.cpuPercent(system["cpuPercent"]);
                self.memPercent(system["memPercent"] + "%");
                self.memMb((system["memKB"]/1024).toFixed(2) + " MB");
                self.netSentkBps((system["netSentPer"]/1024).toFixed(2) + "kBps");
                self.netRcvkBps((system["netRecvPer"]/1024).toFixed(2) + "kBps");
            } else {
                self.cpuPercent("-");
                self.memPercent("-");
                self.memMb("-");
                self.netSentkBps("-");
                self.netRcvkBps("-");
            }

      }
    });
    this.Status(system);
    this.Regions = ko.computed(function(){
        var regions = [];
        MGM.regionUpdateDummy();
        $.each(MGM.regionsModel, function(index, region){
           if(region.node() == self.Address()){
               regions.push(region);
           }
        });
        return regions;
    });
    this.SelectName = ko.computed(function(){
       return self.Name() + " [" + self.Address() + "][" + self.Regions().length + "/" + self.Capacity() + " procs]"; 
    });
    
    this.destroy = function(){
        alertify.confirm(strings["destroyHost"], function(confirmed){
            if(confirmed){
                $.post("host/remove", { 
                            'host':self.Address()}).done(function(msg){
                    var result = $.parseJSON(msg);
                    if(result["Success"]){
                        delete MGM.hostsModel[self.Address()];
                        MGM.hostUpdateDummy(Math.random());
                        alertify.success("Host: " + self.Name() + " removed Successfully");
                    } else {
                        alertify.error(result["Message"]);
                    }
                });
            }
        });
    };
}

function MGMViewModel(){
    var self = this;

    this.auth = new AuthenticationHandler();
    this.auth.loginCallback = function(){
        self.syncState();
        self.watchdog = window.setInterval(self.syncState,10000);
    }
    this.auth.logoutCallback = function(){
        location.hash = "Account";
        self.estatesModel = {};
        self.estateUpdateDummy(Date());
        self.regionsModel = {};
        self.regionUpdateDummy(Date());
        self.usersModel = {};
        self.userUpdateDummy(Date());
        self.pendingUsersModel = {};
        self.pendingUserUpdateDummy(Date());
        self.hostsModel = {};
        self.hostUpdateDummy(Date());
    }
    
    this.task = new TaskHandler();
    
    this.estatesModel = {};
    this.estateUpdateDummy = ko.observable();
    this.regionsModel = {};
    this.regionUpdateDummy = ko.observable();
    this.usersModel = {};
    this.userUpdateDummy = ko.observable();
    this.pendingUsersModel = {};
    this.pendingUserUpdateDummy = ko.observable();
    this.hostsModel = {};
    this.hostUpdateDummy = ko.observable();
	
    this.cleanup = function(){
        $.each(self.regionsModel, function(index, region){
            region.console.close();
        });
    }
    
    this.sections = ['Account','Regions','Grid','Map', 'Users','Pending Users'];
    this.sectionId = ko.observable();
    this.goToSection = function(folder){ location.hash = folder; self.sectionId(folder);};
    
    this.PendingUsers = ko.computed(function(){
        self.pendingUserUpdateDummy();
        var users = [];
        $.each(self.pendingUsersModel, function(index, u){
            users.push(u);
        });
        users.sort(function(left,right){ return left.Name().toLowerCase() < right.Name().toLowerCase() ? -1 : 1; });
        return users; 
    });
    
    this.userNameSearch = ko.observable('');
    this.userEmailSearch = ko.observable('');
    this.Users = ko.computed(function(){
        self.userUpdateDummy();
        var users = [];
        $.each(self.usersModel, function(index, u){
            if(u.Name().toLowerCase().indexOf(self.userNameSearch().toLowerCase()) != -1){
                if(u.Email().toLowerCase().indexOf(self.userEmailSearch().toLowerCase()) != -1){
                    users.push(u);
                }
            }
        });
        users.sort(function(left,right){ return left.Name().toLowerCase() < right.Name().toLowerCase() ? -1 : 1; });
        return users; 
    });
    
    this.regionSearch = ko.observable('');
    this.selectedRegionEstateFilter = ko.observable("All Regions");
    this.selectedRegionStatusFilter = ko.observable("All");
    this.selectedRegionHostFilter = ko.observable("All Hosts");
    this.regionsEstateFilters = ko.computed(function(){
        self.estateUpdateDummy();
        var filters = ["All Regions"];
        $.each(self.estatesModel, function(index, estate){
            filters.push(estate.Name());
        });
        return filters
    });
    this.regionsHostFilters = ko.computed(function(){
        self.hostUpdateDummy();
        var filters = ["All Hosts", "None Assigned"];
        $.each(self.hostsModel, function(index, host){
            filters.push(host.SelectName());
        });
        return filters
    });
    this.regionsStatusFilters = ["All", "Running", "Stopped"];
    this.Regions = ko.computed(function(){
        self.regionUpdateDummy();
        
        var regs = [];
        if(self.selectedRegionEstateFilter() == "All Regions"){
            $.each(self.regionsModel, function(index, u){ regs.push(u); });
        } else {
            $.each(self.regionsModel, function(index, u){ if(u.Estate().Name() == self.selectedRegionEstateFilter()){regs.push(u); }});
        }
        
        if( self.selectedRegionHostFilter() == "None Assigned" ){
            regs = ko.utils.arrayFilter(regs, function(region){ return region.Host().SelectName() == "No Host"; });
        } else if( self.selectedRegionHostFilter() != "All Hosts"){
            regs = ko.utils.arrayFilter(regs, function(region){ return region.Host().SelectName() == self.selectedRegionHostFilter(); });
        }
        
        if( self.selectedRegionStatusFilter() == "Running" ){
            regs = ko.utils.arrayFilter(regs, function(region){ return region.isRunning() });
        } else if( self.selectedRegionStatusFilter() == "Stopped" ){
            regs = ko.utils.arrayFilter(regs, function(region){ return !region.isRunning() });
        }
        
        if(self.regionSearch() != ""){
            var search = self.regionSearch().toLowerCase();
            regs = ko.utils.arrayFilter(regs, function(region){ return region.Name().toLowerCase().indexOf(search) >= 0});
        }
        
        regs.sort(function(left,right){ return left.Name().localeCompare(right.Name(), {sensitivity: "base"}); });
        
        return regs;
    });
    
    this.Estates = ko.computed(function(){
        self.estateUpdateDummy();
        var estates = [];
        $.each(self.estatesModel, function(index, est){
            estates.push(est);
        });
        return estates;
    });
    
    this.Hosts = ko.computed(function(){
        self.hostUpdateDummy();
        var hosts = [];
        $.each(self.hostsModel, function(index, host){
            hosts.push(host);
        });
        return hosts;
    });
        
    this.findUserByEmail = function(email){
        var duplicate = null;
        $.each(self.usersModel, function (index, datum){
            if(duplicate != null) return;
            if(datum.Email()== email) duplicate = datum;
        });
        return duplicate;
    }
    
    /*****************************************/

    this.createNewHost = function(){
        alertify.prompt(strings["addHost"], function(success, address){
            if(success){
                Pattern = /^\d{1,3}.\d{1,3}.\d{1,3}.\d{1,3}$/
                if( ! address.match(Pattern)){
                    alertify.error('Add Host Error: Invalid ip entered');
                    return;
                }
                $.post("host/add", { 
                            'host':address}).done(function(msg){
                    var result = $.parseJSON(msg);
                    if(result["Success"]){
                        var newHost = new Host("",address, "", "");
                        self.hostsModel[address] = newHost;
                        self.hostUpdateDummy(address);
                    } else {
                        alertify.error("Error adding new host: " + result["Message"]);
                    }
                    location.hash = MGM.sectionId();
                });
            }
        }, "");
    }
    
    this.EstateFormEstateName = ko.observable('');
    this.EstateFormEstateOwner = ko.observable('');
    this.createNewEstate = function(){
        alertify.prompt("", function(success){
            if(success){
                if(self.EstateFormEstateName() == ""){
                    alertify.error('Add Estate Error: Estate Name cannot be blank');
                    return;
                }
                if(self.EstateFormEstateOwner() == null){
                    alertify.error('Add Estate Error: Estate Owner cannot be blank');
                    return;
                }
                $.post("estate/create", { 'name':self.EstateFormEstateName(), 'owner': self.EstateFormEstateOwner().UUID() }).done(function(msg){
                    var result = $.parseJSON(msg);
                    if(result["Success"]){
                        var newEstate = new Estate(self.EstateFormEstateName(), result['id'], self.EstateFormEstateOwner().UUID(), [], []);
                        self.estatesModel[result['id']] = newEstate;
                        MGM.estateUpdateDummy(Math.random());
                    } else {
                        alertify.error("Add Estate Error: " + result["Message"]);
                    }
                    location.hash = MGM.sectionId();
                });
            }
        }, "");
        $('.alertify-text-wrapper').hide();
        $('.alertify-message').html('<div id="EstateForm"><p class="alertify-message">Please select the Owner and Name for the new estate.</p><div class="alertify-text-wrapper"><label>Estate Owner:</label><select class="alertify-text" data-bind="options: Users, optionsText: \'Name\', value: EstateFormEstateOwner"></select><br><label>Estate Name:</label><input type="text" class="alertify-text" data-bind="value: EstateFormEstateName" /></div></div>');
        $('.alertify-text').css("width","auto");
        ko.applyBindings(MGM, document.getElementById("EstateForm"));
    };
        
    this.RegionFormRegionName = ko.observable('');
    this.RegionFormRegionLocX = ko.observable('');
    this.RegionFormRegionLocY = ko.observable('');
    this.RegionFormEstate = ko.observable('');
    this.createNewRegion = function(){
        alertify.prompt("", function(success){
            if(success){
                if(self.RegionFormRegionName() == ""){
                    alertify.error('Add Region Error: Region Name cannot be blank');
                    return;
                }
                var intRegex = /^\d+$/;
                if(! self.RegionFormRegionLocX()){
                    alertify.error('Add Region Error: Invalid input X coordinate');
                    return;
                }
                if(! intRegex.test(self.RegionFormRegionLocY())){
                    alertify.error('Add Region Error: Invalid input Y coordinate');
                    return;
                }
                if(self.RegionFormEstate() == null){
                    alertify.error('Add Region Error: Estate cannot be blank');
                    return;
                }
                $.post("region/create", { 
                            'name':self.RegionFormRegionName(), 
                            'x': self.RegionFormRegionLocX(), 
                            'y': self.RegionFormRegionLocY(),
                            'estate': self.RegionFormEstate().ID()}).done(function(msg){
                    var result = $.parseJSON(msg);
                    if(result["Success"]){
                        self.estatesModel[self.RegionFormEstate().ID()].Regions.push(result['id']);
                        var region = {
                            name: self.RegionFormRegionName(),
                            x: self.RegionFormRegionLocX(),
                            y: self.RegionFormRegionLocY(),
                            uuid: result['id'],
                            node: null,
                            isRunning: false,
                            stat: null};
                        self.addOrUpdateRegions([region]);
                        self.regionUpdateDummy(result['id']);
                    } else {
                        alertify.error("Add Region Error: " + result["Message"]);
                    }
                    location.hash = MGM.sectionId();
                });
            }
        });
        $('.alertify-text-wrapper').hide();
        $('.alertify-message').html('<div id="RegionForm"><p class="alertify-message">Please select a name and location for your region.  The region does not have a host by default.</p><div class="alertify-text-wrapper"><label>Region Name:</label><input type="text" class="alertify-text" data-bind="value: RegionFormRegionName" /><label>X:</label><input type="text" class="alertify-text" data-bind="value: RegionFormRegionLocX" /><label>Y:</label><input type="text" class="alertify-text" data-bind="value: RegionFormRegionLocY" /><label>Estate:</label><select class="alertify-text" data-bind="options: Estates, optionsText: \'Name\', value: RegionFormEstate"></select></div></div>');
        ko.applyBindings(MGM, document.getElementById("RegionForm"));
    }
    
    /******************************************************************/
    
    this.initMap = function(){
        self.map = new MosesMap("/maps/", $("#mosesMap"));
        self.map.updateTiles();
        self.map.updateNames();
        window.addEventListener('resize', self.map.resize, false);
        
        self.map.resize();
        self.map.centerTile(1000,1000);
        self.map.redraw();
    }
    
	/******************************************************************/
	
	this.unload = function(){
		self.console.close();
	};
    
    this.startListedRegions = function(){
        alertify.confirm(strings["startListed"], function(confirmed){
            $.each(MGM.Regions(), function(index, region){ if(!region.isRunning()){ region.start() }});
        });
    }
    
    this.stopListedRegions = function(){
        alertify.confirm(strings["stopListed"], function(confirmed){
            $.each(MGM.Regions(), function(index, region){ if(region.isRunning()){ region.stop() }});
        });
    }
    
    this.addOrUpdateRegions = function(data){
        var newRegions = false;
        $.each(data, function(index, datum){
            if( datum['uuid'] in self.regionsModel){
                self.regionsModel[datum['uuid']].Name(datum['name']);
                self.regionsModel[datum['uuid']].X(datum['x']);
                self.regionsModel[datum['uuid']].Y(datum['y']);
                self.regionsModel[datum['uuid']].node(datum['node']);
                self.regionsModel[datum['uuid']].isRunning(datum['isRunning']);
            } else {
                var newRegion = new Region(datum['name'], datum['x'], datum['y'], datum['uuid'], datum['node'], datum['isRunning']);
                self.regionsModel[datum['uuid']] = newRegion;
                newRegions = true;
            }
        });
        if(newRegions){ self.regionUpdateDummy(Date()); }
    }

    this.addOrUpdateHosts = function(data){
        var appender = [];
        var newHosts = false;
        $.each(data, function(index,datum){
            if( datum['address'] in self.hostsModel){
                self.hostsModel[datum['address']].Name(datum['name']);
                self.hostsModel[datum['address']].Address(datum['address']);
                self.hostsModel[datum['address']].LastSeen(datum['lastSeen']);
                self.hostsModel[datum['address']].Status(datum['system']);
                self.hostsModel[datum['address']].Capacity(datum['capacity']);
            } else {
                var newHost = new Host(datum['name'], datum['address'], datum['lastSeen'], datum['system'], datum['capacity']);
                self.hostsModel[datum['address']] = newHost;
                newHosts = true;
            }
        });
        if(newHosts){   self.hostUpdateDummy(Date());   }
    }
        
    this.addOrUpdateEstates = function(data){
        var appender = [];
        var newEstates = false;
        $.each(data, function(index,datum){
            if(datum['id'] in self.estatesModel){
                self.estatesModel[datum['id']].Name(datum['name']);
                self.estatesModel[datum['id']].Owner(datum['owner']);
                self.estatesModel[datum['id']].Managers(datum['managers']);
                self.estatesModel[datum['id']].Regions(datum['regions']);
            } else {
                var newEstate = new Estate(datum['name'], datum['id'], datum['owner'], datum['managers'], datum['regions']);
                self.estatesModel[datum['id']] = newEstate;
                newEstates = true;
            }
        });
        if(newEstates){ self.estateUpdateDummy(Date()); }
    }
    
    this.addOrUpdatePendingUsers = function(data){
        var appender = [];
        var newUsers = false;
        $.each(data, function(index, datum){
            if( ! (datum['email'] in self.pendingUsersModel)){
                var newUser = new PendingUser(datum['name'], datum['email'], datum['gender'], datum['registered'], datum['summary']);
                self.pendingUsersModel[datum['email']] = newUser;
                newUsers = true;
            }
        });
        if(newUsers){ self.pendingUserUpdateDummy(Date()); }
    }

    this.addOrUpdateUsers = function(data){
        var appender = [];
        var newUsers = false;
        $.each(data, function(index, datum){
            if(datum['uuid'] in self.usersModel){
                self.usersModel[datum['uuid']].Email(datum['email']);
                self.usersModel[datum['uuid']].Identities(datum['identities']);
            } else {
                var newUser = new User(datum["name"], datum['uuid'], datum["email"], datum["userLevel"], datum["identities"]);
                self.usersModel[datum['uuid']] = newUser;
                newUsers = true;
            }
        });
        if(newUsers){ self.userUpdateDummy(Date()); }
    }
	    
    this.syncState = function(){
        var d = new Date().getTime();
        if(self.auth.loggedIn()){
            if(['#Account','#Grid','#Users','#Pending Users'].indexOf(location.hash) >=0){
                $.getJSON("user", function(data){
                    if(data['Success']){
                        self.addOrUpdateUsers(data['Users']);
                        self.addOrUpdatePendingUsers(data['Pending']);
                    }
                    location.hash = MGM.sectionId();
                });
            }
            if(['#Grid','#Regions'].indexOf(location.hash) >=0){
                $.getJSON("region", function(data){
                    if(data['Success']){
                        self.addOrUpdateRegions(data['Regions']);
                        $.each(self.Regions(), function(index, region){
                            //if(region.isRunning()){
                                region.updateStats(); 
                            //}
                        });
                    }
                    location.hash = MGM.sectionId();
                });
                $.getJSON("estate", function(data){
                    if(data['Success']){
                        self.addOrUpdateEstates(data['Estates']);
                    }
                    location.hash = MGM.sectionId();
                });
                $.getJSON("host", function(data){
                    if(data['Success']){
                        self.addOrUpdateHosts(data['Hosts']);
                    }
                    location.hash = MGM.sectionId();
                });
            }
            $.getJSON("task", function(data){
                if(data['Success']){
                    self.task.addOrUpdateTasks(data['Tasks']);
                }
                location.hash = MGM.sectionId();
            });
        }
    };
};
