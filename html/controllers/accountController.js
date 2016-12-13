angular.module('mgmApp')
.controller('AccountController', function($scope, $modal, $http, taskService){
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
            $http.post("/api/auth/changePassword",{ 'password':this.password }).success(function(data, status, headers, config){
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
        load: function(){
            if(this.password == ""){
                alertify.error('Password cannot be blank');
                return;
            }
            if(this.file == undefined){
                alertify.error('No file selected');
                return;
            }
            
            //generate form
            var fd = new FormData();
            fd.append("file",$scope.iar.file[0]);
            taskService.loadIar(this.password, fd).then(
                function(){ 
                    alertify.success("Iar file loading"); 
                    $scope.iar.modal.close();
                },
                function(msg){ alertify.error(msg);  }
            );
        },
        save: function(){
            if(this.password == ""){
                alertify.error('Password cannot be blank');
                return;
            }
            taskService.saveIar(this.password).then(
                function(){ 
                    alertify.success("Save Iar task scheduled"); 
                    $scope.iar.modal.close();
                },
                function(msg){ alertify.error(msg);  }
            );
        }
    }
});
