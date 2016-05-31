angular.module('mgmApp')
.controller('TaskController', function($scope, taskService, regionService){
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
    $scope.regionNameFromUUID = function(uuid){
        var regions = regionService.getRegions();
        for(var i = 0; i < regions.length; i++){
            if(regions[i].uuid == uuid)
                return regions[i].name;
        }
        return "-";
    }
});
