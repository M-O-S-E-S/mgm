angular.module('mgmApp')
.controller('UserController', function($scope, $modal, userService){
    $scope.users = userService.getUsers();
    $scope.$on("userService", function(){
        $scope.users = userService.getUsers();
    });
    
    $scope.search = {
        name:"",
        email:""
    }
    
    $scope.user = {
        current: undefined,
        modal: undefined,
        manage: function(selected){
            this.current = selected;
            this.modal = $modal.open({
                templateUrl: '/templates/manageUserModal.html',
                keyboard: false,
                scope: $scope
            });
        },
        isSuspended: function(u){
            var enabled = false;
            for(var i = 0; i < u.identities.length; i++){
                if(u.identities[i].Enabled){
                    enabled = true;
                }
            };
            return !enabled;
        },
        suspend: function(){
            userService.suspend(this.current).then(
                function(){ alertify.success("User " + $scope.user.current.name + " suspended") },
                function(msg){ alertify.error(msg); }
            );
        },
        restore: function(){
            userService.restore(this.current).then(
                function(){ alertify.success("User " + $scope.user.current.name + " restored") },
                function(msg){ alertify.error(msg); }
            );
        }
    }

    
    
    userService.updateUsers();
});
