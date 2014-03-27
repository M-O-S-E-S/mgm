angular.module('mgmApp')
.controller('RegisterController', function($scope, $modal, userService){
    $scope.stage = "EUPA";
    
    $scope.acceptEupa = function(){
        $scope.stage = "Account";
    }
    
    $scope.error = {
        fname: "",
        lname: "",
        email: "",
        pword: "",
        gender: ""
    }
    
    $scope.reg = {
        fname: "",
        lname: "",
        email: "",
        pword: "",
        pword2: "",
        gender: "",
        reasons: ""
    }
    
    $scope.apply = function(){
        //user input validation
        var fname = $scope.reg.fname.trim();
        if(fname == ""){
            $scope.error.fname = 'Name is required';
            return;
        }
        if(fname.split(" ").length != 1){
            $scope.error.fname = 'First name only please.';
            return;
        }
        $scope.error.fname = "";
        var lname = $scope.reg.lname.trim();
        if(lname.trim() == ""){
            $scope.error.lname = 'Name is required';
            return;
        }
        if(lname.split(" ").length != 1){
            $scope.error.lname = 'Last name only please.';
            return;
        }
        $scope.error.lname =  '';
        var uname = fname + " " + lname;
        var email = $scope.reg.email.trim();
        if(email == ""){
            $scope.error.email = 'Email is required';
            return;
        }
        if( ! /(.+)@(.+){2,}\.(.+){2,}/.test(email) ){
            $scope.error.email = 'Invalid email entered';
            return;
        }
        $scope.error.email = '';
        var pword = $scope.reg.pword.trim();
        if( pword == ""){
            $scope.error.pword = 'A password is required';
            return;
        }
        if(pword != $scope.reg.pword2){
            $scope.error.pword = 'Passwords do not match';
            return;
        }
        $scope.error.pword = '';
        var gender = $scope.reg.gender;
        if( gender != "M" && gender != "F" ){
            $scope.error.gender = 'Select your gender';
            return;
        }
        $scope.error.gender = '';

        //all fields valid, check for duplicates on grid
        
        var users = userService.getUsers();
        
        for(var i = 0; i < users.length; i++){
            if(users[i].name == uname){
                alertify.error("User " + uname + "already exists on the grid");
                return;
            }
            if(users[i].email == email){
                alertify.error("Email " + email + "already exists on the grid");
                return;
            }
        }

        userService.register(uname, email, gender, pword, $scope.reg.reasons).then(
            function(){
                $scope.stage = "Registered";
            },
            function(msg){
                alertify.error(msg);
            }
        );
    }
});
