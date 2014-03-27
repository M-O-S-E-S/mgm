angular.module('mgmApp')
.controller('mgmController', function($rootScope,$scope,$http,$location, $interval){
    
    $scope.location = {
        sections: [
            { name: 'Account', link: '/account' },
            { name: 'Regions', link: '/regions' },
            { name: 'Grid', link: '/grid'},
            { name: 'Map', link: '/map'},
            { name: 'Users', link: '/users'},
            { name: 'Pending Users', link: '/pending'} ],
        isActive: function(path){ return $location.path() == path; }
    };
    
    $scope.auth = {
        loggedIn: false,
        activeUser: {},
        userName: "",
        password: "",
        login: function(){
            $http.post("/server/auth/login",{ 'username':this.userName, 'password': this.password }).success(function(data, status, headers, config){
                if(data.Success){
                    console.log("login successfull");
                    $scope.auth.activeUser = { name:data.username, uuid:data.uuid, email:data.email, accessLevel: data.accessLevel, identities: [{Enabled: true}]};
                    $scope.auth.loggedIn = true;
                    $scope.auth.userName = "";
                    $scope.auth.password = "";
                    $scope.updater = $interval(function(){ $rootScope.$broadcast('mgmUpdate','trigger'); }, 10*1000);
                    $rootScope.$broadcast('mgmUpdate','trigger');
                    $location.path('/account');
                } else {
                    console.log(data.Message);
                    alertify.error(data.Message);
                };
            }).error(function(data, status, headers, config){
                alertify.error("Error connecting to MGM");
            });
          
        },
        resume: function(){
            $http.get("/server/auth").success(function(data, status, headers, config){
                if(data.Success){
                    console.log("session resume successfull");
                    $scope.auth.activeUser = { name:data.username, uuid:data.uuid, email:data.email, accessLevel: data.accessLevel, identities: [{Enabled: true}]};
                    $scope.auth.loggedIn = true;
                    $scope.auth.userName = "";
                    $scope.auth.password = "";
                    $scope.updater = $interval(function(){ $rootScope.$broadcast('mgmUpdate','trigger'); }, 10*1000);
                    $rootScope.$broadcast('mgmUpdate','trigger'); 
                } else {
                    console.log("session resume failed");
                    $location.path('/');
                };
            });
        },
        logout: function(){
            $http.get("/server/auth/logout");
            this.loggedIn = false;
            this.userName = "";
            this.password = "";
            $location.path('/');
            $interval.cancel($scope.updater);
        }
    };
    $scope.auth.resume();
});
