var viewModel = {
    titlePageConfirmed: ko.observable(false),
    projectEUPAConfirmed: ko.observable(false),
    registrationSuccessful: ko.observable(false),
    confirmTitlePage: function(){ this.titlePageConfirmed(true); },
    confirmEUPAPage: function(){ this.projectEUPAConfirmed(true); },

    userFirstName: ko.observable(''),
    firstNameError: ko.observable(''),
    userLastName: ko.observable(''),
    lastNameError: ko.observable(''),
    userEmail: ko.observable(''),
    emailError: ko.observable(''),
    userPassword: ko.observable(''),
    passwordError: ko.observable(''),
    userPassword2: ko.observable(''),
    passwordError2: ko.observable(''),
    userGender: ko.observable(''),
    genderError: ko.observable(''),
    userSummary: ko.observable(''),
    register: function(){
        //user input validation
        var fname = this.userFirstName().trim();
        if(fname == ""){
            this.firstNameError('Name is required');
            return;
        }
        if(fname.split(" ").length != 1){
            this.firstNameError('First name only please.');
            return;
        }
        this.firstNameError('');
        var lname = this.userLastName().trim();
        if(lname == ""){
            this.lastNameError('Name is required');
            return;
        }
        if(lname.split(" ").length != 1){
            this.lastNameError('Last name only please.');
            return;
        }
        this.lastNameError('');
        var uname = fname + " " + lname;
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
	if(password != this.userPassword2()){
	    this.passwordError2('Passwords do not match');
	    return;
	}
	this.passwordError2('');
        var gender = this.userGender().trim();
        if( gender != "M" && gender != "F" ){
            this.genderError('Select your gender');
            return;
        }
        this.genderError('');

	var summary = this.userSummary();

        $.post("/server/register/submit", {"name": uname, "email": email, "gender": gender, 'password': password, 'summary': summary}).done(function(data){
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

