
var mgmApp = angular.module('mgmApp',['ngRoute','ui.bootstrap']);

mgmApp.directive('fileDownload', function ($compile) {
    var fd = {
        restrict: 'A',
        link: function (scope, iElement, iAttrs) {
            scope.$on("downloadFile", function (e, url) {
                var iFrame = iElement.find("iframe");
                if (!(iFrame && iFrame.length > 0)) {
                    iFrame = $("<iframe style='position:fixed;display:none;top:-1px;left:-1px;'/>");
                    iElement.append(iFrame);
                }
                iFrame.attr("src", url);
            });
        }
    };

    return fd;
});

mgmApp.service('consoleService', function($http, $q, $interval, $timeout){
    var uuid = "";
    var interval = null;
    var self = this;
    
    self.close = function(){
        var defer = new $q.defer();
        if(uuid == ""){
            console.log("console not connected, exiting before network call");
            defer.resolve();
        } else {
            console.log("closing console");
            $http.post("/server/console/close/" + uuid)
            .success(function(data, status, headers, config){
                defer.resolve();
            });
            $('#' + uuid + "-Term").replaceWith($('<div>').attr('id',uuid+"-Term"));
            uuid = "";
        }
        return defer.promise;
    }
    
    self.write = function(cmd, term){
        console.log("console writing: " + cmd);
        var defer = new $q.defer();
        if(uuid == ""){
            defer.reject("Console cannot write, console is not connected");
        } else {
            $http.post("/server/console/write/" + uuid, {"command": cmd})
            .success(function(data, status, headers, config){
                defer.resolve();
            });
        }
        //return defer.promise;
    }
    
    self.read = function(){
        var defer = new $q.defer();
        if(uuid == ""){
            defer.reject("Console cannot read, console is not connected");
        } else {
            $http.post("/server/console/read/" + uuid)
            .success(function(data, status, headers, config){
                if(data.Success){
                    self.term.echo(data.Lines.join('\n'));
                    $timeout(self.read, 1000);
                }
            });
        }
    }
    
    self.open = function(r){
        console.log("Opening console for region " + r.name);
        if(uuid != ""){
            console.log("Console already open, closing first");
            this.close().then(
                function(){ this.open(r); }
            );
        }
        var defer = new $q.defer();
        $http.post("/server/console/open/" + r.uuid)
        .success(function(data, status, headers, config){
            if(data.Success){
                if(data.Prompt){
                    uuid = r.uuid;
                    $('#' + uuid + "-Term").terminal(self.write,{
                        prompt:data.Prompt.trim() + ">",
                        greetings: null,
                        onInit: function(term){
                            self.term = term;
                            self.term.resize(1000, 600);
                            $timeout(self.read, 1000);
                        }
                    });
                    defer.resolve(data.Prompt);
                } else {
                    defer.reject("Could not connect to console");
                }
            } else {
                defer.reject(data.Message);
            }
        });
        return defer.promise;
    }
    
});

mgmApp.service('taskService', function($rootScope, $http, $q){
    var tasks = [];
    this.getTasks = function(){ return tasks; };
    this.updateTasks = function(){
        $http.get("/server/task").success(function(data, status, headers, config){
            if(data.Success){
                tasks = data.Tasks;
                $rootScope.$broadcast("taskService", "update");
            }
        });
    };
    this.remove = function(task){
        var defer = new $q.defer();
        $http.post("/server/task/delete/" + task.id)
        .success(function(data, status, headers, config){
            if(data.Success){
                var index = tasks.indexOf(task);
                tasks.splice(index,1);
                defer.resolve();
                $rootScope.$broadcast("taskService", "update");
            } else {
                defer.reject(data.Message);
            }
        });
        return defer.promise;
    };
    this.loadIar = function(password, form){
        var defer = new $q.defer();
        //create job ticket
        $http.post("/server/task/loadIar",{ 'password':password }).success(function(data, status, headers, config){
            if(data.Success){
                var newTask = { id: data.ID, timestamp: "", type: "load_iar", data: {"Status":"Initializing"}};
                tasks.push(newTask);
                $rootScope.$broadcast("taskService", "update");
                //upload file
                $http.post("/server/task/upload/" + data.ID, form, {
                    transformRequest: angular.identity,
                    headers: {'Content-Type': undefined}
                })
                .success(function(data, status, headers, config){
                    if(data.Success){
                        defer.resolve();
                    } else {
                        defer.reject(data.Message);
                        newTask.data.Status = data.Message;
                    }
                });
            } else {
                defer.reject(data.Message);
            };
        });
        return defer.promise;
    };
    this.saveIar = function(password){
        var defer = new $q.defer();
        //create job
        $http.post("/server/task/saveIar",{ 'password':password }).success(function(data, status, headers, config){
            if( data.Success ){
                var newTask = { id: data.ID, timestamp: "", type: "save_iar", data: {"Status":"Initializing"}};
                tasks.push(newTask);
                defer.resolve();
            } else {
                defer.reject(data.Message);
            }
        });
        return defer.promise;
    };
    this.nukeRegion = function(region){
        var defer = new $q.defer();
        $http.post("/server/task/nukeContent/" + region.uuid)
        .success(function(data, status, headers, config){
            if(data.Success){
                var newTask = { id: data.ID, timestamp: "", type: "nuke_content", data: {"Status":"Initializing"}};
                tasks.push(newTask);
                defer.resolve();
            } else {
                defer.reject(data.Message);
            }
        });
        return defer.promise;
    };
    this.saveOar = function(region){
        var defer = new $q.defer();
        $http.post("/server/task/saveOar/" + region.uuid)
        .success(function(data, status, headers, config){
            if(data.Success){
                var newTask = { id: data.ID, timestamp: "", type: "save_oar", data: {"Status":"Initializing"}};
                tasks.push(newTask);
                defer.resolve();
            } else {
                defer.reject(data.Message);
            }
        });
        return defer.promise;
    };
    this.loadOar = function(region, form, merge, x, y, z){
        var defer = new $q.defer();
        $http.post("/server/task/loadOar/" + region.uuid, {"merge":merge,"x":x,"y":y,"z":z})
        .success(function(data, status, headers, config){
            if(data.Success){
                var newTask = { id: data.ID, timestamp: "", type: "load_oar", data: {"Status":"Initializing"}};
                tasks.push(newTask);
                $rootScope.$broadcast("taskService", "update");
                //upload file
                $http.post("/server/task/upload/" + data.ID, form, {
                    transformRequest: angular.identity,
                    headers: {'Content-Type': undefined}
                })
                .success(function(data, status, headers, config){
                    if(data.Success){
                        defer.resolve();
                    } else {
                        defer.reject(data.Message);
                        newTask.data.Status = data.Message;
                    }
                });
            } else {
                defer.reject(data.Message);
            };
        });
        
        return defer.promise;
    };
    this.passwordResetToken = function(email){
        var defer = new $q.defer();
        $http.post("/server/task/resetCode", {"email": email})
        .success(function(data, status, headers, config){
            if(data.Success){
                defer.resolve();
            } else {
                defer.reject(data.Message);
            }
        });
        return defer.promise;
    };
    this.passwordReset = function(username, token, password){
        var defer = new $q.defer();
        $http.post("/server/task/resetPassword", {"name": username, "token": token, "password": password})
        .success(function(data, status, headers, config){
            if(data.Success){
                defer.resolve();
            } else {
                defer.reject(data.Message);
            }
        });
        return defer.promise;
    };
    this.updateTasks();
    $rootScope.$on("mgmUpdate", this.updateTasks);
});

mgmApp.service('regionService', function($rootScope, $http, $q){
    var regions = [];
    this.getRegions = function(){
        return regions;
    };
    this.add = function(name,x, y, size, estate) {
        var defer = new $q.defer();
        $http.post("/server/region/create", {"name": name, "x":x, "y":y, "size":size,"estate":estate.id})
        .success(function(data, status, headers, config){
            if(data.Success){
                regions.push({"uuid":data.id,"name":name,"x":x,"y":y,"estateName":estate.name,"node":"","isRunning":false,"stat":[]});
                $rootScope.$broadcast("regionService");
                defer.resolve();
            } else {
                defer.reject(data.Message);
            }
        });
        return defer.promise;
    };
    this.updateRegions = function(){
        $http.get("/server/region").success(function(data, status, headers, config){
            if(data.Success){
                regions = data.Regions;
                $rootScope.$broadcast("regionService");
            }
        });
    };
    this.remove = function(region){
        var defer = new $q.defer();
        $http.post("/server/region/destroy/" + region.uuid)
        .success(function(data, status, headers, config){
            if(data.Success){
                var index = regions.indexOf(region);
                regions.splice(index,1);
                defer.resolve();
                $rootScope.$broadcast("regionService");
            } else {
                defer.reject(data.Message);
            }
        });
        return defer.promise;
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
                region.node = host ? host.address : host;
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
        $http.post("/server/region/stop/" + region.uuid)
        .success(function(data, status, headers, config){
            if(data.Success){
                defer.resolve();
            } else {
                defer.reject(data.Message);
            }
        });
        return defer.promise;
    };
    this.updateRegions();
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
    this.updateEstates();
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
    this.updateHosts();
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
    this.setAccessLevel = function(user, level){
        var defer = new $q.defer();
        $http.post("/server/user/accessLevel", {"uuid": user.uuid, "accessLevel": level})
        .success(function(data, status, headers, config){
            if(data.Success){
                user.userLevel = level;
                defer.resolve();
            } else {
                defer.reject(data.Message);
            }
        });
        return defer.promise;
    };
    this.register = function(username, email, gender, password, summary){
        var defer = new $q.defer();
        $http.post("/server/register/submit", {"name": username, "email": email, "gender": gender, 'password': password, 'summary': summary})
        .success(function(data, status, headers, config){
            if(data.Success){
                defer.resolve();
            } else {
                defer.reject(data.Message);
            }
        });
        return defer.promise;
    };
    this.updateUsers();
    $rootScope.$on("mgmUpdate", this.updateUsers);
});

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
        .when('/register', {
            templateUrl : '/pages/register.html',
            controller  : 'RegisterController'
        })
        //.otherwise({
        //    templateUrl : '/pages/account.html'
        //});
    $locationProvider.html5Mode(true);
});
