angular.module('mgmApp')
.controller('PendingUserController', function($scope, userService){
    $scope.pending = userService.getPending();
    $scope.$on("userService", function(){
        $scope.pending = userService.getPending();
    });
    
    userService.updateUsers();
});
