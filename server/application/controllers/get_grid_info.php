<?php if ( ! defined('BASEPATH')) exit('No direct script access allowed');

class Get_Grid_Info extends CI_Controller {
    public function index(){
        $ip = $this->config->item('gridInfo_publicIP');
        $name = $this->config->item('gridInfo_gridName');
        $nick = $this->config->item('gridInfo_gridNick');
		$xml = new SimpleXMLElement('<gridinfo></gridinfo>');
		$xml->addChild('login', "http://$ip/GridLogin/");
		$xml->addChild('register', "http://$ip/");
		$xml->addChild('welcome', "http://$ip/welcome.html");
		$xml->addChild('password', "http://$ip/");
		$xml->addChild('gridname', "$name");
		$xml->addChild('gridnick', "$nick");
		$xml->addChild('about', "http://$ip/");
		$xml->addChild('economy', "http://$ip/");
        header("Content-type:application/xml");
        //header("Content-type:application/llsd+xml");
        die($xml->saveXML());
    }
}

?>
