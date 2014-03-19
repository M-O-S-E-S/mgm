<?php if ( ! defined('BASEPATH')) exit('No direct script access allowed');

class Consoles {

    function open($regionUUID){
        $db = &get_instance()->db;
        
        $q = $db->get_where("regions", array("uuid" => $regionUUID));
        if($q->num_rows() == 0){
            die(json_encode(array('Success' => false, 'Message' => "Invalid Region")));
        }
        $r = $q->row();
        $consoleUrl = "http://" . $r->slaveAddress . ":" . $r->consolePort;
        
        $url = $consoleUrl . "/StartSession/";
        $params = array('USER' => $r->consoleUname, 'PASS' => $r->consolePass);
        $result = simple_curl($url, $params);
        if($result == ""){
            return NULL;
        }
        
        $doc = new DOMDocument();
        $doc->loadXML($result);
        
        $session = array();
        $session['url'] = $consoleUrl;
        $session['sessionID'] = $doc->getElementsByTagName('SessionID')->item(0)->nodeValue;
        $session['prompt'] = $doc->getElementsByTagName('Prompt')->item(0)->nodeValue;
        return $session;
    }
    
    function close($session){
        if( !isset($session['url']) || !isset($session['sessionID'])){
            return;
        }
        $url = $session['url'] . "/CloseSession/";
        $params = array(
            'ID' => $session['sessionID'],
        );
        simple_curl($url, $params);
    }
    
    function read($session){
        $lines = array();
        if( !isset($session['url']) || !isset($session['sessionID'])){
            return $lines;
        }
        
        //read from console
        $url = $session['url'] . "/ReadResponses/" . $session['sessionID'] . "/";
        $result = simple_curl($url);
        if(strlen($result) == 0){
            die(json_encode(array('Success' => true, 'Lines' => $lines)));
        }
        $doc = new DOMDocument();
        $doc->loadXML($result);
        foreach($doc->getElementsByTagName("Line") as $number => $line){
            array_push($lines, htmlentities  ($line->nodeValue));
        }
        return $lines;
    }
    
    function write($session, $command){
        if( !isset($session['url']) || !isset($session['sessionID'])){
            return;
        }
        
        $url = $session['url'] . "/SessionCommand/";
        $params = array(
            'ID' => $session['sessionID'],
            'COMMAND' => $command
        );
        simple_curl($url, $params);
    }
}
