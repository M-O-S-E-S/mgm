<?php if ( ! defined('BASEPATH')) exit('No direct script access allowed');

class Estates {
    public function createEstate($name, $ownerID){
        $ci = &get_instance();
        
        //check for existing estate with the requested name
        $q = $ci->db->get_where("estate_settings",array("EstateName" => $name));
        if($q->num_rows() > 0){
            die(json_encode(array('Success' => false, 'Message' => "An estate by that name already exists")));
        }
        
        //check that specified user actually exists
        if( $ci->simiangrid->getUserByID($ownerID) === false){
            die(json_encode(array('Success' => false, 'Message' => "Invalid User Specified")));
        }
        
        $data = array(
            "EstateName" => $name,
            "AbuseEmailToEstateOwner" => 0,
            "DenyAnonymous" => 0,
            "ResetHomeOnTeleport" => 0,
            "FixedSun" => 0,
            "DenyTransacted" => 0,
            "BlockDwell" => 0,
            "DenyIdentified" => 0,
            "AllowVoice" => 1,
            "UseGlobalTime" => 1,
            "PricePerMeter" => 1,
            "TaxFree" => 0,
            "AllowDirectTeleport" => 1,
            "RedirectGridX" => 0,
            "RedirectGridY" => 0,
            "ParentEstateID" => 1,
            "SunPosition" => 0,
            "EstateSkipScripts" => 0,
            "BillableFactor" => 0,
            "PublicAccess" => 1,
            "AbuseEmail" => "",
            "EstateOwner" => $ownerID,
            "DenyMinors" => 0,
            "AllowLandmark" => 1,
            "AllowParcelChanges" => 1,
            "AllowSetHome" => 1);
        $ci->db->insert("estate_settings", $data);
        $id = $ci->db->insert_id();
        if($id){
            return $id;
        }
        return false;
    }

}

?>
