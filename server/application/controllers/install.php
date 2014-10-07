<?php if ( ! defined('BASEPATH')) exit('No direct script access allowed');

class Install extends CI_Controller {
    
    private function loadSqlFile($filename){
        $sql=file_get_contents($filename);
        foreach (explode(";", $sql) as $sql) 
        {
            $sql = trim($sql);
            if($sql) 
            {
                $this->db->query($sql);
            } 
        } 
    }
    
    private function checkDatabase(){
        $mysqlFiles = array(
            0 => '000-mgm.sql',
            1 => '001-mgm.sql'
        );
        $currentVersion = '1';

        if(! $this->db->table_exists("mgmDb")){
            //versioning table does not exist, this is either a hard-migration, or a fresh install
            if( $this->db->table_exists("regions") ){
                //old db, cannot migrate automatically
                die(json_encode(array('Success' => false, 'Installed' => false, 'Message' => 'Database too old to migrate...')));
            } else {
                //fresh install, execute scripts
                for($x = 0; $x <= $currentVersion; $x++){
                    $this->loadSqlFile(FCPATH.'files/'.$mysqlFiles[$x]);
                }
            }
        } else {
            $query = $this->db->query("SELECT * FROM mgmDb ORDER BY version");
            if($query->num_rows() == 0){
                //we are on a migration database, but the version has not been inserted
                die(json_encode(array('Success' => false, 'Installed' => false, 'Message' => 'Tables are present, but data is missing...')));
            } else {
                //we have a migratable database
                //for future migrations, we would check installed versions and update where necessary
                //but for expediency, I am skipping this for now
                $installedVersion = 0;
                foreach($query->result() as $row){
                    if($row->version > $installedVersion){
                        $installedVersion = $row->version;
                    }
                    for($x = $installedVersion+1; $x <= $currentVersion; $x++){
                        $this->loadSqlFile(FCPATH.'files/'.$mysqlFiles[$x]);
                    }
                }
            }
        }
    }
    
    public function index(){
        print "MGM";
    }
    
    public function test(){
        $this->checkDatabase();
        $users = $this->simiangrid->allUsers();
        if(count($users) > 0){
                die(json_encode(array('Success' => true, 'Installed' => true)));
        }
        die(json_encode(array('Success' => true, 'Installed' => false)));
    }
    
    public function submit(){
        $users = $this->simiangrid->allUsers();
        if(count($users) > 0){
                die(json_encode(array('Success' => false, 'Message' => 'Installation already Complete')));
        }

        $name = $this->input->post('name');
        if( $name == "" ){
                die(json_encode(array('Success'=>false,'Message'=>'User name cannot be blank')));
        }
        if( sizeof(explode(" ",$name)) != 2){
            die(json_encode(array('Success'=>false,'Message'=>'First and Last name please')));
        }
        
        $email = $this->input->post('email');
        if( $email == "" ){
            die(json_encode(array('Success'=>false,'Message'=>'Email cannot be blank')));
        }
        if( ! preg_match('/(.+)@(.+){2,}\.(.+){2,}/', $email ) ){
            die(json_encode(array('Success'=>false,'Message'=>'Invalid email entered')));
        }

        $password = $this->input->post('password');
        if( $password == "" ){
       	    die(json_encode(array('Success'=>false,'Message'=>'Password cannot be blank')));
        }

        $credential = '$1$'. md5($password);

        //create the initial user entry
        $avatarUUID = $this->simiangrid->createUserEntry($name, $email);
        if( ! $avatarUUID ){
                die(json_encode(array('Success'=>false,'Message'=>'an error Occurred.  Could not create Avatar')));
        }
        if( ! $this->simiangrid->createUserAvatar($avatarUUID) ){
                die(json_encode(array('Success'=>false,'Message'=>'an error Occurred')));
        }
        if( ! $this->simiangrid->setUserPassword($avatarUUID, $name, $password) ){
                die(json_encode(array('Success'=>false,'Message'=>'an error Occurred')));
        }
        $this->simiangrid->setAccessLevel($avatarUUID, 250);
	
        die(json_encode(array('Success'=>true)));
    }
    
}

?>
