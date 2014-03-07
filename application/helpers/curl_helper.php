<?php if ( ! defined('BASEPATH')) exit('No direct script access allowed');

function simple_curl($url, $post_args = null){
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, $url);
    if($post_args !== null){
		$args = array();
		foreach($post_args as $key => $val){
			$args[] = $key . '=' . $val;
		}
        curl_setopt($ch, CURLOPT_POST, 1);
        curl_setopt($ch, CURLOPT_POSTFIELDS, join("&", $args));
    }
    curl_setopt($ch,CURLOPT_SSL_VERIFYPEER,FALSE);
    curl_setopt($ch,CURLOPT_SSL_VERIFYHOST,0);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    if(curl_errno($ch)){
        die(json_encode(array('Success' => false, 'Message' => "Could not contact service")));
    }
    $result = curl_exec($ch);
    curl_close($ch);
    return $result;
}

function json_curl($url, $post_args = null){
    $result = simple_curl($url, $post_args);
    return json_decode($result);
}

?>
