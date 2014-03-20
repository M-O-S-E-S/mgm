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
            $region['estateName'] = $r->EstateName;
            if($level >= 250){
                $region['node'] = $r->slaveAddress;
            } else {
                $region['node'] = "omitted";
            }
            $region['isRunning'] = $r->isRunning == true;
    
            $region['stat'] = array();
            $rStat = $this->regions->lastStat($r->uuid);
            if($rStat){
                $region['stat']['timestamp'] = $rStat->timestamp;
                $region['stat']['status'] = json_decode($rStat->status, true);
            }

            array_push($regions, $region);
        } 
        die(json_encode(array('Success' => true, 'Regions' => $regions)));
    }
    
    public function logs($region){
		if(!$this->client->validate()){
            die(json_encode(array('Success' => false, 'Message' => "Access Denied")));
        }
		$logs = $this->regions->logs($region);
		
		//look up region name for log file name
		$regObj = $this->regions->getRegion($region);
		header("Content-disposition: attachment; filename=" . $regObj->name . "-" . date("Y-m-d") . "-logs.txt");
		header("Content-type: text/plain");
		
		//generate log file
		$text = "";
		foreach($logs as $log){
			$text .= $log->timestamp . " - " . $log->message . "\n";
		}
		
		die($text);
	}
    
    public function stats($region){
		if(!$this->client->validate()){
            die(json_encode(array('Success' => false, 'Message' => "Access Denied")));
        }
        //stats request
        $stat = array();
        $rStat = $this->regions->lastStat($region);
        if($rStat){
            $stat['timestamp'] = $rStat->timestamp;
            $stat['status'] = json_decode($rStat->status, true);
            die(json_encode(array('Success' => true, 'status' => $stat)));
        }
        die(json_encode(array('Success' => false, 'Message' => "No status found for region")));
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
        
        $name = $this->input->post('name');
        $x = $this->input->post('x');
        $y = $this->input->post('y');
        $estate = $this->input->post('estate');
                                
        if( $name == ""){
            die(json_encode(array('Success' => false, 'Message' => "Region Name cannot be blank")));
        }
        if( $x == "" || $y == "" || ! is_numeric($x) || ! is_numeric($y)){
            die(json_encode(array('Success' => false, 'Message' => "Invalid coordinates submitted")));
        }
        if($estate == "" || ! is_numeric($estate)){
            die(json_encode(array('Success' => false, 'Message' => "Invalid estate assignment")));
        }
        
        $regionId = UUID::v4();
        
        $this->regions->create($regionId, $name, $x, $y);
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
        
        $host = $this->input->post('host');
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
        
        $estate = $this->input->post('estate');
        
        $this->regions->estate($region, $estate);
        die(json_encode(array('Success' => true)));
    }
}

?>
