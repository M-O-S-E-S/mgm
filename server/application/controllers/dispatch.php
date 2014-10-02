<?php if ( ! defined('BASEPATH')) exit('No direct script access allowed');

class Dispatch extends CI_Controller {
    public function index(){
        die(json_encode(array('Success' => false, 'Message' => "Permission Denied")));
    }
    
    public function region($name){
        if(! $this->client->isHost()){
            die(json_encode(array('Success' => false, 'Message' => "Permission Denied")));
        }
        
        $this->regions->serveRegionConfig($name);
        //if previous line failed
        show_404();
    }
    
    public function process($name){
        if(! $this->client->isHost()){
            die(json_encode(array('Success' => false, 'Message' => "Permission Denied")));
        }
        
        $consoleUser = UUID::v4();
        $consolePass = UUID::v4();
        
        $httpPort = $this->input->get('httpPort');
        $consolePort = $this->input->get('consolePort');
        $externalAddress = $this->input->get('externalAddress');
        
        $this->db->where("name", $name);
        $this->db->update("regions",
            array(
                "httpPort"=>$httpPort,
                "consoleUname"=>$consoleUser,
                "consolePass"=>$consolePass,
                "consolePort"=>$consolePort,
                "externalAddress"=>$externalAddress)
        );

        $this->regions->serveOpensimConfig($name, $consoleUser, $consolePass, $consolePort, $httpPort);
        die(json_encode(array('Success' => false, 'Message' => "Unknown Error")));
    }
    
    public function node(){
        if(! $this->client->isHost()){
            die(json_encode(array('Success' => false, 'Message' => "Permission Denied")));
        }
        
        $host = $this->input->post('host');
        $port = $this->input->post('port');
        $key = $this->input->post('key');
        $slots = $this->input->post('slots');
        
        $this->db->where("address", $this->input->ip_address());
        $this->db->update("hosts",array("port"=>$port,"cmd_key"=>$key,"slots"=>$slots,"name"=>$host));
        
        $regions = array();
        $this->db->select('locY, uuid, name, locX, size');
        $q = $this->db->get_where("regions", array("slaveAddress"=>$this->input->ip_address()));
        foreach($q->result() as $r){
            array_push($regions, $r);
        }
        
        die(json_encode(array('Success' => true, 'Regions' => $regions)));
    }
    
    public function stats($host){
        if(! $this->client->isHost()){
            die(json_encode(array('Success' => false, 'Message' => "Permission Denied")));
        }
        
        log_message('debug',"Dispatch received stats from host $host");
                
        $ip = $this->input->ip_address();
        
        $stats = $this->input->post('json');
        $stats = json_decode($stats);
        
        $this->regions->hostStat($ip, json_encode($stats->host));
        //update hosts table with current stats
        $sql = 'UPDATE hosts SET status='.$this->db->escape(json_encode($stats->host)).' WHERE address="'.$ip.'"';
        $this->db->query($sql);
        
        $halted = 0;
        $running = 0;
        foreach($stats->processes as $proc){
            $q = $this->db->get_where("regions", array("name"=>$proc->name));
            if($q->num_rows() == 0){
                print $proc->name . " skipped";
                continue;
            }
            $this->db->where("name", $proc->name);
            if($proc->running == "True"){
                $this->db->update("regions", array("isRunning"=>1,"status"=>json_encode($proc->stats)));
                $running+=1;
            } else {
                $this->db->update("regions", array("isRunning"=>0));
                $halted+=1;
            }
            $this->regions->regionStat($proc->name, json_encode($proc->stats));
        }

        die("Stats recieved: $running running processes, and $halted halted processes");
    }
    
    public function logs($region){
        if(! $this->client->isHost()){
            die(json_encode(array('Success' => false, 'Message' => "Permission Denied")));
        }
        
        $logs = $this->input->post('log');
        if(!$logs){
            die(json_encode(array('Success' => false, 'Message' => "Missing log")));
        }
        
        //look up uuid from region name
        $q = $this->db->get_where("regions",array("name" => $region));
        if($q->num_rows() == 0){
            die(json_encode(array('Success' => false, 'Message' => "Invalid region")));
        }
        $r = $q->row();
        
        //pull out rows
        $logs = json_decode($logs);
        
        $this->regions->log($region, $logs);
    }
}

?>
