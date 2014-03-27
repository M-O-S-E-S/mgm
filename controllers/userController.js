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
        },
        setEmail: function(email){
            if(email.trim == this.current.email.trim()){
                alertify.log('No Change in Email');
                return;
            }
            if( ! /(.+)@(.+){2,}\.(.+){2,}/.test(email) ){
                alertify.error('Invalid email entered');
                return;
            }
            for(var i = 0; i < $scope.users.length; i++){
                if($scope.users[i].email == email){
                    alertify.error("Error changing email for " + this.current.name + ", email already in use by " + $scope.users[i].name);
                    return;
                }
            }
            userService.setEmail(this.current, email).then(
                function(){ alertify.success("Email for " + $scope.user.current.name + " changed successfully"); },
                function(msg){ alertify.error(msg); }
            );
        },
        setPassword: function(password){
            userService.setPassword(this.current, password).then(
                function(){ alertify.success("Password for " + $scope.user.current.name + " changed successfully"); },
                function(msg){ alertify.error(msg); }
            );
        },
        setAccessLevel: function(level){
            if(level == undefined || level == ""){
                alertify.error("invalid user level");
                return;
            }
            if( Math.floor(level) != level){
                alertify.error("user level is an integert value between 0 and 250");
                return;
            }
            if( level < 0 || level > 250){
                alertify.error("user level is an integert value between 0 and 250");
                return;
            }
            userService.setAccessLevel(this.current, level).then(
                function(){ alertify.success("User level for " + $scope.user.current.name + " has been changed to " + level); },
                function(msg){ alertify.error(msg); }
            );
        },
        remove: function(user){
            alertify.confirm("Are you sure? This purges the user and their avatar from the grid", function(confirmed){
                if(confirmed){
                    userService.remove(user).then(
                        function(){ alertify.success("User " + user.name + " has been deleted"); },
                        function(msg){ alertify.error(msg); }
                    );
                }
            });
        }
    }
});
