angular.module('mgmApp')
.controller('UserController', function($scope, userService){
    $scope.users = userService.getUsers();
    $scope.$on("userService", function(){
        $scope.users = userService.getUsers();
    });
    
    userService.updateUsers();
});
