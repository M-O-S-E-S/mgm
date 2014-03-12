<?php if ( ! defined('BASEPATH')) exit('No direct script access allowed');

class Map extends CI_Controller {
    
    public function index(){
        die(file_get_contents(FCPATH . 'html/map.html'));
    }
    
    public function tiles(){
        $this->config->load('mgm.php');
        $handle = opendir($this->config->item('mgm_pathToSimianMapsFolder'));
        $files = array();
        while(false !== ($entry = readdir($handle))){
            $pieces = explode(".", $entry);
            if(sizeof($pieces) < 2){
                continue;
            }
            if($pieces[1] == "png"){
                array_push($files, $entry);
            }
        }
        die(json_encode($files));
    }
    
    public function regions(){
        $regionList = array();
        $query = $this->db->get('regions');
        foreach($query->result() as $row){
            $r = array();
            $r['Name'] = $row->name;
            $r['x'] = $row->locX;
            $r['y'] = $row->locY;
            array_push($regionList, $r);
        }
        die(json_encode($regionList));
    }

}

/* End of file controller.php */
/* Location: ./application/controllers/controller.php */
