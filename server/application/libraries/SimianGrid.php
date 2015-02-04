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
	
    function getUsers(){
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
    
    function getGroups(){
        $query = array('RequestMethod' => 'GetGenerics', 'Type'=>'Group');
        $result = json_curl($this->user_service, $query);
        if( isset($result->Success) && $result->Success ){
            $groups = array();
            foreach($result->Entries as $row){
                $group = json_decode($row->Value);
                //the type Group is not only group definitions, but also active groups.  Filter those out
                if(!isset($group->FounderID))
                    continue;
                $group->uuid = $row->OwnerID;
                $group->name = $row->Key;
                array_push($groups, $group);
            }
			return $groups;
		} else {
			log_message('error',"Unknown response to GetGroups. Returning 0.");
			return false;
		}
    }
    
    function getGroupByID($groupID){
        $query = array('RequestMethod' => 'GetGenerics', 'Type' =>'Group', 'OwnerID' => $groupID);
        $result = json_curl($this->user_service, $query);
        if( isset($result->Success) && $result->Success ){
			return $result->Entries[0];
		} else {
			log_message('error',"Unknown response to GetGroups. Returning 0.");
			return false;
		}
    }
    
    function getGroupMembers($groupID){
        $query = array('RequestMethod' => 'GetGenerics', 'Type' =>'GroupMember', 'Key' => $groupID);
        $result = json_curl($this->user_service, $query);
        if( isset($result->Success) && $result->Success ){
			return $result->Entries;
		} else {
			log_message('error',"Unknown response to GetGroups. Returning 0.");
			return false;
		}
    }
    
    function getGroupRoles($groupID){
        $query = array('RequestMethod' => 'GetGenerics', 'Type' =>'GroupRole', 'OwnerID' => $groupID);
        $result = json_curl($this->user_service, $query);
        if( isset($result->Success) && $result->Success ){
            $roles = array();
            foreach($result->Entries as $row){
                $role = json_decode($row->Value);
                $role->roleID = $row->Key;
                array_push($roles,$role);
            }
			return $roles;
		} else {
			log_message('error',"Unknown response to GetGroups. Returning 0.");
			return false;
		}
    }
    
    function removeUserFromGroup($userID, $groupID){
        //clear role
        $result = false;
        $query = array('RequestMethod' => 'RemoveGeneric',
                       'OwnerID' => $userID,
                       'Type' =>'GroupRole' . $groupID, 
                       'Key' => "00000000-0000-0000-0000-000000000000");
        $result = json_curl($this->user_service, $query);
        if( isset($result->Success) && $result->Success ){
            //role record removed, remove from default role
            $query = array('RequestMethod' => 'RemoveGeneric',
                       'OwnerID' => $userID,
                       'Type' =>'GroupMember', 
                       'Key' => $groupID);
            $result = json_curl($this->user_service, $query);
            if( isset($result->Success) && $result->Success ){
                $result = true;
            } 
            //purge active group record if itis this group
            $activeGroup = $this->getActiveGroup($userID);
            if($activeGroup && $activeGroup == $groupID){
                $query = array('RequestMethod' => 'RemoveGeneric',
                           'OwnerID' => $userID,
                           'Type' =>'Group', 
                           'Key' => 'ActiveGroup');
                json_curl($this->user_service, $query);
                //user cannot have missing row, isnert blank active group to fill
                $query = array('RequestMethod' => 'AddGeneric',
                       'OwnerID' => $userID,
                       'Type' =>'Group', 
                       'Key' => 'ActiveGroup',
                       'Value' => '{}');
                json_curl($this->user_service, $query);
            }
        }
        return $result;
    }
    
    function addUserToGroup($userID, $groupID){
        //add membership record
        $query = array('RequestMethod' => 'AddGeneric',
                       'OwnerID' => $userID,
                       'Type' =>'GroupMember', 
                       'Key' => $groupID,
                       'Value' => '{"AcceptNotices":true,"ListInProfile":false}');
        $result = json_curl($this->user_service, $query);
        if( isset($result->Success) && $result->Success ){
            //membership record added, insert user into default role
            $query = array('RequestMethod' => 'AddGeneric',
                       'OwnerID' => $userID,
                       'Type' =>'GroupRole' . $groupID, 
                       'Key' => "00000000-0000-0000-0000-000000000000",
                       'Value' => '{}');
            $result = json_curl($this->user_service, $query);
            if( isset($result->Success) && $result->Success ){
                return true;
            } else {
                return false;
            }
        }else{
            return false;
        }
    }
    
    function getRolesForUser($userID, $groupID){
        $query = array('RequestMethod' => 'GetGenerics', 'Type' =>'GroupRole'.$groupID, 'OwnerID' => $userID);
        $result = json_curl($this->user_service, $query);
        if( isset($result->Success) && $result->Success ){
			return $result->Entries;
		} else {
			log_message('error',"Unknown response to GetGroups. Returning 0.");
			return false;
		}
    }
    
    function getGroupsForUser($userID){
        $query = array('RequestMethod' => 'GetGenerics', 'Type' =>'GroupMember', 'OwnerID' => $userID);
        $result = json_curl($this->user_service, $query);
        if( isset($result->Success) && $result->Success ){
			return $result->Entries;
		} else {
			log_message('error',"Unknown response to GetGroups. Returning 0.");
			return false;
		}
    }
    
    function getActiveGroup($userID){
        $query = array('RequestMethod' => 'GetGenerics', 'Type' =>'Group', 'OwnerID' => $userID);
        $result = json_curl($this->user_service, $query);
        if( isset($result->Success) && $result->Success ){
            if($result->Entries == [])
                return false;
            
            $entry = json_decode($result->Entries[0]->Value);
            if(isset($entry->GroupID))
                return $entry->GroupID;
            return false;
		} else {
			log_message('error',"Unknown response to GetGroups. Returning 0.");
			return false;
		}
    }
    
    function clearMapXY($x, $y){
        $cfile = curl_file_create(FCPATH . 'files/Tile.jpg','image/jpeg');
        $data = array(
            'X'=> $x,
            'Y'=> $y,
            'Tile'=>$cfile
        );
        $ch = curl_init();
        curl_setopt($ch, CURLOPT_URL, $this->grid_service);
        curl_setopt($ch, CURLOPT_HTTPHEADER, array( 'Content-Type: multipart/form-data' ));
        curl_setopt($ch, CURLOPT_SSL_VERIFYPEER,FALSE);
        curl_setopt($ch, CURLOPT_SSL_VERIFYHOST,0);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_POST, 1);
        curl_setopt($ch, CURLOPT_POSTFIELDS, $data);
        curl_exec($ch);
        if(curl_errno($ch)){
            $result = false;
        } else {
            $result = true;
        }
        return $result;
    }
	
    function gen_uuid() {
        return sprintf( '%04x%04x-%04x-%04x-%04x-%04x%04x%04x',mt_rand( 0, 0xffff ), mt_rand( 0, 0xffff ),mt_rand( 0, 0xffff ),mt_rand( 0, 0x0fff ) | 0x4000,mt_rand( 0, 0x3fff ) | 0x8000,mt_rand( 0, 0xffff ), mt_rand( 0, 0xffff ), mt_rand( 0, 0xffff ));
    }
}

?>
