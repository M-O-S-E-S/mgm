<?php if ( ! defined('BASEPATH')) exit('No direct script access allowed');

class Console extends CI_Controller {
    public function index(){
    }
    
    public function open($region){
        if(!$this->client->validate()){
            die(json_encode(array('Success' => false, 'Message' => "Access Denied")));
        }
        
        $uuid = $_SESSION['uuid'];
        if(! $this->regions->isOwner($uuid, $region) && ! $this->regions->isManager($uuid, $region) && $_SESSION['userLevel'] < 250){
            die(json_encode(array('Success' => false, 'Message' => "Permission Denied")));
        }
        
        $cons = $this->consoles->open($region);
        if($cons == NULL){
            die(json_encode(array('Success' => false, 'Message' => "null response from region")));
        }
       
        $_SESSION['console'] = $cons;
        
        die(json_encode(array('Success' => true, 'Prompt' => $cons['prompt'])));
    }
    
    public function close($region){
        if(!$this->client->validate()){
            die(json_encode(array('Success' => false, 'Message' => "Access Denied")));
        }
        
        if(! isset($_SESSION['console']) ){
            die(json_encode(array('Success' => true)));
        }
        $session = $_SESSION['console'];
        unset($_SESSION['console']);
        session_write_close();
                
        $this->consoles->close($session);
        die(json_encode(array('Success' => true)));
    }
    
    public function read($region){
        if(!$this->client->validate()){
            die(json_encode(array('Success' => false, 'Message' => "Access Denied")));
        }
        
        if(! isset($_SESSION['console']) ){
            die(json_encode(array('Success' => false, 'Message' => "No Active Console")));
        }
        
        $session = $_SESSION['console'];
        session_write_close();
        
        $lines = $this->consoles->read($session);
        
        die(json_encode(array('Success' => true, 'Lines' => $lines)));
    }
    
    public function write($region){
        if(!$this->client->validate()){
            die(json_encode(array('Success' => false, 'Message' => "Access Denied")));
        }
        
        if(! isset($_SESSION['console']) ){
            die(json_encode(array('Success' => false, 'Message' => "No Active Console")));
        }
        
        $session = $_SESSION['console'];
        session_write_close();
        
        $input_data = json_decode(trim(file_get_contents('php://input')), true);
        $command = $input_data['command'];
        
        $this->consoles->write($session, $command);
        
        die(json_encode(array('Success' => true)));
    }
}

?>
