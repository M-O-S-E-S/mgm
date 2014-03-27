<?php if ( ! defined('BASEPATH')) exit('No direct script access allowed');

class Install extends CI_Controller {
    public function index(){
        $users = $this->simiangrid->allUsers();
        if(count($users) == 0){
                die(file_get_contents(FCPATH . 'html/install.html'));
        }
        die(file_get_contents(FCPATH . 'html/installComplete.html'));
    }
    
    public function test(){
        $users = $this->simiangrid->allUsers();
        if(count($users) > 0){
                die(json_encode(array('Success' => true, 'Installed' => false)));
        }
        die(json_encode(array('Success' => true, 'Installed' => false)));
    }
    
    public function submit(){
        $users = $this->simiangrid->allUsers();
        if(count($users) > 0){
                die(json_encode(array('Success' => false, 'Message' => 'Installation already Complete')));
        }

        $name = $this->input->post('name');
        if( $name == "" ){
                die(json_encode(array('Success'=>false,'Message'=>'User name cannot be blank')));
        }
        if( sizeof(explode(" ",$name)) != 2){
            die(json_encode(array('Success'=>false,'Message'=>'First and Last name please')));
        }
        
        $email = $this->input->post('email');
        if( $email == "" ){
            die(json_encode(array('Success'=>false,'Message'=>'Email cannot be blank')));
        }
        if( ! preg_match('/(.+)@(.+){2,}\.(.+){2,}/', $email ) ){
            die(json_encode(array('Success'=>false,'Message'=>'Invalid email entered')));
        }

        $password = $this->input->post('password');
        if( $password == "" ){
       	    die(json_encode(array('Success'=>false,'Message'=>'Password cannot be blank')));
        }

        $credential = '$1$'. md5($password);

        //create the initial user entry
        $avatarUUID = $this->simiangrid->createUserEntry($name, $email);
        if( ! $avatarUUID ){
                die(json_encode(array('Success'=>false,'Message'=>'an error Occurred.  Could not create Avatar')));
        }
        if( ! $this->simiangrid->createUserAvatar($avatarUUID) ){
                die(json_encode(array('Success'=>false,'Message'=>'an error Occurred')));
        }
        if( ! $this->simiangrid->setUserPassword($avatarUUID, $name, $password) ){
                die(json_encode(array('Success'=>false,'Message'=>'an error Occurred')));
        }
        $this->simiangrid->setAccessLevel($avatarUUID, 250);
	
        die(json_encode(array('Success'=>true)));
    }
    
}

?>
