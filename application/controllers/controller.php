<?php if ( ! defined('BASEPATH')) exit('No direct script access allowed');

class Controller extends CI_Controller {
    
    public function index(){
        die(file_get_contents(FCPATH . 'html/index.html'));
    }
}

/* End of file controller.php */
/* Location: ./application/controllers/controller.php */
