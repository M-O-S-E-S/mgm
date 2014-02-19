
var viewModel = {
    titlePageConfirmed: ko.observable(false),
    registrationSuccessful: ko.observable(false),

    confirmTitlePage: function(){ this.titlePageConfirmed(true); },

    userName: ko.observable(''),
    nameError: ko.observable(''),
    userEmail: ko.observable(''),
    emailError: ko.observable(''),
    userPassword: ko.observable(''),
    passwordError: ko.observable(''),
    register: function(){
        //user input validation
        var uname = this.userName().trim();
        if(uname == ""){
            this.nameError('Name is required');
            return;
        }
        if(uname.split(" ").length != 2){
            this.nameError('First and Last names please');
            return;
        }
        this.nameError('');
        var email = this.userEmail().trim();
        if(email == ""){
            this.emailError('Email is required');
            return;
        }
        if( ! /(.+)@(.+){2,}\.(.+){2,}/.test(email) ){
            this.emailError('Invalid email entered');
            return;
        }
        this.emailError('');
        var password = this.userPassword().trim();
        if( password == ""){
            this.passwordError('A password is required');
            return;
        }
        this.passwordError('');

        $.post("install/submit", {"name": uname, "email": email, 'password': password}).done(function(data){
            var result = JSON.parse(data);
            if( result['Success'] ){
                viewModel.registrationSuccessful(true);
            } else {
                alert(result['Message']);
            }
        });
        
    }
};

$(document).ready(function(){
    ko.applyBindings(viewModel);
});

