<?php if ( ! defined('BASEPATH')) exit('No direct script access allowed');

class Freeswitch {
    
    public function getConfig(){
        $ci = &get_instance();
        $freeswitchContext = "default";
        $freeswitchRealm = $ci->config->item('voice_freeswitchHost');

        $result = Array();
        $result["Realm"] = $freeswitchRealm;
        $result["SIPProxy"] = $freeswitchRealm.":5060";
        $result["AttemptUseSTUN"] = false;
        $result["EchoServer"] = $freeswitchRealm;
        $result["EchoPort"] = 50505;
        $result["DefaultWellKnownIP"] = $freeswitchRealm;
        $result["DefaultTimeout"] = 5000;
        $result["Context"] = $freeswitchContext;
        $result["APIPrefix"] = '/fsapi';
        
        die(json_encode($result));
    }
    
    public function directoryRequest(){
        $ci = &get_instance();
        $freeswitchContext = "default";
        $freeswitchRealm = $ci->config->item('voice_freeswitchHost');
        $freeswitchContext = "default";
        
        $requestDomain = $ci->input->post('domain');
        $eventCallingFunction = $ci->input->post('Event-Calling-Function');

        if($requestDomain != $freeswitchRealm){
            die('');
        }
        if(!$eventCallingFunction || $eventCallingFunction == ""){
            $function = "sofia_reg_parse_auth";
        } else {
            $function = $eventCallingFunction;
        }
        
        switch($function){
        case "sofia_reg_parse_auth":
            $sipAuthMethod = $ci->input->post('sip_auth_method');
            switch($sipAuthMethod){
            case "REGISTER":
                $this->register($freeswitchContext, $freeswitchRealm);
            case "INVITE":
                $this->invite($freeswitchContext, $freeswitchRealm);
            default:
                die("");
            }
        case "switch_xml_locate_user":
            $this->locateUser($freeswitchRealm, $parameters);
            die();
        case "user_data_function":
            $this->locateUser($freeswitchRealm, $parameters);
            die();
        case "user_outgoing_channel":
            $this->register($freeswitchContext, $freeswitchRealm, $parameters);
            die();
        case "config_sofia":
            $this->configSofia($freeswitchContext, $freeswitchRealm, $parameters);
            die();
        case "switch_load_network_lists":
        default:
            die();
        }
    }
    
    public function dialplanRequest(){
        $ci = &get_instance();
        $freeswitchContext = "default";
        $freeswitchRealm = $ci->config->item('voice_freeswitchHost');
        $freeswitchContext = "default";
        $requestContext = $ci->input->post('Hunt-Context');

        if($requestContext != $freeswitchContext){
            die();
        }
       
	$xmlString = <<<XML
<?xml version="1.0" encoding="utf-8"?>
<document type="freeswitch/xml">
<section name="dialplan">
<context name="$freeswitchContext">
<extension name="opensim_conferences">
<condition field="destination_number" expression="^confctl-(.*)\$">
<action application="answer"/>
<action application="conference" data="\$1-$freeswitchRealm@$freeswitchContext"/>
</condition>
</extension>
<extension name="opensim_conf">
<condition field="destination_number" expression="^conf-(.*)\$">
<action application="answer"/>
<action application="conference" data="\$1-$freeswitchRealm@$freeswitchContext"/>
</condition>
</extension>
<extension name="avatar">
<condition field="destination_number" expression="^(x.*)\$">
<action application="bridge" data="user/\$1"/>
</condition>
</extension>
</context>
</section>
</document>
XML;
        header("Content-Type: text/xml");
        die($xmlString);
    }
    
    public function register($context, $realm){
        $password = "1234";
        $ci = &get_instance();
        $domain = $ci->input->post('domain');
        $user = $ci->input->post('user');

        //$user = str_replace('=','',$parameters["user"]);

	$xmlString = <<<XML
<?xml version="1.0" encoding="utf-8"?>
<document type="freeswitch/xml">
<section name="directory" description="User Directory">
<domain name="$domain">
<user id="$user">
<params>
<param name="password" value="$password" />
<param name="dial-string" value="{sip_contact_user=$user}{presence_id=\${dialed_user}}@\${dialed_domain}\${sofia_contact(\${dialed_user}@\${dialed_domain})}"/>
</params>
<variables>
<variable name="user_context" value="$context" />
<variable name="presence_id" value="$user@$domain"/>
</variables>
</user>
</domain>
</section>
</document>
XML;

        header("Content-Type: text/xml");
        die($xmlString);
    }
    
    public function invite($context, $realm){
        $password = "1234";
        $ci = &get_instance();
        $domain = $ci->input->post('domain');
        $user = $ci->input->post('user');
        $sipRequestUser = $ci->input->post('sip_request_user');

        //$user = str_replace('=','',$parameters["user"]);
        
	$xmlString = <<<XML
<?xml version="1.0" encoding="utf-8"?>
<document type="freeswitch/xml">
<section name="directory" description="User Directory">
<domain name="$domain">
<user id="$user">
<params>
<param name="password" value="$password" />
<param name="dial-string" value="{sip_contact_user=$user}{presence_id=\$$user@\${dialed_domain}}\${sofia_contact(\$$user@\${dialed_domain})}"/>
</params>
<variables>
<variable name="user_context" value="$context" />
<variable name="presence_id" value="$user@\$\${domain}"/>
</variables>
</user>
<user id="$sipRequestUser">
<params>
<param name="password" value="$password" />
<param name="dial-string" value="{sip_contact_user=$user}{presence_id=\$$sipRequestUser@\${dialed_domain}}\${sofia_contact(\$$sipRequestUser@\${dialed_domain})}"/>
</params>
<variables>
<variable name="user_context" value="$context" />
<variable name="presence_id" value="$sipRequestUser@\$\${domain}"/>
</variables>
</user>
</domain>
</section>
</document>
XML;
        header("Content-Type: text/xml");
        die($xmlString);
    }
    
    public function locateUser($realm, $parameters){
        $domain = $ci->input->post('domain');
        $user = $ci->input->post('user');

        //$user = str_replace('=','',$parameters["user"]);
        
	$xmlString = <<<XML
<?xml version="1.0" encoding="utf-8"?>
<document type="freeswitch/xml">
<section name="directory" description="User Directory">
<domain name="$domain">
<params>
<param name="dial-string" value="{sip_contact_user=\${dialed_user}}{presence_id=\${dialed_user}@\${dialed_domain}}\${sofia_contact(\${dialed_user}@\${dialed_domain})}"/>
</params>
<user id="$user">
<variables>
<variable name="default_gateway" value="\$\${default_provider}"/>
<variable name="presence_id" value="$user@\$\${domain}"/>
</variables>
</user>
</domain>
</section>
</document>
XML;
        header("Content-Type: text/xml");
        die($xmlString);
    }
    
    public function configSofia($context, $realm, $parameters){
        $domain = $ci->input->post('domain');
        
	$xmlString = <<<XML
<?xml version="1.0" encoding="utf-8"?>
<document type="freeswitch/xml">
<section name="directory" description="User Directory">
<domain name="$domain">
<params>
<param name="dial-string" value="{sip_contact_user=\${dialed_user}}{presence_id=\${dialed_user}@\${dialed_domain}}\${sofia_contact(\${dialed_user}@\${dialed_domain})}"/>
</params>
<groups name="default">
<users>
<user id="\$\${default_provider}">
<gateways>
<gateway name="\$\${default_provider}">
<param name="username" value="\$\${default_provider_username}"/>
<param name="password" value="\$\${default_provider_password}"/>
<param name="from-user" value="\$\${default_provider_username}"/>
<param name="from-domain" value="\$\${default_provider_from_domain}"/>
<param name="expire-seconds" value="600"/>
<param name="register" value="\$\${default_provider_register}"/>
<param name="retry-seconds" value="30"/>
<param name="extension" value="\$\${default_provider_contact}"/>
<param name="contact-params" value="domain_name=\$\${domain}"/>
<param name="context" value="$context"/>
</gateway>
</gateways>
<params>
<param name="password" value="\$\${default_provider_password}"/>
</params>
</user>
</users>
</groups>
<variables>
<variable name="default_gateway" value="\$\${default_provider}"/>
</variables>
</domain>
</section>
</document>
XML;
        header("Content-Type: text/xml");
        die($xmlString);

    }
}

?>
