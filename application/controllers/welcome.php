<?php if ( ! defined('BASEPATH')) exit('No direct script access allowed');

class Welcome extends CI_Controller {
    public function index(){
        die(file_get_contents(FCPATH . 'html/welcome.html'));
    }
}

?>
