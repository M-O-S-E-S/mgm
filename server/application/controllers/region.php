<?php if ( ! defined('BASEPATH')) exit('No direct script access allowed');

class Region extends CI_Controller {
    
    public function index(){
        if(!$this->client->validate()){
            die(json_encode(array('Success' => false, 'Message' => "Access Denied")));
        }
        $uuid = $_SESSION['uuid'];
        $level = $_SESSION['userLevel'];
        session_write_close();
        
        if($level >= 250){
            // all regions
            $sqlRegions = $this->regions->allRegions();
        } else {
            // standard user, limited control and display
            $sqlRegions = $this->regions->forUser($uuid);
        }
            
        $regions = array();
        foreach( $sqlRegions as $r){
            $region = array();
            $region["uuid"] = $r->uuid;
            $region['name'] = $r->name;
            $region['x'] = $r->locX;
            $region['y'] = $r->locY;
            $region['size'] = $r->size;
            $region['estateName'] = $r->EstateName;
            $region['status'] = json_decode($r->status);
            if($level >= 250){
                $region['node'] = $r->slaveAddress ? $r->slaveAddress : "";
            } else {
                $region['node'] = "omitted";
            }
            $region['isRunning'] = $r->isRunning == true;

            array_push($regions, $region);
        } 
        die(json_encode(array('Success' => true, 'Regions' => $regions)));
    }
    
    public function logs($regionUUID){
		if(!$this->client->validate()){
            die(json_encode(array('Success' => false, 'Message' => "Access Denied")));
        }
        $name = $this->regions->getRegionName($regionUUID);
	if(!$name)
            die(json_encode(array('Success' => false, 'Message' => "Region does not exist")));
        $this->regions->logs($name);
	}
            
    public function start($region){
        if(!$this->client->validate()){
            die(json_encode(array('Success' => false, 'Message' => "Access Denied")));
        }
        $uuid = $_SESSION['uuid'];
        $level = $_SESSION['userLevel'];
        session_write_close();

        if(! $this->regions->isOwner($uuid,$region) && !$this->regions->isManager($uuid, $region) && $level < 250){
            die(json_encode(array('Success' => false, 'Message' => "Permission Denied")));
        }
        $this->regions->start($region);
        die(json_encode(array('Success' => false, 'Message' => "unknown error")));
    }
    
    public function stop($region){
        if(!$this->client->validate()){
            die(json_encode(array('Success' => false, 'Message' => "Access Denied")));
        }
        $uuid = $_SESSION['uuid'];
        $level = $_SESSION['userLevel'];
        session_write_close();

        if(! $this->regions->isOwner($uuid,$region) && !$this->regions->isManager($uuid, $region) && $level < 250){
            die(json_encode(array('Success' => false, 'Message' => "Permission Denied")));
        }
        $this->regions->stop($region);
        die(json_encode(array('Success' => false, 'Message' => "unknown error")));
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
        $x = $input_data['x'];
        $y = $input_data['y'];
        $size = $input_data['size'];
        $estate = $input_data['estate'];
                                
        if( $name == ""){
            die(json_encode(array('Success' => false, 'Message' => "Region Name cannot be blank")));
        }
        if( $x == "" || $y == "" || ! is_numeric($x) ||  $x < 0 || ! is_numeric($y) || $y < 0){
            die(json_encode(array('Success' => false, 'Message' => "Invalid coordinates submitted")));
        }
        if( $size == "" || ! is_numeric($size) || $size < 1 || $size > 32){
			die(json_encode(array('Success' => false, 'Message' => "Invalid size submitted")));
		}
        if($estate == "" || ! is_numeric($estate)){
            die(json_encode(array('Success' => false, 'Message' => "Invalid estate assignment")));
        }
        
        $regionId = UUID::v4();
        
        $this->regions->create($regionId, $name, $x, $y, $size);
        $this->regions->estate($regionId, $estate);

        die(json_encode(array('Success' => true, 'id'=>$regionId)));
    }
    
    public function destroy($region){
        if(!$this->client->validate()){
            die(json_encode(array('Success' => false, 'Message' => "Access Denied")));
        }
        if($_SESSION['userLevel'] < 250){
            die(json_encode(array('Success' => false, 'Message' => "Permission Denied")));
        }
        session_write_close();
        
        $this->regions->destroy($region);
        die(json_encode(array('Success' => false, 'Message' => "unknown error")));
    }
    
    public function host($region){
        if(!$this->client->validate()){
            die(json_encode(array('Success' => false, 'Message' => "Access Denied")));
        }
        if($_SESSION['userLevel'] < 250){
            die(json_encode(array('Success' => false, 'Message' => "Permission Denied")));
        }
        session_write_close();
        
        $input_data = json_decode(trim(file_get_contents('php://input')), true);
        $host = $input_data['host'];

        $this->regions->host($region, $host);
        die(json_encode(array('Success' => true)));
    }
    
    public function estate($region){
        if(!$this->client->validate()){
            die(json_encode(array('Success' => false, 'Message' => "Access Denied")));
        }
        if($_SESSION['userLevel'] < 250){
            die(json_encode(array('Success' => false, 'Message' => "Permission Denied")));
        }
        session_write_close();
        
        $input_data = json_decode(trim(file_get_contents('php://input')), true);
        $estate = $input_data['estate'];
        
        $this->regions->estate($region, $estate);
        die(json_encode(array('Success' => true)));
    }
    
    public function config($uuid = null){
        if(!$this->client->validate()){
            die(json_encode(array('Success' => false, 'Message' => "Access Denied")));
        }
        if($_SESSION['userLevel'] < 250){
            die(json_encode(array('Success' => false, 'Message' => "Permission Denied")));
        }
        session_write_close();
        if($uuid == null){
            $defaultConfig = $this->regions->getDefaultConfig();
            die(json_encode(array('Success' => true, 'Config' => $defaultConfig)));
        }
        
        $name = $this->regions->getRegionName($uuid);
        $regionConfig = $this->regions->getRegionConfig($uuid);
        
        die(json_encode(array('Success' => true, 'Config' => $regionConfig)));
    }
    
    public function deleteConfig($region = null){
        if(!$this->client->validate()){
            die(json_encode(array('Success' => false, 'Message' => "Access Denied")));
        }
        if($_SESSION['userLevel'] < 250){
            die(json_encode(array('Success' => false, 'Message' => "Permission Denied")));
        }
        session_write_close();
        
        
        $input_data = json_decode(trim(file_get_contents('php://input')), true);
        $section = $input_data['section'];
        $key = $input_data['key'];
        
        if($section == null || $section == ""){
            die(json_encode(array('Success' => false, 'Message' => "Section requred to write config")));
        }
        if($key == null || $key == ""){
            die(json_encode(array('Success' => false, 'Message' => "Key required to write config")));
        }
        
        if($region != null){
            //check for valid region
            if(!$this->regions->getRegionName($region)){
                die(json_encode(array('Success' => false, 'Message' => "Invalid configuration")));
            }
        }
        
        $this->regions->deleteRegionConfig($region, $section, $key);
        
        die(json_encode(array('Success' => true)));
    }
    
    public function setConfig($region = null){
        if(!$this->client->validate()){
            die(json_encode(array('Success' => false, 'Message' => "Access Denied")));
        }
        if($_SESSION['userLevel'] < 250){
            die(json_encode(array('Success' => false, 'Message' => "Permission Denied")));
        }
        session_write_close();
        
        
        $input_data = json_decode(trim(file_get_contents('php://input')), true);
        $section = $input_data['section'];
        $key = $input_data['key'];
        $value = $input_data['value'];
        
        if($section == null || $section == ""){
            die(json_encode(array('Success' => false, 'Message' => "Section requred to write config")));
        }
        if($key == null || $key == ""){
            die(json_encode(array('Success' => false, 'Message' => "Key required to write config")));
        }
        if($value == null || $value == ""){
            die(json_encode(array('Success' => false, 'Message' => "Value required to write config")));
        }
        
        if($region != null){
            //check for valid region
            if(!$this->regions->getRegionName($region)){
                die(json_encode(array('Success' => false, 'Message' => "Invalid configuration")));
            }
        }
        
        $this->regions->setRegionConfig($region, $section, $key, $value);
        
        die(json_encode(array('Success' => true)));
    }
}

?>
