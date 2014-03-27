angular.module('mgmApp')
.controller('TaskController', function($scope, taskService){
    $scope.tasks = taskService.getTasks();
    $scope.$on("taskService", function(){
        $scope.tasks = taskService.getTasks();
    });
    $scope.delete = function(task){
        taskService.remove(task).then(
            function(){ alertify.success("Task deleted"); },
            function(msg){ alertify.error(msg);  }
        );
    };
    $scope.download = function(task){
        $scope.$broadcast("downloadFile", '/server/task/ready/' + task.id);
    };
});
