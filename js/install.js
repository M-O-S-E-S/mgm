
var viewModel = {
    currentPage: ko.observable(""),




    checkInstall: function(){
        $.get("/server/install/test").done(function(data){
            var result = JSON.parse(data);
            if(result['Success']){
                if(result['Installed'] == true){
                    viewModel.currentPage('Complete');
                } else {
                    viewModel.currentPage('Title');
                }
            }
        });
    },
    
    confirmTitlePage: function(){
        viewModel.currentPage("Account");
    },

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

        $.post("/server/install/submit", {"name": uname, "email": email, 'password': password}).done(function(data){
            var result = JSON.parse(data);
            if( result['Success'] ){
                viewModel.currentPage("Success");
            } else {
                alert(result['Message']);
            }
        });
    }
};

$(document).ready(function(){
    ko.applyBindings(viewModel);
    viewModel.checkInstall();
});

