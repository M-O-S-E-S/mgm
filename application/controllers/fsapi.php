<?php if ( ! defined('BASEPATH')) exit('No direct script access allowed');

class Fsapi extends CI_Controller {
    
    public function index(){
        $section = $this->input->post('section');
        if($section){
            switch($section){
                case 'directory':
                    $this->freeswitch->directoryRequest();
                    break;
                case 'dialplan':
                    $this->freeswitch->dialplanRequest();
                    break;
                default:
                    die("section switch default action");
            }
            die("An unknown error occurred");
        }
        $this->freeswitch->getConfig();
        die("An unknown error occurred");
    }

    public function region_config(){
        $this->freeswitch->getConfig();
        die("An unknown error occurred");
    }
    
    public function freeswitch_config(){
        $section = $this->input->post('section');
        if($section){
            switch($section){
                case 'directory':
                    $this->freeswitch->directoryRequest();
                    break;
                case 'dialplan':
                    $this->freeswitch->dialplanRequest();
                    break;
                default:
                    die("section switch default action");
            }
            die("An unknown error occurred");
        }
        $this->freeswitch->getConfig();
        die("An unknown error occurred");
    }
}
