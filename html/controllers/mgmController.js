angular.module('mgmApp')
.controller('mgmController', function($rootScope,$scope,$http,$state,$interval,$modal, taskService){
    
    $scope.password = {
        modal: null,
        show: function(){
            this.modal = $modal.open({
                templateUrl: '/templates/forgotPasswordModal.html',
                keyboard: false,
                scope: $scope
            });
        },
        getReset: function(email){
            if(email == undefined || email.trim() == ""){
                alertify.error('Email cannot be blank');
                return;
            }
            taskService.passwordResetToken(email.trim()).then(
                function(){ alertify.success("Password reset token requested for " + email); },
                function(msg){ alertify.error(msg); }
            );
        },
        reset: function(username, token, password, confirm){
            if(username == undefined || username.trim() == ""){
                alertify.error('Name cannot be blank');
                return;
            }
            if(username.trim().split(" ").length != 2){
                alertify.error('First and Last name are required');
                return;
            }
            if(token == undefined || token.trim() == ""){
                alertify.error('Token cannot be blank');
                return;
            }
            if(password == undefined || password.trim() == ""){
                alertify.error('Password cannot be blank');
                return;
            }
            if(password != confirm){
                alertify.error('Passwords must match');
                return;
            }
            
            taskService.passwordReset(username, token, password).then(
                function(){ alertify.success("Password successfully reset for " + username); },
                function(msg){ alertify.error(msg); }
            );
        }
    };
    
    $scope.auth = {
        loggedIn: false,
        activeUser: {},
        userName: "",
        password: "",
        login: function(){
            $http.post("/api/auth/login",{ 'username':this.userName, 'password': this.password }).success(function(data, status, headers, config){
                if(data.Success){
                    console.log("login successfull");
                    $scope.auth.activeUser = { name:data.username, uuid:data.uuid, email:data.email, accessLevel: data.accessLevel, identities: [{Enabled: true}]};
                    $scope.auth.loggedIn = true;
                    $scope.auth.userName = "";
                    $scope.auth.password = "";
                    $scope.updater = $interval(function(){ $rootScope.$broadcast('mgmUpdate','trigger'); }, 10*1000);
                    $rootScope.$broadcast('mgmUpdate','trigger');
                    $state.go('mgm.account');
                } else {
                    console.log(data.Message);
                    alertify.error(data.Message);
                };
            }).error(function(data, status, headers, config){
                alertify.error("Error connecting to MGM");
            });
          
        },
        resume: function(){
            $http.get("/api/auth").success(function(data, status, headers, config){
                if(data.Success){
                    console.log("session resume successfull");
                    $scope.auth.activeUser = { name:data.username, uuid:data.uuid, email:data.email, accessLevel: data.accessLevel, identities: [{Enabled: true}]};
                    $scope.auth.loggedIn = true;
                    $scope.auth.userName = "";
                    $scope.auth.password = "";
                    $scope.updater = $interval(function(){ $rootScope.$broadcast('mgmUpdate','trigger'); }, 10*1000);
                    $rootScope.$broadcast('mgmUpdate','trigger');
                    //do not redirect, they may be reloading a page, or following a link
                    //$state.go('mgm.account');
                } else {
                    console.log("session resume failed");
                    $state.go('default');
                };
            });
        },
        logout: function(){
            $http.get("/api/auth/logout");
            this.loggedIn = false;
            this.userName = "";
            this.password = "";
            $state.go('default');
            $interval.cancel($scope.updater);
        }
    };
    $scope.auth.resume();
});
