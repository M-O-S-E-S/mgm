<?php if ( ! defined('BASEPATH')) exit('No direct script access allowed');

class Regions {
    
    function getRegion($region){
		$db = &get_instance()->db;
		$sql = "SELECT name FROM regions WHERE uuid=" . $db->escape($region);
		$q = $db->query($sql);
		if(!$q){
			return null;
		}
		return $q->row();
	}
    
    function logs($region){
		$db = &get_instance()->db;
		$sql = "SELECT timestamp, message FROM regionLogs WHERE region=" . $db->escape($region) . " ORDER BY timestamp ASC";
		$q = $db->query($sql);
		if(!$q){
			return null;
		}
		return $q->result();
	}
    
    function lastStat($region){
        $db = &get_instance()->db;
        $sql = "SELECT timestamp, status FROM regionStats WHERE region=". $db->escape($region) ." ORDER BY timestamp DESC LIMIT 1";
        $q = $db->query($sql);
        if(!$q){
            return null;
        }
        return $q->row();
    }
    
    function forUser($user){
        $db = &get_instance()->db;
        $sql = "Select name, uuid, locX, locY, size, slaveAddress, isRunning, EstateName from regions, estate_map, estate_settings ";
        $sql.= "where estate_map.RegionID = regions.uuid AND estate_map.EstateID = estate_settings.EstateID AND uuid in ";
        $sql.= "(SELECT RegionID FROM estate_map WHERE ";
        $sql.= "EstateID in (SELECT EstateID FROM estate_settings WHERE EstateOwner=". $db->escape($user) .") OR ";
        $sql.= "EstateID in (SELECT EstateID from estate_managers WHERE uuid=". $db->escape($user) ."))";
        $q = $db->query($sql);
        if(! $q ){
            return array();
        }
        return $q->result();
    }
    
    function allRegions(){
        $db = &get_instance()->db;
        $sql = "Select name, uuid, locX, locY, size, slaveAddress, isRunning, EstateName from ";
        $sql.= "regions, estate_map, estate_settings where estate_map.RegionID = regions.uuid AND estate_map.EstateID = estate_settings.EstateID";
        $q = $db->query($sql);
        if(! $q ){
            return array();
        }
        return $q->result();
    }
    
    function isOwner($user, $region){
        $db = &get_instance()->db;
        
        $sql = "SELECT uuid FROM regions WHERE uuid in ";
        $sql.= "(SELECT RegionID FROM estate_map WHERE ";
        $sql.= "EstateID in (SELECT EstateID FROM estate_settings WHERE EstateOwner=" . $db->escape($user) . ")) AND";
        $sql.= " uuid=" . $db->escape($region);
        $query = $db->query($sql);
        if($query->num_rows() == 0){
            return false;
        }
        return true;
    }
    
    function isManager($user, $region){
        $db = &get_instance()->db;
        
        $sql = "SELECT uuid FROM regions WHERE uuid in ";
        $sql.= "(SELECT RegionID FROM estate_map WHERE ";
        $sql.= "EstateID in (SELECT EstateID from estate_managers WHERE uuid=" . $db->escape($user) . ")) AND";
        $sql.= " uuid=" . $db->escape($region);
        $query = $db->query($sql);
        if($query->num_rows() == 0){
            return false;
        }
        return true;
    }
    
    function saveOar($userID, $regionID){
        $db = &get_instance()->db;
      
        #add job & get number
        $db->insert("jobs", array("type" => "save_oar", "user" => $userID, "data" => json_encode(array('Status' => "Pending..."))));
        $job = $db->insert_id();
        #contact mosesSlave to trigger oar save with job number
        $url = $this->getSlave($regionID);
        
        $query = $db->get_where("regions", array("uuid" => $regionID));
        if($query->num_rows() == 0){
            die(json_encode(array('Success' => false, 'Message' => "Region not found")));
        }
        $region = $query->row();
        
        $args = array(
            'name' => $region->name, 
            'uname' => $region->consoleUname, 
            'password' => $region->consolePass,
            'job' => $job,
            'action' => "save"
        );
        $result = simple_curl($url . "/oar", $args);

        $result = json_decode($result);
        #if failed, update job
        if(!$result){
            $db->delete("jobs", array("id" => $job));
            die(json_encode(array('Success' => false, 'Message' => "Error contacting Host")));
        }
        if(!$result->Success){
            $db->delete("jobs", array("id" => $job));
            die(json_encode($result));
        }
        #return status
        die(json_encode(array('Success' => true, 'ID' => $job)));
    }
    
    function getSlave($region){
        $db = &get_instance()->db;
        
        $sql = "SELECT address, port FROM hosts WHERE address=(SELECT slaveAddress FROM regions WHERE uuid=".$db->escape($region).")";
        $query = $db->query($sql);
        $r = $query->row();
        if($r){
            return "https://" . $r->address . ":" . $r->port . "/";
        } else {
            return "";
        }
    }
    
    function start($region){
        $db = &get_instance()->db;
        
        $slaveUrl = $this->getSlave($region);
        if(!$slaveUrl || $slaveUrl == ""){
            die(json_encode(array('Success' => false, 'Message' => "Could not find host for region")));
        }
        $q = $db->get_where("regions", array("uuid" => $region));
        if($q){
            $r = $q->row();
            $name = $r->name;
            $response = simple_curl($slaveUrl . "region/" . $name ."/start");
            if(!$response || $response == ""){
                die(json_encode(array('Success' => false, 'Message' => "Error communicating with region host")));
            }
            die($response);
        }
        die(json_encode(array('Success' => false, 'Message' => "Error finding region")));
    }
    
    function stop($region){
		$ig = &get_instance();
        
        $slaveUrl = $this->getSlave($region);
        if(!$slaveUrl || $slaveUrl == ""){
            die(json_encode(array('Success' => false, 'Message' => "Could not find host for region")));
        }
        //use the terminal to request a quit before starting kill timer
        $session = $ig->consoles->open($region);
        $ig->consoles->write($session, "quit");
        $ig->consoles->close($session);
        
        //start kill timer
        $q = $ig->db->get_where("regions", array("uuid" => $region));
        if($q){
            $r = $q->row();
            $name = $r->name;
            $response = simple_curl($slaveUrl . "region", array('name' => $name, 'action' => 'stop'));
            if(!$response || $response == ""){
                die(json_encode(array('Success' => false, 'Message' => "Error communicating with region host")));
            }
            die($response);
        }
        die(json_encode(array('Success' => false, 'Message' => "Error finding region")));
    }
    
    function create($regionId, $name, $x, $y, $size){
		$ci = &get_instance();
        $data = array(
            "uuid" => $regionId,
            "name" => $name,
            "locX" => $x,
            "locY" => $y,
            "size" => $size);
        $ci->db->insert("regions", $data);
        return true;
    }
    
    function destroy($uuid){
        $ci = &get_instance();
        
        if(! UUID::is_valid($uuid)){
            die(json_encode(array('Success' => false, 'Message' => "Invalid region")));
        }

        $q = $ci->db->get_where("regions", array("uuid"=>$uuid));
        $region = $q->row();
        //remove region from host if registered
        if($region->slaveAddress){
            $this->host($uuid, "none");
        }

        //remove region from estate
        $ci->db->delete("estate_map",array("RegionID" => $uuid));
        if($ci->db->affected_rows() == 0){
            die(json_encode(array('Success' => false, 'Message' => "Invalid region")));
        }
        
        //grab region data
        $q = $ci->db->get_where("regions",array("uuid" => $uuid));
        $reg = $q->row();
        
        //remove region from mgm
        $ci->db->delete("regions",array("uuid" => $uuid));
        if($ci->db->affected_rows() == 0){
            die(json_encode(array('Success' => false, 'Message' => "Invalid region")));
        }
        
        //clear region from opensim database
        $odb = $ci->load->database('opensim', TRUE);
        
        //no quick way about it, we need to remove this region from all regions tables
        $odb->query("DELETE FROM landaccesslist WHERE LandUUID IN (SELECT UUID FROM land WHERE RegionUUID=". $odb->escape($uuid) .")");
        $odb->delete("land", array("RegionUUID" => $uuid));
        $odb->delete("regionban", array("regionUUID" => $uuid));
        $odb->delete("regionenvironment", array("region_id" => $uuid));
        $odb->delete("regionextra", array("RegionID" => $uuid));
        $odb->delete("regionsettings", array("regionUUID" => $uuid));
        $odb->delete("regionwindlight", array("region_id" => $uuid));
        $odb->delete("spawn_points", array("RegionID" => $uuid));
        $odb->delete("terrain", array("RegionUUID" => $uuid));
        $odb->query("DELETE FROM primitems WHERE primID IN (SELECT UUID FROM prims WHERE RegionUUID=". $odb->escape($uuid) .")");
        $odb->query("DELETE FROM primshapes WHERE UUID IN (SELECT UUID FROM prims WHERE RegionUUID=". $odb->escape($uuid) .")");
        $odb->delete("prims", array("RegionUUID" => $uuid));

        //clear region from mgmNode
        if(isset($reg->slaveAddress)){
            $url = $this->getSlave($reg->id) . "region/";
            $result = simple_curl($url, array('name'=> $name,'action'=> 'remove'));
        }
        die(json_encode(array('Success' => true)));
    }
    
    function host($region, $host){
        $ci = &get_instance();
        
        //get region name for host registration
        $q = $ci->db->get_where("regions", array("uuid" => $region));
        $r = $q->row();
        if(! $r ){
            die(json_encode(array('Success' => false, 'Message' => "could not find region")));
        }
        
        //get current host
        $url = $this->getSlave($region);
        if($url != ""){
            $url = $url . "region/";
            //remove region from current host
            simple_curl($url, array('name'=> $r->name,'action'=> 'remove'));
        }
        
        //try to set new host
        if($host == "none"){
            //we are taking this region offline
            $ci->db->where("uuid", $region);
            $ci->db->update("regions", array("slaveAddress" => NULL));
            if($ci->db->affected_rows() == 0){
                die(json_encode(array('Success' => false, 'Message' => "could not persist host setting for region")));
            }
            return true;
        } else {
            //we are setting a new host
            $q = $ci->db->get_where("hosts", array("address" => $host));
            $h = $q->row();
            if(! $h ){
                die(json_encode(array('Success' => false, 'Message' => "could not find new host")));
            }
            
            $url =  "https://" . $h->address . ":" . $h->port .'/region/';
            $result = simple_curl($url, array('name'=> $r->name,'action'=> 'add'));
            $result = json_decode($result);
            if(!isset($result->Success)){
                die(json_encode(array('Success' => false, 'Message' => "error communicating with host")));
            }
            if($result->Success){
                $ci->db->where("uuid", $region);
                $ci->db->update("regions", array("slaveAddress" => $host));
                if($ci->db->affected_rows() == 0){
                    die(json_encode(array('Success' => false, 'Message' => "could not persist host setting for region")));
                }
                return true;
            }
            die(json_encode($result));
        }
    }
    
    function estate($region, $estate){
        $db = &get_instance()->db;
        $sql = "INSERT INTO estate_map (RegionID, EstateID) VALUES (". $db->escape($region) .",". $db->escape($estate) .")
            ON DUPLICATE KEY UPDATE RegionID = VALUES(RegionID), EstateID = VALUES(EstateID)";
        $query = $db->query($sql);
        if($db->affected_rows() == 0){
            die(json_encode(array('Success' => false, 'Message' => "could not set estate for region")));
        }
        return true;
    }
    
    function serveRegionConfig($name){
        $db = &get_instance()->db;
        $q = $db->get_where("regions",array("name"=>$name));
        $region = $q->row();
        if(! $region){
            die(json_encode(array('Success' => false, 'Message' => "region does not exist")));
        }
        
        die(json_encode(array('Success' => true, 'Region' => $region)));
    }
    
    function serveOpensimConfig($regionName, $consoleUser, $consolePass, $consolePort, $httpPort){
        $ci = &get_instance();
        $mgmConnectionString = "Data Source=".$ci->db->hostname.";Database=".$ci->db->database.";User ID=".$ci->db->username.";Password=".$ci->db->password.";Old Guids=true;";
        $odb = $ci->load->database('opensim', TRUE);
        $opensimConnectionString = "Data Source=".$odb->hostname.";Database=".$odb->database.";User ID=".$odb->username.";Password=".$odb->password.";Old Guids=true;";
        $mgmUrl = $ci->config->item('mgm_internal_address');
        $simianUrl = $ci->config->item('simian_gridUrl');
        $groupsRead = $ci->config->item('simian_groups_read_key');
        $groupsWrite = $ci->config->item('simian_groups_write_key');
        $sections = array();
        $sections['Startup'] = array();
        $sections['Startup']['region_info_source'] = "filesystem";
        $sections['Startup']['Stats_URI'] = "jsonSimStats";
        $sections['Network'] = array();
        $sections['Network']['ConsoleUser'] = $consoleUser;
        $sections['Network']['ConsolePass'] = $consolePass;
        $sections['Network']['console_port'] = $consolePort;
        $sections['Network']['http_listener_port'] = $httpPort;
        $sections['Messaging'] = array();
        $sections['Messaging']['Gatekeeper'] = $simianUrl;
        $sections['Messaging']['OfflineMessageURL'] = $mgmUrl . "server/messages";
        $sections['Messaging']['MuteListURL'] = $simianUrl;
        $sections['Groups'] = array();
        $sections['Groups']['GroupsServerURI'] = $simianUrl;
        $sections['Groups']['XmlRpcServiceReadKey'] = $groupsRead;
        $sections['Groups']['XmlRpcServiceWriteKey'] = $groupsWrite;
        $sections['GridService'] = array();
        $sections['GridService']['GridServerURI'] = $simianUrl;
        $sections['GridService']['Gatekeeper'] = "http://mygridserver.com:8002";
        $sections['AssetService'] = array();
        $sections['AssetService']['AssetServerURI'] = $simianUrl;
        $sections['DatabaseService'] = array();
        $sections['DatabaseService']['ConnectionString'] = $opensimConnectionString;
        $sections['DatabaseService']['EstateConnectionString'] = $mgmConnectionString;
        $sections['InventoryService'] = array();
        $sections['InventoryService']['InventoryServerURI'] = $simianUrl;
        $sections['GridInfo'] = array();
        $sections['GridInfo']['Gatekeeper'] = $simianUrl;
        $sections['AvatarService'] = array();
        $sections['AvatarService']['AvatarServerURI'] = $simianUrl;
        $sections['PresenceService'] = array();
        $sections['PresenceService']['PresenceServerURI'] = $simianUrl;
        $sections['UserAccountService'] = array();
        $sections['UserAccountService']['UserAccountServerURI'] = $simianUrl;
        $sections['GridUserService'] = array();
        $sections['GridUserService']['GridUserServerURI'] = $simianUrl;
        $sections['AuthenticationService'] = array();
        $sections['AuthenticationService']['AuthenticationServerURI'] = $simianUrl;
        $sections['FriendsService'] = array();
        $sections['FriendsService']['FriendsServerURI'] = $simianUrl;
        $sections['HGInventoryAccessModule'] = array();
        $sections['HGInventoryAccessModule']['HomeURI'] = $simianUrl;
        $sections['HGInventoryAccessModule']['GateKeeper'] = $simianUrl;
        $sections['HGAssetService'] = array();
        $sections['HGAssetService']['HomeURI'] = $simianUrl;
        $sections['UserAgentService'] = array();
        $sections['UserAgentService']['UserAgentServiceURI'] = $simianUrl;
        $sections['MapImageService'] = array();
        $sections['MapImageService']['MapImageServiceURI'] = $simianUrl;
        $sections['SimianGrid'] = array();
        $sections['SimianGrid']['SimianServiceURL'] = $simianUrl;
        $sections['SimianGrid']['SimulatorCapability'] = "00000000-0000-0000-0000-000000000000";
        $sections['SimianGridMaptiles'] = array();
        $sections['SimianGridMaptiles']['Enabled'] = "true";
        $sections['SimianGridMaptiles']['MaptileURL'] = $simianUrl;
        $sections['SimianGridMaptiles']['RefreshTime'] = "7200";
        $sections['Terrain'] = array();
        $sections['Terrain']['SendTerrainUpdatesByViewDistance'] = true;
        $sections['FreeSwitchVoice'] = array();
        $sections['FreeSwitchVoice']['FreeswitchServiceURL'] = $mgmUrl . "server/fsapi";
                
        $q = $ci->db->get_where("iniConfig", array("region"=>"default"));
        foreach($q->result() as $r){
            if(! array_key_exists($r->section, $sections)){
                $sections[$r->section] = array();
            }
            $sections[$r->section][$r->item] = $r->content;
        }
        
        $q = $ci->db->get_where("iniConfig", array("region"=>$regionName));
        foreach($q->result() as $r){
            if(! array_key_exists($r->section, $sections)){
                $sections[$r->section] = array();
            }
            $sections[$r->section][$r->item] = $r->content;
        }
        
        die(json_encode(array('Success' => true, 'Region' => $sections)));
    }
}

?>
