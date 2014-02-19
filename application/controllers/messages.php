<?php if ( ! defined('BASEPATH')) exit('No direct script access allowed');

class Messages extends CI_Controller {
    
    public function index(){
        die(json_encode(array('Success' => false, 'Message' => "Access Denied")));
    }
    
    public function SaveMessage(){
        $data = file_get_contents('php://input');
        
        $toAgent = $this->pullXml($data, 'toAgentID');

        $this->db->insert("offlineMessages", array("uuid" => $toAgent, "message" => $data));
        $msg = $this->db->insert_id();
        if(!$msg){
            die('<?xml version="1.0" encoding="utf-8"?><boolean>false</boolean>');
        }
        die('<?xml version="1.0" encoding="utf-8"?><boolean>true</boolean>'); // Offline message stored.

    }
    
    public function RetrieveMessages(){
        $data = file_get_contents('php://input');

        $userID = $this->pullXml($data, 'Guid');
        
        $query = $this->db->get_where("offlineMessages", array("uuid" => $userID));
        echo '<?xml version="1.0" encoding="utf-8"?><ArrayOfGridInstantMessage xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema">';
        foreach($query->result() as $row){
            echo $row->message;
        }
        echo '</ArrayOfGridInstantMessage>';
        $this->db->delete("offlineMessages", array("uuid" => $userID));
        exit;
    }
    
    private function pullXml($content,$tagname) {
        preg_match( "/<$tagname>(.*)<\/$tagname>/", $content, $match );
        return $match[1];
    }
}

/* End of file messages.php */
/* Location: ./application/controllers/messages.php */
