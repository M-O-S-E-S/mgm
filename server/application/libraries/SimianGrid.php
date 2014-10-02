<?php if ( ! defined('BASEPATH')) exit('No direct script access allowed');

class SimianGrid
{
    function SimianGrid(){
        $this->grid_service = &get_instance()->config->item('simian_gridUrl');
        $this->user_service = $this->grid_service;
        $this->asset_service = $this->grid_service . "/&id=";
        $this->hypergrid_service = $this->grid_service;

    }
   
    function isEmailRegistered($email){
		$query = array(
			'RequestMethod' => 'GetUser', 
			'Email' => $email);
		$response = json_curl($this->user_service, $query);
		if( isset($response->Success) ){
			return true;
		}
		return false;
    }
 
    function authenticate($identifier, $credential){
		$query = array(
			'RequestMethod' => 'AuthorizeIdentity', 
			'Identifier' => $identifier,
			'Credential' => '$1$' . md5($credential),
			'Type' => 'md5hash');
		$response = json_curl($this->user_service, $query);
		if( isset($response->Success) )
			return $response->UserID;
		return false;
    }
    
    function getUserByEmail($email){
		$query = array('RequestMethod' => 'GetUser', 'Email' => $email);
		$response = json_curl($this->user_service, $query);
		if( isset($response->Success)){
			return $response->User;
        }
		return false;
    }
	
    function getUserByName($name){
		$query = array('RequestMethod' => 'GetUser', 'Name' => $name);
		$response = json_curl($this->user_service, $query);
		if( isset($response->Success)){
			return $response->User;
        }
		return false;
    }
	
    function getUserByID($uuid){
		$query = array('RequestMethod' => 'GetUser', 'UserID' => $uuid);
		$response = json_curl($this->user_service, $query);
		if(isset($response->Success))
			return $response->User;
		return false;
    }
	
    function createUserEntry($username, $email, $accessLevel=0){
		$uuid = $this->gen_uuid();
		$query = array('RequestMethod' => 'AddUser','UserID' => $uuid,'Name' => $username,'Email' => $email, 'AccessLevel' => $accessLevel);
        	$response = json_curl($this->grid_service, $query);
        	if($response->Success)
			return $uuid;
		return false;
    }
	
    function createUserAvatar($uuid, $templateAvatar="DefaultAvatar"){
        $query = array('RequestMethod' => 'AddInventory', 'OwnerID' => $uuid, 'AvatarType' => $templateAvatar);
		$response = json_curl($this->user_service, $query);
		if($response->Success)
			return true;
		return false;
    }
    
    function enableIdentity($identity){
        $query = array('RequestMethod' => 'AddIdentity',
						'Identifier' => $identity->Identifier,
						'Type' => $identity->Type,
						'Credential' => $identity->Credential,
						'UserID' => $identity->UserID,
                        'Enabled' => True);
        $md5result = json_curl($this->user_service, $query);
		if ( ! $md5result->Success ) {
			log_message('error', "SG_Auth Unable to set md5hash for " . $identity->Identifier);
		}
		return $md5result->Success;
    }
    
    function disableIdentity($identity){
        $query = array('RequestMethod' => 'AddIdentity',
						'Identifier' => $identity->Identifier,
						'Type' => $identity->Type,
						'Credential' => $identity->Credential,
						'UserID' => $identity->UserID,
                        'Enabled' => False);
        $md5result = json_curl($this->user_service, $query);
		if ( ! $md5result->Success ) {
			log_message('error', "SG_Auth Unable to set md5hash for " . $identity->Identifier);
		}
		return $md5result->Success;
    }
	
    function insertUserPassword($uuid, $identifier, $credential){
		$query = array('RequestMethod' => 'AddIdentity',
						'Identifier' => $identifier,
						'Type' => 'md5hash',
						'Credential' => $credential,
						'UserID' => $uuid);
		$md5result = json_curl($this->user_service, $query);
		if ( ! $md5result->Success ) {
			log_message('error', "SG_Auth Unable to set md5hash for $user_id");
		}
		return $md5result->Success;
	}
    function setUserPassword($uuid, $identifier, $credential){
		$query = array('RequestMethod' => 'AddIdentity',
						'Identifier' => $identifier,
						'Type' => 'md5hash',
						'Credential' => '$1$'. md5($credential),
						'UserID' => $uuid);
		$md5result = json_curl($this->user_service, $query);
		
		if ( ! $md5result->Success ) {
			log_message('error', "SG_Auth Unable to set md5hash for $user_id");
		}
		return $md5result->Success;
    }
	
    function allUsers(){
		$query = array('RequestMethod' => 'GetUsers','NameQuery' => '');
		$result = json_curl($this->user_service, $query);
		if( isset($result->Success) && $result->Success ){
			return $result->Users;
		} else {
			log_message('error',"Unknown response to GetUsers. Returning 0.");
			return false;
		}
    }
    
    function getIdentities($userId){
        $query = array('RequestMethod' => 'GetIdentities','UserID' => $userId);
        $result = json_curl($this->user_service, $query);
        if( isset($result->Success) && $result->Success ){
			return $result->Identities;
		} else {
			log_message('error',"Unknown response to GetIdentities. Returning 0.");
			return false;
		}
    }
	
    function removeUser($uuid){
		$query = array(
			'RequestMethod' => 'RemoveUser',
            		'UserID' => $uuid
        	);
        	$response = json_curl($this->user_service, $query);
        	if ($response->Success) {
        		return true;
        	} else {
        		return false;
        	}
    }
	
    function setUserLastLocation( $uuid, $uri){
		$query = array(
			'RequestMethod' => 'AddUserData',
            		'UserID' => $uuid,
            		'LastLocation' => $uri
        	);
        	$response = json_curl($this->user_service, $query);
        	if ($response->Success) {
        		return true;
        	} else {
			echo "error setting last location: " . $response->Message;
        		return false;
        	}
    }
	
    function setUserHome( $uuid, $uri){
		$query = array(
			'RequestMethod' => 'AddUserData',
            		'UserID' => $uuid,
            		'HomeLocation' => $uri
        	);
        	$response = json_curl($this->user_service, $query);
        	if ($response->Success) {
        		return true;
        	} else {
			echo "error setting home: " . $response->Message;
        		return false;
        	}
    }
	
    function setAccessLevel($uuid, $level){
		$user_data = $this->getUserByID($uuid);
        	$query = array('RequestMethod' => 'AddUser',
            		'UserID' => $user_data->UserID,
            		'Email' => $user_data->Email,
            		'Name' => $user_data->Name,
            		'AccessLevel' => $level
        	);
        	$response = json_curl($this->user_service, $query);
        	if ($response->Success) {
            		return true;
        	} else {
            		return false;
        	}
    }
	
    function updateUserData($uuid, $name, $email, $accessLevel){
        $query = array('RequestMethod' => 'AddUser',
            'UserID' => $uuid,
            'Name' => $name,
            'Email' => $email,
            'AccessLevel' => $accessLevel
        );
        $response = json_curl($this->user_service, $query);
        if ( isset($response->Success)) {
            return true;
        } else {
            log_message('error', 'updateUserData: ' . $response->Message);
            return false;
        }
    }
	
    function gen_uuid() {
        return sprintf( '%04x%04x-%04x-%04x-%04x-%04x%04x%04x',mt_rand( 0, 0xffff ), mt_rand( 0, 0xffff ),mt_rand( 0, 0xffff ),mt_rand( 0, 0x0fff ) | 0x4000,mt_rand( 0, 0x3fff ) | 0x8000,mt_rand( 0, 0xffff ), mt_rand( 0, 0xffff ), mt_rand( 0, 0xffff ));
    }
}

?>
