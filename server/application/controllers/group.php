<?php if ( ! defined('BASEPATH')) exit('No direct script access allowed');

class Group extends CI_Controller {
    public function index(){
        if(!$this->client->validate()){
            die(json_encode(array('Success' => false, 'Message' => "Access Denied")));
        }
        $uuid = $_SESSION['uuid'];
        session_write_close();
        
        $groups = $this->simiangrid->getGroups();
        foreach($groups as $group){
            $group->members = $this->simiangrid->getGroupMembers($group->uuid);
            $group->roles = $this->simiangrid->getGroupRoles($group->uuid);
        }
        
        die(json_encode(array('Success' => true, 'Groups' => $groups)));
    }
    
    public function removeUser($groupID){
        if(!$this->client->validate()){
            die(json_encode(array('Success' => false, 'Message' => "Access Denied")));
        }
        if($_SESSION['userLevel'] < 250){
            die(json_encode(array('Success' => false, 'Message' => "Permission Denied")));
        }
        session_write_close();
        
        $input_data = json_decode(trim(file_get_contents('php://input')), true);
        $userID = $input_data['user'];
        
        //check if user is valid
        $name = $this->simiangrid->getUserByID($userID);
        if(!$name){
            die(json_encode(array('Success' => false, 'Message' => "Invalid User ID")));
        }
        
        //check if group is valid
        $group = $this->simiangrid->getGroupByID($groupID);
        if(!$group){
            die(json_encode(array('Success' => false, 'Message' => "Invalid Group ID")));
        }
        
        //confirm user is member of this group
        $members = $this->simiangrid->getGroupMembers($groupID);
        $found = false;
        foreach($members as $member){
            if($member->OwnerID == $userID){
                $found = true;
            }
        }
        if(!$found){
            die(json_encode(array('Success' => false, 'Message' => "User is not a member of this group")));
        }
        
        //make sure the user is not in any advanced roles
        $roles = $this->simiangrid->getRolesForUser($userID, $groupID);
        if(count($roles) > 1){
            die(json_encode(array('Success' => false, 'Message' => "User belongs to configured roles")));
        }
        
        //purge user from group
        if($this->simiangrid->removeUserFromGroup($userID, $groupID)){
             die(json_encode(array('Success' => true)));
        }
        
        die(json_encode(array('Success' => false, 'Message' => "An error occurred")));
    }
    
    public function addUser($groupID){
        if(!$this->client->validate()){
            die(json_encode(array('Success' => false, 'Message' => "Access Denied")));
        }
        if($_SESSION['userLevel'] < 250){
            die(json_encode(array('Success' => false, 'Message' => "Permission Denied")));
        }
        session_write_close();
        
        $input_data = json_decode(trim(file_get_contents('php://input')), true);
        $userID = $input_data['user'];
        
        //check if user is valid
        $name = $this->simiangrid->getUserByID($userID);
        if(!$name){
            die(json_encode(array('Success' => false, 'Message' => "Invalid User ID")));
        }
        
        //check if group is valid
        $group = $this->simiangrid->getGroupByID($groupID);
        if(!$group){
            die(json_encode(array('Success' => false, 'Message' => "Invalid Group ID")));
        }
        
        //check if user is already  amember of this group
        $members = $this->simiangrid->getGroupMembers($groupID);
        foreach($members as $member){
            if($member->OwnerID == $userID){
                die(json_encode(array('Success' => false, 'Message' => "User is already a member of this group")));
            }
        }
        
        //create membership record for this member, and add them to the default role 'everybody'
        if($this->simiangrid->addUserToGroup($userID, $groupID)){
             die(json_encode(array('Success' => true)));
        }
        
        die(json_encode(array('Success' => false, 'Message' => "An error occurred")));
    }
    
    /*public function create(){
        if(!$this->client->validate()){
            die(json_encode(array('Success' => false, 'Message' => "Access Denied")));
        }
        if($_SESSION['userLevel'] < 250){
            die(json_encode(array('Success' => false, 'Message' => "Permission Denied")));
        }
        session_write_close();
        
        $input_data = json_decode(trim(file_get_contents('php://input')), true);
        //$name = $input_data['name'];
        //$owner = $input_data['owner'];
        
        die(json_encode(array('Success' => false, 'Message' => "Not Implemented")));
    }
    
    public function destroy($group){
        if(!$this->client->validate()){
            die(json_encode(array('Success' => false, 'Message' => "Access Denied")));
        }
        if($_SESSION['userLevel'] < 250){
            die(json_encode(array('Success' => false, 'Message' => "Permission Denied")));
        }
        session_write_close();
        
        //$input_data = json_decode(trim(file_get_contents('php://input')), true);
        //$name = $input_data['name'];
        //$owner = $input_data['owner'];
        
        die(json_encode(array('Success' => false, 'Message' => "Not Implemented")));
    }
    */
}

?>