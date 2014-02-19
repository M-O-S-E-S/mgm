<?php if ( ! defined('BASEPATH')) exit('No direct script access allowed');

class Register extends CI_Controller {
    public function index(){
        die(file_get_contents(FCPATH . "html/register.html"));
    }
    
    public function submit(){
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

        $gender = $this->input->post('gender');
        if( $gender != 'M' && $gender != 'F' ){
            die(json_encode(array('Success'=>false,'Message'=>'Gender must be M or F')));
        }
        $password = $this->input->post('password');
        if( $password == "" ){
       	    die(json_encode(array('Success'=>false,'Message'=>'Password cannot be blank')));
        }
        $summary = $this->input->post('summary');

        $credential = '$1$'. md5($password);

        //check for duplicate registration or existing accounts
        $this->db->where("name", $name);
        $this->db->or_where("email", $email);
        $q = $this->db->get("users");
        if($q->num_rows() > 0){
            die(json_encode(array('Success'=>false,'Message'=>'There is already an account registered with that name or email')));
        }
        if($this->simiangrid->getUserByName($name) != null ){
            die(json_encode(array('Success'=>false,'Message'=>'There is already an account registered with that name or email')));
        }
        if($this->simiangrid->getUserByEmail($email) != null ){
            die(json_encode(array('Success'=>false,'Message'=>'There is already an account registered with that name or email')));
        }	
        $this->db->insert("users", array("name" => $name, "email" => $email, "gender" => $gender, "password" => $credential, "summary" => $summary));
        if($this->db->affected_rows() > 0){
            sendEmailRegistrationSuccessful($name, $email);
            sendEmailUserRegistered($name, $email);
            die(json_encode(array('Success'=>true)));
        }
        die(json_encode(array('Success'=>false,'Message'=>'an error Occurred')));
    }

}

?>
