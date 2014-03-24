angular.module('mgmApp')
.controller('PendingUserController', function($scope, $modal, userService){
    $scope.users = userService.getPending();
    $scope.$on("userService", function(){
        $scope.users = userService.getPending();
    });
    
    $scope.lastSeen = function(timestamp){
        if(timestamp == undefined || timestamp == ""){
            return "~";
        }
        var last = new Date(timestamp);
        var seconds = Math.floor(((new Date()).getTime() - last.getTime())/1000);
        
        var numdays = Math.floor(seconds / 86400);
        if(numdays > 0){
            return numdays + " days ago";
        }
        var numhours = Math.floor((seconds % 86400) / 3600);
        if(numhours > 0){
            return numhours + " hours ago";
        }
        var numminutes = Math.floor(((seconds % 86400) % 3600) / 60);
        return numminutes + " minutes ago";
    }
    
    $scope.user = {
        current: undefined,
        modal: undefined,
        review: function(selected){
            this.current = selected;
            this.modal = $modal.open({
                templateUrl: '/templates/reviewPendingModal.html',
                keyboard: false,
                scope: $scope,
                resolve: {
                    "user": function() { return selected; }
                }
            });
        },
        approve: function(){
            userService.approvePending(this.current).then(
                function(){ 
                    alertify.success("Pending user " + $scope.user.current.name + " has been approved");
                    $scope.user.modal.close();
                },
                function(msg){ alertify.error(msg); }
            );
        },
        deny: function(reasons){
            if(reasons == undefined || reasons == ""){
                alertify.error("You must provide a reason to deny a pending user");
                return;
            }
            userService.denyPending(this.current, reasons).then(
                function(){ 
                    alertify.success("Pending user " + $scope.user.current.name + " has been denied");
                    $scope.user.modal.close();
                },
                function(msg){ alertify.error(msg); }
            );
        }
    }
    
    userService.updateUsers();
});
