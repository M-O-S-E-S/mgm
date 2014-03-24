angular.module('mgmApp')
.controller('UserController', function($scope, $modal, userService){
    $scope.users = userService.getUsers();
    $scope.$on("userService", function(){
        $scope.users = userService.getUsers();
    });
    
    
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
        isSuspended: function(user){
            var enabled = false;
            for(var i = 0; i < user.identities.length, i++){
                if(user.identities[i].enabled){
                    enabled = true;
                }
            });
            return enabled;
        },
        suspend: function(){
            
        },
        restore: function(){
            
        }
    }
    
    
    
    
    userService.updateUsers();
});
