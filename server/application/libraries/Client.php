<?php if ( ! defined('BASEPATH')) exit('No direct script access allowed');

class Client {

    public function validate(){
        //check logged in client
        session_start();
		if(isset($_SESSION['name'])){
			return true;
		}
		session_destroy();
        return false;
    }
    
    public function isHost(){
        //check slave
        $ci = &get_instance();
        $ip = $ci->input->ip_address();
        //forced check for localhost
        if($ip == "127.0.0.1"){
            return true;
        }
        $query = $ci->db->get_where("hosts", array("address" => $ip));
        if($query->num_rows() > 0){
            return true;
        }
        //not valid
        log_message('debug',"isHost failed for $ip");
        return false;
    }

    public function dieValid(){
        $arr = array(
            'Success' => true,
            'username' => $_SESSION['name'],
            'accessLevel' => $_SESSION['userLevel'],
            'email' => $_SESSION['email']
        );
        die(json_encode($arr));
    }
    
    public function login($identifier, $credential){
        if( $identifier . ":" == ":" || $credential . ":" == ":" ){
            die(json_encode(array('Success' => false, 'Message' => "Invalid Credentials")));
        }
        
        $sim = &get_instance()->simiangrid;
        
        $user_id = $sim->authenticate($identifier, $credential);
        if(!$user_id){
            die(json_encode(array('Success' => false, 'Message' => "Invalid Credentials")));
        }
		
        $user = $sim->getUserByID($user_id);
        
        session_start();
        $_SESSION['name'] = $user->Name;
        $_SESSION['uuid'] = $user_id;
        $_SESSION['userLevel'] = $user->AccessLevel;
        $_SESSION['email'] = $user->Email;
        $this->dieValid();
    }
}
