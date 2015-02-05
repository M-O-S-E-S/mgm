<?php if ( ! defined('BASEPATH')) exit('No direct script access allowed');

class User extends CI_Controller {
    
    public function index(){
        if(!$this->client->validate()){
            die(json_encode(array('Success' => false, 'Message' => "Access Denied")));
        }
        $uuid = $_SESSION['uuid'];
        $level = $_SESSION['userLevel'];
        session_write_close();
        
        
        $users = array();
        $pendingUsers = array();
        
        $userDirectory = $this->simiangrid->getUsers();
        foreach($userDirectory as $i => $u){
            $user = array();
            $user['name'] = $u->Name;
            $user['uuid'] = $u->UserID;
            $user['email'] = $u->Email;
            $user['userLevel'] = $u->AccessLevel;
            $identities = $this->simiangrid->getIdentities($u->UserID);
            $user['identities'] =  array();
			foreach($identities as $i){
                $identity = array();
                $identity['Identifier'] = $i->Identifier;
                $identity['Enabled'] = $i->Enabled;
                array_push($user['identities'],$identity);
            }
            $user['group'] = $this->simiangrid->getActiveGroup($u->UserID);
            array_push($users, $user);
        }
        
        if($level < 250){
            die(json_encode(array('Success' => true, 'Users' => $users, 'Pending' => $pendingUsers)));
        }
        
        $query = $this->db->get('users');
        foreach($query->result() as $row){
            $r = array();
            $r['name'] = $row->name;
            $r['email'] = $row->email;
            $r['gender'] = $row->gender;
            $r['registered'] = $row->registered;
            $r['summary'] = $row->summary;
            array_push($pendingUsers, $r);
        }
        
        die(json_encode(array('Success' => true, 'Users' => $users, 'Pending' => $pendingUsers)));
        
    }
        
    public function approve(){
        if(!$this->client->validate()){
            die(json_encode(array('Success' => false, 'Message' => "Access Denied")));
        }
        if($_SESSION['userLevel'] < 250){
            die(json_encode(array('Success' => false, 'Message' => "Permission Denied")));
        }
        session_write_close();
        $input_data = json_decode(trim(file_get_contents('php://input')), true);
        $email = $input_data['email'];
        
        $query = $this->db->get_where("users", array("email" => $email));
        $user = $query->row();
        
        if(!$user){
            die(json_encode(array('Success' => false, 'Message' => "pending user not found")));
        }
        
        $query = $this->db->get_where("regions", array("name" => $this->config->item('mgm_hubRegion')));
        $region = $query->row();

        if(!$region){
            die(json_encode(array('Success' => false, 'Message' => "Error: Could not find default region ")));
        }

        if($user->gender == 'M'){
            $template = $this->config->item('registration_maleTemplate');
        } else {
            $template = $this->config->item('registration_femaleTemplate');
        }
        $uri = '{"SceneID":"'. $region->uuid  .'","Position":"<172, 187, 24>","LookAt":"<128, 25, 24>"}';

        if($this->simiangrid->isEmailRegistered($user->email)){
                die(json_encode(array('Success' => false, 'Message' => "Error: Conflicting pre-existing email")));
        }
        if($this->simiangrid->getUserByName($user->name === false)){
                die(json_encode(array('Success' => false, 'Message' => "Error: Conflicting pre-existing user name")));
        }
        $uuid = $this->simiangrid->createUserEntry($user->name, $user->email);
        if( ! $uuid ){
                die(json_encode(array('Success' => false, 'Message' => "Error: Could not create user entry")));
        }
        if( ! $this->simiangrid->createUserAvatar($uuid, $template) ){
                die(json_encode(array('Success' => false, 'Message' => "Error: Could not apply avatar template")));
        }
        if( ! $this->simiangrid->insertUserPassword($uuid, $user->name, $user->password)){
                die(json_encode(array('Success' => false, 'Message' => "Error: Could not apply password")));
        }
        $this->simiangrid->setUserHome($uuid, $uri);
        $this->simiangrid->setUserLastLocation($uuid, $uri);

        sendEmailAccountApproved($user->name, $user->email);

        $query = $this->db->insert_string("summaries", array("name" => $user->name, "email" => $email, "summary" => $user->summary));
        $query = str_replace('INSERT INTO','REPLACE INTO',$query);
        $this->db->query($query);
        $this->db->delete('users', array('email' => $email)); 

        die(json_encode(array('Success' => true)));
    }
    
    public function deny(){
        if(!$this->client->validate()){
            die(json_encode(array('Success' => false, 'Message' => "Access Denied")));
        }
        if($_SESSION['userLevel'] < 250){
            die(json_encode(array('Success' => false, 'Message' => "Permission Denied")));
        }
        session_write_close();
        $input_data = json_decode(trim(file_get_contents('php://input')), true);
        $email = $input_data['email'];
        $reason = $input_data['reason'];

        $this->db->delete('users', array('email' => $email));
		if( $reason && $reason != ""){
			sendEmailAccountDenied($email, $reason);
		}
        die(json_encode(array('Success' => true)));
    }
    
    public function suspend(){
        if(!$this->client->validate()){
            die(json_encode(array('Success' => false, 'Message' => "Access Denied")));
        }
        if($_SESSION['userLevel'] < 250){
            die(json_encode(array('Success' => false, 'Message' => "Permission Denied")));
        }
        session_write_close();
        $input_data = json_decode(trim(file_get_contents('php://input')), true);
        $uuid = $input_data['id'];
        
        $identities = $this->simiangrid->getIdentities($uuid);
        if($identities == false){
            die(json_encode(array('Success' => false, 'Message' => 'Error looking up account information')));
        }
        foreach($identities as $i){
            if($i->Enabled){
                $this->simiangrid->disableIdentity($i);
            }
        }

        die(json_encode(array('Success' => true)));
    }

    public function restore(){
        if(!$this->client->validate()){
            die(json_encode(array('Success' => false, 'Message' => "Access Denied")));
        }
        if($_SESSION['userLevel'] < 250){
            die(json_encode(array('Success' => false, 'Message' => "Permission Denied")));
        }
        session_write_close();
        $input_data = json_decode(trim(file_get_contents('php://input')), true);
        $uuid = $input_data['id'];
        
        $identities = $this->simiangrid->getIdentities($uuid);
        foreach($identities as $i){
            if(!$i->Enabled){
                $this->simiangrid->enableIdentity($i);
            }
        }

        die(json_encode(array('Success' => true)));
    }

    public function email(){
        if(!$this->client->validate()){
            die(json_encode(array('Success' => false, 'Message' => "Access Denied")));
        }
        if($_SESSION['userLevel'] < 250){
            die(json_encode(array('Success' => false, 'Message' => "Permission Denied")));
        }
        session_write_close();
        $input_data = json_decode(trim(file_get_contents('php://input')), true);
        $uuid = $input_data['id'];
        $email = $input_data['email'];
        session_write_close();
        $user = $this->simiangrid->getUserByID($uuid);
        if( $user === false){
            die(json_encode(array('Success' => false, 'Message' => "Could not find user on grid")));
        }
        if( $this->simiangrid->updateUserData($uuid, $user->Name, $email, $user->AccessLevel) ){
            die(json_encode(array('Success' => true)));
        }
        die(json_encode(array('Success' => false, 'Message' => "Could not update user data")));
    }
    
    public function accessLevel(){
        if(!$this->client->validate()){
            die(json_encode(array('Success' => false, 'Message' => "Access Denied")));
        }
        if($_SESSION['userLevel'] < 250){
            die(json_encode(array('Success' => false, 'Message' => "Permission Denied")));
        }
        session_write_close();
        $input_data = json_decode(trim(file_get_contents('php://input')), true);
        $uuid = $input_data['uuid'];
        $accessLevel = $input_data['accessLevel'];
        if( $accessLevel < 0){
            $accessLevel = 0;
        } elseif( $accessLevel > 250 ){
            $acessLevel = 250;
        } elseif( is_nan($accessLevel) ){
            die(json_encode(array('Success' => false, 'Message' => "Invalid Access Level")));
        }
        session_write_close();
        $user = $this->simiangrid->getUserByID($uuid);
        if( $user === false){
            die(json_encode(array('Success' => false, 'Message' => "Could not find user on grid")));
        }
        if($this->simiangrid->setAccessLevel($uuid, $accessLevel)){
            die(json_encode(array('Success' => true)));
        }
        die(json_encode(array('Success' => false, 'Message' => "grid error setting access level")));
    }
    
    public function password(){
        if(!$this->client->validate()){
            die(json_encode(array('Success' => false, 'Message' => "Access Denied")));
        }
        if($_SESSION['userLevel'] < 250){
            die(json_encode(array('Success' => false, 'Message' => "Permission Denied")));
        }
        session_write_close();
        $input_data = json_decode(trim(file_get_contents('php://input')), true);
        $uuid = $input_data['id'];
        $plainPass = $input_data['password'];
        $user = $this->simiangrid->getUserByID($uuid);
        if( $user === false){
            die(json_encode(array('Success' => false, 'Message' => "Could not find user on grid")));
        }
        $identifier = $user->Name;
        if( $this->simiangrid->setUserPassword($uuid, $identifier, $plainPass) ){
            die(json_encode(array('Success' => true)));
        }
        die(json_encode(array('Success' => false, 'Message' => "grid error setting password")));
    }
    
    public function destroy($user){
        if(!$this->client->validate()){
            die(json_encode(array('Success' => false, 'Message' => "Access Denied")));
        }
        if($_SESSION['userLevel'] < 250){
            die(json_encode(array('Success' => false, 'Message' => "Permission Denied")));
        }
        session_write_close();
        
        //make sure its a valid user
        if($this->simiangrid->getUserByID($user) === false){
            die(json_encode(array('Success' => false, 'Message' => "Invalid user")));
        }
        
        //check for estate owner
        $q = $this->db->get_where("estate_settings", array("EstateOwner"=> $user));
        if($q->num_rows() > 0){
            die(json_encode(array('Success' => false, 'Message' => "User is an estate owner, delete refused")));
        }
        
        //delete simian account
        if(!$this->simiangrid->removeUser($user)){
            die(json_encode(array('Success' => false, 'Message' => "could not purge avatar")));
        }

        //delete from estate tables
        $tables = array("estate_managers","estate_users");
        $this->db->where("uuid", $user);
        $this->db->delete($tables);
        die(json_encode(array('Success' => true)));
    }
}

/* End of file controller.php */
/* Location: ./application/controllers/controller.php */
