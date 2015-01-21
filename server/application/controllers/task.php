<?php if ( ! defined('BASEPATH')) exit('No direct script access allowed');

class Task extends CI_Controller {
    
    public function index(){
        if(!$this->client->validate()){
            die(json_encode(array('Success' => false, 'Message' => "Access Denied")));
        }
        
        $uuid = $_SESSION['uuid'];
        session_write_close();
       
        $tasks = array();
        $query = $this->db->get_where("jobs", array("user" => $uuid));
        foreach($query->result() as $row){
            $task = array();
            $task['id'] = $row->id;
            $task['timestamp'] = $row->timestamp;
            $task['type'] = $row->type;
            $task['data'] = json_decode($row->data, true);
            //mask internal file locations
            if(isset($task['data']['File'])){
                unset($task['data']['File']);
            }
            array_push($tasks, $task);
        }
        die(json_encode(array('Success' => true, 'Tasks' => $tasks)));
    }
    
    public function delete($id){
        if(!$this->client->validate()){
            die(json_encode(array('Success' => false, 'Message' => "Access Denied")));
        }
        
        $query = $this->db->get_where("jobs", array("id" => $id));
        if($query->num_rows() == 0){
            die(json_encode(array('Success' => false, 'Message' => "Job not found")));
        }
        $job = $query->row();
        if($job->user != $_SESSION['uuid'] && $_SESSION['userLevel'] < 250){
            die(json_encode(array('Success' => false, 'Message' => "Permission Denied")));
        }
        
        switch($job->type){
            case "save_iar":
            case "load_iar":
            case "save_oar":
            case "load_oar":
                $data = json_decode($job->data, true);
                if(isset($data['File']) && file_exists($data['File'])){
                    unlink($data['File']);
                }
            break;
        }
        $this->db->delete("jobs", array("id" => $id));
        die(json_encode(array('Success' => true)));
    }
    
    public function saveIar(){
        if(!$this->client->validate()){
            die(json_encode(array('Success' => false, 'Message' => "Access Denied")));
        }
        $user = $_SESSION['uuid'];
        session_write_close();
        
        //look up avatar name
        $user = $this->simiangrid->getUserByID($user);
        if(! $user){
            die(json_encode(array('Success' => false, 'Message' => "Invalid user")));
        }
        
        $name = $user->Name;
        $input_data = json_decode(trim(file_get_contents('php://input')), true);
        $password = $input_data['password'];
        $path = "/";
        
        $job = array();
        $job['Status'] = "Pending...";
        
        $this->db->insert("jobs", array("type" => "save_iar", "user" => $user->UserID, "data" => json_encode($job)));
        $job = $this->db->insert_id();
        if(!$job){
            die(json_encode(array('Success' => false, 'Message' => "Could not create task ticket")));
        }
        
        //send command to appropriate region
        $query = $this->db->get_where("regions", array("name" => $this->config->item('mgm_hubRegion')));
        $region = $query->row();
        if(!$region){
            die(json_encode(array('Success' => false, 'Message' => "Error looking up hub region")));
        }
        $url = $this->regions->getSlave($region->uuid);

        $args = array(
            'name' => $region->name, 
            'avatarName' => $name,
            'avatarPassword' => $password,
            'inventoryPath' => $path,
            'job' => $job
        );
        $result = simple_curl($url . "/saveIar", $args);
        $result = json_decode($result);
        #if failed, update job
        if(!$result){
            $this->db->delete("jobs", array("id" => $job));
            die(json_encode(array('Success' => false, 'Message' => "Error contacting Host")));
        }
                        
        if(!$result->Success){
            $this->db->where('id', $job);
            $this->db->update('jobs', array('data' => json_encode($result)));
            die(json_encode($result));
        }
        
        die(json_encode(array('Success' => true, 'ID' => $job)));
    }
    
    public function loadIAR(){
        if(!$this->client->validate()){
            die(json_encode(array('Success' => false, 'Message' => "Access Denied")));
        }
        $user = $_SESSION['uuid'];
        
        //look up avatar name
        $user = $this->simiangrid->getUserByID($user);
        if(! $user){
            die(json_encode(array('Success' => false, 'Message' => "Invalid user")));
        }
        
        $name = $user->Name;
        $input_data = json_decode(trim(file_get_contents('php://input')), true);
        $password = $input_data['password'];
        $path = "/";
        
        $job = array();
        $job['Status'] = "Pending...";
        $job['Name'] = $name;
        $job['Path'] = $path;
        
        $_SESSION['password'] = $password;
        session_write_close();
        
        $this->db->insert("jobs", array("type" => "load_iar", "user" => $user->UserID, "data" => json_encode($job)));
        $job = $this->db->insert_id();
        if($job){
            die(json_encode(array('Success' => true, 'ID' => $job)));
        }
        die(json_encode(array('Success' => false, 'Message' => "Could not create task ticket")));
    }
    
    public function nukeContent($region){
        if(!$this->client->validate()){
            die(json_encode(array('Success' => false, 'Message' => "Access Denied")));
        }
        $uuid = $_SESSION['uuid'];
        $level = $_SESSION['userLevel'];
        session_write_close();
        
        #test user permissions over this region
        if( $level < 250 && !$this->regions->isOwner($uuid, $region) && ! $this->regions->isManager($uuid,$region)){
            die(json_encode(array('Success' => false, 'Message' => "Permission Denied")));
        }
        
        $this->db->insert("jobs", array("type" => "nuke_content", "user" => $uuid, "data" => json_encode(array('Status' => "Pending...", "Region" => $region))));
        $job = $this->db->insert_id();
        if($job){
            $query = $this->db->get_where("regions", array("uuid" => $region));
            $r = $query->row();
            $url = $this->regions->getSlave($region);

            $args = array(
                'name' => $r->name, 
                //'uname' => $r->consoleUname, 
                //'password' => $r->consolePass,
                'job' => $job,
                'merge' => 0,
                'x' => 0,
                'y' => 0,
                'z' => 0
            );
            $result = simple_curl($url . "loadOar", $args);
            $result = json_decode($result);
            #if failed, update job
            if(!$result){
                $this->db->delete("jobs", array("id" => $job));
                die(json_encode(array('Success' => false, 'Message' => "Error contacting Host")));
            }
            die(json_encode(array('Success' => true, 'ID' => $job)));
        }
        die(json_encode(array('Success' => false, 'Message' => "Could not create task ticket")));
    }
    
    public function loadOar($region){
        if(!$this->client->validate()){
            die(json_encode(array('Success' => false, 'Message' => "Access Denied")));
        }
        $uuid = $_SESSION['uuid'];
        $level = $_SESSION['userLevel'];
        session_write_close();
        
        #validate input

        $input_data = json_decode(trim(file_get_contents('php://input')), true);
        if( ! isset($input_data['merge']) ){
			die(json_encode(array('Success' => false, 'Message' => "merge argument is required")));
		}
        $merge = $input_data['merge'] ? 1 : 0;
        if( ! isset($input_data['x']) || ! is_numeric($input_data['x']) || $input_data['x'] < 0){
			die(json_encode(array('Success' => false, 'Message' => "invalid x offset")));
		}
        $x = $input_data['x'];
        if( ! isset($input_data['y']) || ! is_numeric($input_data['y']) || $input_data['y'] < 0){
			die(json_encode(array('Success' => false, 'Message' => "invalid y offset")));
		}
        $y = $input_data['y'];
        if( ! isset($input_data['z']) || ! is_numeric($input_data['z']) || $input_data['z'] < 0){
			die(json_encode(array('Success' => false, 'Message' => "invalid z offset")));
		}
        $z = $input_data['z'];

        #test user permissions over this region
        if( $level < 250 && !$this->regions->isOwner($uuid, $region) && ! $this->regions->isManager($uuid,$region)){
            die(json_encode(array('Success' => false, 'Message' => "Permission Denied")));
        }
        $data = array();
        $data['Status'] = "Pending...";
        $data['Region'] = $region;
        $data['merge'] = $merge;
        $data['x'] = $x;
        $data['y'] = $y;
        $data['z'] = $z;
             
        $this->db->insert("jobs", array("type" => "load_oar", "user" => $uuid, "data" => json_encode($data)));
        $job = $this->db->insert_id();
        if($job){
            die(json_encode(array('Success' => true, 'ID' => $job)));
        }
        die(json_encode(array('Success' => false, 'Message' => "Could not create task ticket")));
    }
    
    public function saveOar($region){
        if(!$this->client->validate()){
            die(json_encode(array('Success' => false, 'Message' => "Access Denied")));
        }
        $uuid = $_SESSION['uuid'];
        $level = $_SESSION['userLevel'];
        session_write_close();

        #test user permissions over this region
        if( $level < 250 && !$this->regions->isOwner($uuid, $region) && ! $this->regions->isManager($uuid,$region)){
            die(json_encode(array('Success' => false, 'Message' => "Permission Denied")));
        }
        $this->regions->saveOar($uuid, $region);
        die(json_encode(array('Success' => false, 'Message' => "Unknown Error")));
    }
    
    public function resetCode(){
        $input_data = json_decode(trim(file_get_contents('php://input')), true);
        $email = $input_data['email'];
        $user = $this->simiangrid->getUserByEmail($email);
        if($user){
            // do not reset password for suspended accounts
            $identities = $this->simiangrid->getIdentities($user->UserID);
            $enabled = false;
            foreach($identities as $i){
                if($i->Enabled){
                    $enabled = true;
                }
            }
            if(!$enabled){
                die(json_encode(array('Success' => false, 'Message' => "Your account does not have active credentials")));
            }
            // initiate password reset
            $token = md5(json_encode($user) . time());
            $this->db->insert("jobs", array("type" => "password_reset", "user" => $user->UserID, "data" => md5($token)));
            sendPasswordReset($user->Email, $token);
            die(json_encode(array('Success' => true)));
        }
        die(json_encode(array('Success' => false, 'Message' => "This accound is invalid")));
    }
    
    public function resetPassword(){
        $input_data = json_decode(trim(file_get_contents('php://input')), true);
        $name = $input_data['name'];
        $password = $input_data['password'];
        $token = $input_data['token'];
        $user = $this->simiangrid->getUserByName($name);
        $pass = md5($token);
        
        if( !$password || $password == ""){
            die(json_encode(array('Success' => false, 'Message' => "Invalid Password")));
        }

        //expire old password reset jobs, this should be moved to a recurring task somewhere
        //$this->db->delete("jobs", array("type" => "password_reset", "timestamp <" => "NOW() - INTERVAL 2 DAY"));
        $this->db->query('select * from jobs where type="password_reset" and timestamp < NOW() - INTERVAL 2 DAY');
        
        //look up unexpired jobs
        $query = $this->db->get_where("jobs", array("type" => "password_reset", "user" => $user->UserID));
        foreach($query->result() as $row){
            if($pass == $row->data){
                if($this->simiangrid->setUserPassword($user->UserID, $user->Name, $password)){
                    $this->db->delete("jobs", array("id" => $row->id));
                    die(json_encode(array('Success' => true)));
                }
                die(json_encode(array('Success' => false, 'Message' => "An Error Occurred")));
            }
        }
        die(json_encode(array('Success' => false, 'Message' => "Invalid Account or Token")));
    }
    
    public function upload($id){
        $query = $this->db->get_where("jobs", array("id" => $id));
        if($query->num_rows() == 0){
            die(json_encode(array('Success' => false, 'Message' => "Job not found")));
        }
        $job = $query->row();
        switch($job->type){
            case "save_oar":
                if(!$this->client->isHost()){
                    die(json_encode(array('Success' => false, 'Message' => "Access Denied")));
                }
                if ($_FILES["file"]["error"] > 0){
                    die(json_encode(array('Success' => false, 'Message' => $_FILES["file"]["error"])));
                }

                $fileName = $_FILES["file"]["name"] . "-" . date("y.m.d") . ".oar";
                $archivePath = osJoin($this->config->item('mgm_uploadDownloadStorageArea'), UUID::v4());
                move_uploaded_file($_FILES["file"]["tmp_name"],$archivePath);

                $data = json_decode($job->data);
                $data->Status = "Done";
                $data->File = $archivePath;
                $data->FileName = $fileName;
            
                if($_FILES['fileupload']['error'] === UPLOAD_ERR_INI_SIZE) {
                    $data->Status = "Completed file not found, is it too big for your php upload settings?";
                }
            
                $this->db->where('id', $job->id);
                $this->db->update('jobs', array('data' => json_encode($data)));

                $owner = $this->simiangrid->getUserByID($job->user);
                sendSaveOarCompleteEmail($owner->Email, $fileName);
                die(json_encode(array('Success' => true)));
            case "save_iar":
                if(!$this->client->isHost()){
                    die(json_encode(array('Success' => false, 'Message' => "Access Denied")));
                }
                if ($_FILES["file"]["error"] > 0){
                    die(json_encode(array('Success' => false, 'Message' => $_FILES["file"]["error"])));
                }

                $fileName = $_FILES["file"]["name"] . "-" . date("y.m.d") . ".iar";
                $archivePath = osJoin($this->config->item('mgm_uploadDownloadStorageArea'), UUID::v4());
                move_uploaded_file($_FILES["file"]["tmp_name"],$archivePath);
    
                $this->db->where('id', $job->id);
                $this->db->update('jobs', array('data' => json_encode(array("Status" => "Done", "File" => $archivePath, "FileName" => $fileName))));

                $owner = $this->simiangrid->getUserByID($job->user);
                sendSaveIarCompleteEmail($owner->Email, $fileName);
                die(json_encode(array('Success' => true)));
            case "load_iar":
                if(!$this->client->validate()){
                    die(json_encode(array('Success' => false, 'Message' => "Access Denied")));
                }
                $data = json_decode($job->data);
                
                if(! isset($_FILES["file"])){
                    $data->Status = "Error uploading iar file";
                    $this->db->where('id', $job->id);
                    $this->db->update('jobs', array('data' => json_encode($data)));
                    die(json_encode(array('Success' => false, 'Message' => "No File Present")));
                }
                if ($_FILES["file"]["error"] > 0){
                    $data->Status = "Error uploading iar file";
                    $this->db->where('id', $job->id);
                    $this->db->update('jobs', array('data' => json_encode($data)));
                    die(json_encode(array('Success' => false, 'Message' => $_FILES["file"]["error"])));
                }
                $fileName = $_FILES["file"]["name"] . "-" . date("y.m.d") . ".iar";
                $archivePath = osJoin($this->config->item('mgm_uploadDownloadStorageArea'), UUID::v4());
                move_uploaded_file($_FILES["file"]["tmp_name"],$archivePath);
                
                $avatarName = $data->Name;
                $avatarPassword = $_SESSION['password'];
                $inventoryPath = $data->Path;
                session_write_close();
                
                $data->Status = "Loading";
                $data->File = $archivePath;
                $data->Name = $fileName;
                
                $this->db->where('id', $job->id);
                $this->db->update('jobs', array('data' => json_encode($data)));
                
                //send command to appropriate region
                $query = $this->db->get_where("regions", array("name" => $this->config->item('mgm_hubRegion')));
                $region = $query->row();
                $url = $this->regions->getSlave($region->uuid);

                $args = array(
                    'name' => $region->name, 
                    //'uname' => $region->consoleUname, 
                    //'password' => $region->consolePass,
                    'avatarName' => $avatarName,
                    'avatarPassword' => $avatarPassword,
                    'inventoryPath' => $inventoryPath,
                    'job' => $job->id
                );
                $result = simple_curl($url . "loadIar", $args);
                $result = json_decode($result);
                #if failed, update job
                if(!$result){
                    unlink($archivePath);
                    $this->db->delete("jobs", array("id" => $job->id));
                    die(json_encode(array('Success' => false, 'Message' => "Error contacting Host")));
                }
                    
                if(!$result->Success){
                    unlink($archivePath);
                    $this->db->where('id', $job->id);
                    $this->db->update('jobs', array('data' => json_encode(array("Status" => $result->Message))));
                    die(json_encode($result));
                }

                $this->db->where('id', $job->id);
                $this->db->update('jobs', array('data' => json_encode(array("Status" => "Loading", "File" => $archivePath, "Name" => $fileName))));

                die(json_encode(array('Success' => true)));
            case "load_oar":
                if(!$this->client->validate()){
                    die(json_encode(array('Success' => false, 'Message' => "Access Denied")));
                }
                if(! isset($_FILES["file"])){
                    die(json_encode(array('Success' => false, 'Message' => "No File Present")));
                }
                if ($_FILES["file"]["error"] > 0){
                    die(json_encode(array('Success' => false, 'Message' => $_FILES["file"]["error"])));
                }
                $fileName = $_FILES["file"]["name"];
                $archivePath = osJoin($this->config->item('mgm_uploadDownloadStorageArea'), UUID::v4());
                move_uploaded_file($_FILES["file"]["tmp_name"],$archivePath);
                
                $data = json_decode($job->data);
                $data->Status = "Loading";
                $data->File = $archivePath;
                $data->Name = $fileName;
                
                $this->db->where('id', $job->id);
                $this->db->update('jobs', array('data' => json_encode($data)));

                $query = $this->db->get_where("regions", array("uuid" => $data->Region));
                $region = $query->row();
                $url = $this->regions->getSlave($data->Region);

                $args = array(
                    'name' => $region->name, 
                    //'uname' => $region->consoleUname, 
                    //'password' => $region->consolePass,
                    'job' => $job->id,
                    'merge' => $data->merge,
                    'x' => $data->x,
                    'y' => $data->y,
                    'z' => $data->z
                );
                $result = simple_curl($url . "loadOar", $args);
                $result = json_decode($result);
                #if failed, update job
                if(!$result){
                    unlink($archivePath);
                    $this->db->delete("jobs", array("id" => $job->id));
                    die(json_encode(array('Success' => false, 'Message' => "Error contacting Host")));
                }
                    
                if(!$result->Success){
                    unlink($archivePath);
                    $this->db->where('id', $job->id);
                    $this->db->update('jobs', array('data' => json_encode(array("Status" => $result->Message, "Region" => $data->Region))));
                    die(json_encode($result));
                }
            
                $data = json_decode($job->data);
                $data->Status = "Loading";
                $data->File = $archivePath;
                $data->FileName = $fileName;

                $this->db->where('id', $job->id);
                $this->db->update('jobs', array('data' => json_encode($data)));

                die(json_encode(array('Success' => true)));
        }
        die(json_encode(array('Success' => false, 'Message' => "Unknown Error")));
    }

    public function ready($id){
        $query = $this->db->get_where("jobs", array("id" => $id));
        if($query->num_rows() == 0){
            die(json_encode(array('Success' => false, 'Message' => "Job not found")));
        }
        $job = $query->row();
        switch($job->type){
            case "save_oar":
            case "save_iar":
                //save functions are downloaded by clients
                if(!$this->client->validate()){
                    die(json_encode(array('Success' => false, 'Message' => "Access Denied")));
                }
                session_write_close();
                $data = json_decode($job->data, true);
                if(isset($data["File"]) && file_exists($data["File"])){
                    serveFile($data["File"], $data["FileName"]);
                } else {
                    header("HTTP/1.0 404 Not Found");
                    die();
                }
                break;
            case "load_oar":
            case "load_iar":
                //load functions are downloaded by hosts
                if(!$this->client->isHost()){
                    die(json_encode(array('Success' => false, 'Message' => "Access Denied")));
                }
                $data = json_decode($job->data, true);
                if(isset($data["File"]) && file_exists($data["File"])){
                    serveFile($data["File"], "region.oar");
                }  else {
                    header("HTTP/1.0 404 Not Found");
                    die();
                }
                break;
            case "nuke_content":
                if(!$this->client->isHost()){
                    die(json_encode(array('Success' => false, 'Message' => "Access Denied")));
                }
                serveFile(FCPATH . 'files/default.oar', "default.oar");
        }
        die(json_encode(array('Success' => false, 'Message' => "Unknown Error")));
    }
    
    public function report($id){
        $query = $this->db->get_where("jobs", array("id" => $id));
        if($query->num_rows() == 0){
            die(json_encode(array('Success' => false, 'Message' => "Job not found")));
        }
        $job = $query->row();
        switch($job->type){
            case "save_oar":
                if(!$this->client->isHost()){
                    die(json_encode(array('Success' => false, 'Message' => "Access Denied")));
                }
                $data = json_decode($job->data);
                if($this->input->post('Success')){
                    $data->Status = "Done";
                    $this->db->where('id', $job->id);
                    $this->db->update('jobs', array('data' => json_encode($data)));
                } else {
                    $data->Status = $this->input->post('Message');
                    $this->db->where('id', $job->id);
                    $this->db->update('jobs', array('data' => json_encode($data)));
                }
                die(json_encode(array('Success' => true)));
            case "save_iar":
                if(!$this->client->isHost()){
                    die(json_encode(array('Success' => false, 'Message' => "Access Denied")));
                }
                if($this->input->post('Success')){
                    $this->db->where('id', $job->id);
                    $this->db->update('jobs', array('data' => json_encode(array("Status" => "Done"))));
                } else {
                    $this->db->where('id', $job->id);
                    $this->db->update('jobs', array('data' => json_encode(array("Status" => $this->input->post('Message')))));
                }
                die(json_encode(array('Success' => true)));
            case "load_iar":
                if(!$this->client->isHost()){
                    die(json_encode(array('Success' => false, 'Message' => "Access Denied")));
                }
                if($this->input->post('Success')){
                    $this->db->where('id', $job->id);
                    $this->db->update('jobs', array('data' => json_encode(array("Status" => "Done"))));
                } else {
                    $this->db->where('id', $job->id);
                    $this->db->update('jobs', array('data' => json_encode(array("Status" => $this->input->post('Message')))));
                }
                die(json_encode(array('Success' => true)));
            case "load_oar":
                if(!$this->client->isHost()){
                    die(json_encode(array('Success' => false, 'Message' => "Access Denied")));
                }
                $data = json_decode($job->data);
                if(isset($data->File) && file_exists($data->File)){
                    unlink($data->File);
                }
                if($this->input->post('Success')){
                    $data->Status = "Done";
                    $this->db->where('id', $job->id);
                    $this->db->update('jobs', array('data' => json_encode($data)));
                } else {
                    $data->Status = $this->input->post('Message');
                    $this->db->where('id', $job->id);
                    $this->db->update('jobs', array('data' => json_encode($data)));
                }
                die(json_encode(array('Success' => true)));
            case "nuke_content":
                if(!$this->client->isHost()){
                    die(json_encode(array('Success' => false, 'Message' => "Access Denied")));
                }
                $data = json_decode($job->data, true);
                if($this->input->post('Success')){
                    $this->db->where('id', $job->id);
                    $this->db->update('jobs', array('data' => json_encode(array("Status" => "Done", "Region" => $data['Region']))));
                } else {
                    $this->db->where('id', $job->id);
                    $this->db->update('jobs', array('data' => json_encode(array("Status" => $this->input->post('Message'), "Region" => $data['Region']))));
                }
            default:
                die(json_encode(array('Success' => false, 'Message' => "Not Implemented, type: " . $job->type)));
        }
        die(json_encode(array('Success' => false, 'Message' => "Invalid Job")));
    }
}

?>
