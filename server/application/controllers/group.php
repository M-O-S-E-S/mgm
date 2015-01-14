<?php if ( ! defined('BASEPATH')) exit('No direct script access allowed');

class Group extends CI_Controller {
    public function index(){
        if(!$this->client->validate()){
            die(json_encode(array('Success' => false, 'Message' => "Access Denied")));
        }
        $uuid = $_SESSION['uuid'];
        session_write_close();
        
        $groups = array();
        
        $groupList = $this->simiangrid->getGroups();
        foreach($groupList as $row){
            $group = json_decode($row->Value);
            //the type Group is not only group definitions, but also active groups.  Filter those out
            if(!isset($group->FounderID))
                continue;
            $group->members = $this->simiangrid->getGroupMembers($row->OwnerID);
            $group->uuid = $row->OwnerID;
            $group->name = $row->Key;
            array_push($groups, $group);
        }
        
        die(json_encode(array('Success' => true, 'Groups' => $groups)));
    }
    
    public function create(){
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
}

?>