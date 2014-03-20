<?php if ( ! defined('BASEPATH')) exit('No direct script access allowed');

class Auth extends CI_Controller {
    
    public function index(){
        if($this->client->validate()){
            $this->client->dieValid();
        }
        die(json_encode(array('Success' => false)));
    }
    
    public function login(){
        $input_data = json_decode(trim(file_get_contents('php://input')), true);
        $this->client->login($input_data['username'],$input_data['password']);
        die(json_encode(array('Success' => false, 'Message' => "An Error Occurred")));
    }
    
    public function logout(){
        session_start();
		session_destroy();
		die(json_encode(array('Success' => true)));
    }
    
    public function changePassword(){
        if(!$this->client->validate()){
            die(json_encode(array('Success' => false, 'Message' => "Access Denied")));
        }
        
        $user = $this->simiangrid->getUserByID($_SESSION['uuid']);
        $input_data = json_decode(trim(file_get_contents('php://input')), true);
        $password = $input_data['password'];

        if(!$user){
            die(json_encode(array('Success' => false, 'Message' => "Error in Grid")));
        }
        
        if( !$password || $password == ""){
            die(json_encode(array('Success' => false, 'Message' => "Invalid Password")));
        }
        
        if($this->simiangrid->setUserPassword($user->UserID, $user->Name, $password)){
            die(json_encode(array('Success' => true)));
        }
        die(json_encode(array('Success' => false, 'Message' => "An Error Occurred")));
    }
}

/* End of file controller.php */
/* Location: ./application/controllers/auth.php */
