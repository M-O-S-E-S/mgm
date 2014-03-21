angular.module('mgmApp')
.controller('TaskController', function($scope, taskService){
    $scope.tasks = taskService.getTasks();
    $scope.$on("taskService", function(){
        $scope.tasks = taskService.getTasks();
    });
    $scope.delete = function(id){
        console.log("delete job " + id);
        taskService.remove(id);
    };
    $scope.download = function(id){
        alertify.error("file download not implemented yet");
    };
});
