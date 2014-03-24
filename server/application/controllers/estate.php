<?php if ( ! defined('BASEPATH')) exit('No direct script access allowed');

class Estate extends CI_Controller {
    public function index(){
        if(!$this->client->validate()){
            die(json_encode(array('Success' => false, 'Message' => "Access Denied")));
        }
        $uuid = $_SESSION['uuid'];
        session_write_close();
        
        $estates = array();
        $query = $this->db->get('estate_settings');
        foreach($query->result() as $r){
            $estate = array();
            $estate['id'] = $r->EstateID;
            $estate['name'] = $r->EstateName;
            $estate['owner'] = $r->EstateOwner;
            
            $estate['managers'] = array();
            $q = $this->db->get_where('estate_managers',array("EstateID"=>$r->EstateID));
            foreach($q->result() as $r){
                array_push($estate['managers'], $r->uuid);
            }

            $estate['regions'] = array();
            $q = $this->db->get_where('estate_map',array("EstateID" => $estate['id']));
            foreach($q->result() as $r){
                array_push($estate['regions'], $r->RegionID);
            }
            
            array_push($estates, $estate);
        }
        die(json_encode(array('Success' => true, 'Estates' => $estates)));

        $sqlEstates = $mgm->getEstates();
        
        //this is estate-level informative, any managers should be able to see who manages other estates, etc.
        $estates = array();
        foreach($sqlEstates as $id => $data){
            $estate = array();
            $estate['id'] = $id;
            $estate['name'] = $data['EstateName'];
            $estate['owner'] = $data['EstateOwner'];
            $estate['managers'] = $mgm->getManagers($id);
            $estate['regions'] = $mgm->getRegionsInEstate($id);
            array_push($estates, $estate);
        }

        die(json_encode(array('Success' => true, 'Estates' => $estates)));
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
        $name = $input_data['name'];
        $owner = $input_data['owner'];
        
        if( $name == ""){
            die(json_encode(array('Success' => false, 'Message' => "Estate Name cannot be blank")));
        }
        
        $id = $this->estates->createEstate($name, $owner);
        if($id){
            die(json_encode(array('Success' => true, 'id' => $id)));
        } else {
            die(json_encode(array('Success' => false, 'Message' => "Could not create estate entry")));
        }
    }
    
    public function destroy($estate){
        if(!$this->client->validate()){
            die(json_encode(array('Success' => false, 'Message' => "Access Denied")));
        }
        if($_SESSION['userLevel'] < 250){
            die(json_encode(array('Success' => false, 'Message' => "Permission Denied")));
        }
        session_write_close();
        
        $tables = array("estateban","estate_groups","estate_managers","estate_map","estate_settings","estate_users");
        foreach($tables as $table){
            $this->db->where("EstateID", $estate);
            $this->db->delete($table);
        }
        die(json_encode(array('Success' => true)));
    }
}

?>
