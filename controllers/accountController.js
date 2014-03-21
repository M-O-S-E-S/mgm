angular.module('mgmApp')
.controller('AccountController', function($scope, $http, $modal, taskService){
    $scope.account = {
        password: "",
        passwordConfirm: "",
        resetPassword: function(){
            if(this.password == ""){
                alertify.error('Password cannot be blank');
                return;
            }
            if(this.password != this.passwordConfirm){
                alertify.error('Passwords must match');
                return;
            }
            $http.post("/server/auth/changePassword",{ 'password':this.password }).success(function(data, status, headers, config){
                if(data.Success){
                    alertify.success("Password Changed Successfully");
                    $scope.account.password="";
                    $scope.account.passwordConfirm="";
                } else {
                    alertify.error(data.Message);
                };
            });
        }
    };
    $scope.iar = {
        modal: undefined,
        file: undefined,
        password: "",
        showLoad: function(){
            this.password = "";
            this.file = undefined;
            this.modal = $modal.open({
                templateUrl: '/templates/loadIarModal.html',
                keyboard: false,
                scope: $scope
            });
        },
        showSave: function(){
            this.password = "";
            this.file = undefined;
            this.modal = $modal.open({
                templateUrl: '/templates/saveIarModal.html',
                keyboard: false,
                scope: $scope
            });
        },
        cancel: function(){
            if(this.modal != undefined){
                this.modal.close();
            }
        },
        load: function(){
            if(this.password == ""){
                alertify.error('Password cannot be blank');
                return;
            }
            if(this.file == undefined){
                alertify.error('No file selected');
                return;
            }
                    
            //create job ticket
            $http.post("/server/task/loadIar",{ 'password':this.password }).success(function(data, status, headers, config){
                if(data.Success){
                    taskService.addTask({ id: data.ID, timestamp: "", type: "load_iar", data: {"Status":"Initializing"}});
                    
                    //upload file
                    var fd = new FormData();
                    console.log($scope.iar.file[0]);
                    fd.append("file",$scope.iar.file[0]);
                    $http.post("/server/task/upload/" + data.ID, fd, {
                        transformRequest: angular.identity,
                        headers: {'Content-Type': undefined}})
                        .success(function(data, status, headers, config){
                            if(data.Success){
                                console.log("file uploaded");
                                this.modal.close();
                            } else {
                                alertify.error(data.Message);
                            }
                        });
                } else {
                    alertify.error(data.Message);
                };
            });
        },
        save: function(){
            if(this.password == ""){
                alertify.error('Password cannot be blank');
                return;
            }
            
            //create job
            $http.post("/server/task/saveIar",{ 'password':this.password }).success(function(data, status, headers, config){
                if( data.Success ){
                    alertify.success("Save Iar task scheduled");
                    this.modal.close();
                } else {
                    alertify.error(data.Message);
                }
                this.password = "";
            });
        }
    }
});
