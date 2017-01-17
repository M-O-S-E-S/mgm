
import { Set, Map } from 'immutable';

export class FreeSwitchDirectory {
  public id: string
  public description: string
  public type: string

  channels: Map<string, FreeSwitchChannel>

  constructor(id: string, description: string, type: string) {
    this.id = id;
    this.description = description;
    this.type = type;
    this.channels = Map<string,FreeSwitchChannel>();
  }
}

export class FreeSwitchUser {
  public id: string
  public password: string
  public realm: string

  constructor(id: string, password: string, realm: string){
    this.id = id;
    this.password = password;
    this.realm = realm;
  }
}

export class FreeSwitchChannel {
  public id: string
  public uri: string
  public name: string
  public parent: string

  constructor(id: string, name: string, uri: string, parent: string){
    this.id = id;
    this.name = name;
    this.uri = uri;
    this.parent = parent;
  }
}

export class Freeswitch {

  private directories: Map<string, FreeSwitchDirectory>
  private users: Map<string, FreeSwitchUser>
  private voiceIP: string

  constructor(voiceIP: string) {
    this.voiceIP = voiceIP;
    this.directories = Map<string, FreeSwitchDirectory>();
    this.users = Map<string, FreeSwitchUser>();
  }

  // Create and return a new voice account
  getAccountInfo(user: string): FreeSwitchUser {
    console.log('Freeswitch: account request for ' + user);
    this.users = this.users.set(
      user,
      new FreeSwitchUser(user, "1234", this.voiceIP) // BAD!! but its what opensim does, so for now ...
    )
    return this.users.get(user, null);
  }

  // test if directory already exists
  getDirectory(dir: string): FreeSwitchDirectory {
    return this.directories.get(dir, null);
  }

  // create directory
  createDirectory(id: string, description: string, type: string) {
    this.directories = this.directories.set(
      id,
      new FreeSwitchDirectory(id, description, type)
    );
  }

  getChannel(parent: string, name: string): FreeSwitchChannel {
    let dir = this.directories.get(parent, null);
    if(!dir) return null;
    let chan = dir.channels.get(name, null);
    return chan;
  }

  createChannel(parent: string, id: string, name: string) {
    let dir = this.directories.get(parent, null);
    if(!dir) return;
    dir.channels = dir.channels.set(name, new FreeSwitchChannel(
      id,
      name,
      'sip:conf-x'+id+'@'+this.voiceIP,
      //channelUri = String.Format("sip:conf-{0}@{1}", "x" + Convert.ToBase64String(Encoding.ASCII.GetBytes(landUUID)), m_freeSwitchRealm);
      parent
    ));
    this.directories = this.directories.set(parent, dir);
  }

  // response for SLVOICE viv_get_prelogin.php
  clientConfig(): string {
    let context = 'default';
    let realm = this.voiceIP;
    let sipProxy = realm;
    let attemptUseStun = false;
    let echoServer = this.voiceIP;
    let echoPort = 50505;
    let defaultTimeout = 5000;
    let resetUrl = '';
    let privacyNoticeUrl = '';

    return '<?xml version="1.0" encoding="utf-8"?>' +
      '<VCConfiguration>' +
      '<DefaultRealm>' + realm + '</DefaultRealm>' +
      '<DefaultSIPProxy>' + sipProxy + '</DefaultSIPProxy>' +
      '<DefaultAttemptUseSTUN>' + attemptUseStun + '</DefaultAttemptUseSTUN>' +
      '<DefaultEchoServer>' + echoServer + '</DefaultEchoServer>' +
      '<DefaultEchoPort>' + echoPort + '</DefaultEchoPort>' +
      '<DefaultWellKnownIP>' + realm + '</DefaultWellKnownIP>' +
      '<DefaultTimeout>' + defaultTimeout + '</DefaultTimeout>' +
      '<UrlResetPassword>' + resetUrl + '</UrlResetPassword>' +
      '<UrlPrivacyNotice>' + privacyNoticeUrl + '</UrlPrivacyNotice>' +
      '<UrlEulaNotice/>' +
      '<App.NoBottomLogo>false</App.NoBottomLogo>' +
      '</VCConfiguration>';
  }

  // response for SLVOICE viv_signin.php
  signin(body: any) {
    let userId = body.userid;
    let user: FreeSwitchUser = this.users.get(userId, null);
    if(!user) return '';
    let pwd = body.pwd;
    let pos = this.users.toArray().indexOf(user);

    console.log('Freeswitch sign-in: ' + userId + ':' + pos);

    return '<response xsi:schemaLocation="/xsd/signin.xsd">' +
      '<level0>' +
      '<status>OK</status>' +
      '<body>' +
      '<code>200</code>' +
      '<cookie_name>lib_session</cookie_name>' +
      '<cookie>' + userId + ':' + pos + ':9303959503950::</cookie>' +
      '<auth_token>' + userId + ':' + pos + ':9303959503950::</auth_token>' +
      '<primary>1</primary>' +
      '<account_id>' + pos + '</account_id>' +
      '<displayname>Avatar Name</displayname>' +
      '<msg>auth successful</msg>' +
      '</body>' +
      '</level0>' +
      '</response>';
    // 0 - userId
    // 1 - pos <-- position in uuid-name mapping???
    // 2 - avatarname
  }


  /*** OLD WORK BELOW THIS POINT **/

  // requested on Halcyon startup to configure the FreeSwitch Region Module
  halcyonConfig(): string {
    let xml = '<config>' +
      '<Realm>' + this.voiceIP + '</Realm>' +
      '<SIPProxy>' + this.voiceIP + ":5060" + '</SIPProxy>' +
      '<AttemptUseSTUN>' + 'false' + '</AttemptUseSTUN>' +
      '<EchoServer>' + this.voiceIP + '</EchoServer>' +
      '<EchoPort>' + 50505 + '</EchoPort>' +
      '<DefaultWellKnownIP>' + this.voiceIP + '</DefaultWellKnownIP>' +
      '<DefaultTimeout>' + 5000 + '</DefaultTimeout>' +
      '<Context>' + 'default' + '</Context>' +
      '<APIPrefix>' + '/fsapi' + '</APIPrefix>' +
      '</config>';
    return xml;
  }

  

  directory(body: any): string {
    console.log('Freeswitch directory service');
    let context = 'default';
    let realm = this.voiceIP;
    let reqDomain = body.domain;

    //console.log(body);

    if (reqDomain !== realm) {
      console.log('domain !== realm, returning empty');
      return '';
    }

    let callingFunction = body['Event-Calling-Function'];

    if (!callingFunction || callingFunction === '') {
      callingFunction = 'sofia_reg_parse_auth';
    }

    switch (callingFunction) {
      case 'sofia_reg_parse_auth':
        let sipAuthMethod = body['sip_auth_method'];
        switch (sipAuthMethod) {
          case 'REGISTER':
            return this.register(context, realm, body);
          case 'INVITE':
            return this.invite(context, realm, body);
          default:
            console.log('unknown sofia auth method ' + sipAuthMethod)
            return '';
        }
      case 'switch_xml_locate_user':
        return this.locateUser(realm, body);
      case 'user_data_function':
        return this.locateUser(realm, body);
      case 'user_outgoing_channel':
        return this.register(context, realm, body);
      case 'config_sofia':
        return this.configSofia(context, realm, body);
      case 'switch_load_network_lists':
      case 'launch_sofia_worker_thread':
      default:
        return '';
    }
  }

  dialplan(body: any) {
    console.log('Freeswitch directory service');
    let context = 'default';
    let realm = this.voiceIP;
    let reqContext = body['Hunt-Context'];

    if (reqContext !== context) {
      return '';
    }

    return '<?xml version="1.0" encoding="utf-8"?>\r\n' +
      '<document type="freeswitch/xml">\r\n' +
      '<section name="dialplan">\r\n' +
      '<context name="default">\r\n' +
      '<extension name="opensim_conferences">\r\n' +
      '<condition field="destination_number" expression="^confctl-(.*)$">\r\n' +
      '<action application="answer"/>\r\n' +
      '<action application="conference" data="$1-' + realm + '@default"/>\r\n' +
      '</condition></extension>\r\n' +
      '<extension name="opensim_conf">\r\n' +
      '<condition field="destination_number" expression="^conf-(.*)$">\r\n' +
      '<action application="answer"/>\r\n' +
      '<action application="conference" data="$1-' + realm + '@default"/>\r\n' +
      '</condition></extension>\r\n' +
      '<extension name="avatar">\r\n' +
      '<condition field="destination_number" expression="^(x.*)$">\r\n' +
      '<action application="bridge" data="user/$1"/>\r\n' +
      '</condition></extension></context></section></document>\r\n';
  }

  private register(context: string, realm: string, params: any): string {
    let password = '1234';
    let domain = params['domain'];
    let user = params['user'];
    return '<?xml version="1.0" encoding="utf-8"?>\r\n' +
      '<document type="freeswitch/xml">\r\n' +
      '<section name="directory" description="User Directory">\r\n' +
      '<domain name="' + domain + '">\r\n' +
      '<user id="' + user + '">\r\n' +
      '<params>\r\n' +
      '<param name="password" value="' + password + '" />\r\n' +
      '<param name="dial-string" value="{sip_contact_user=' + user + '}{presence_id=${dialed_user}@${dialed_domain}}${sofia_contact(${dialed_user}@${dialed_domain})}"/>\r\n' +
      '</params><variables>\r\n' +
      '<variable name="user_context" value="' + context + '" />\r\n' +
      '<variable name="presence_id" value="' + user + '@' + domain + '"/>\r\n' +
      '</variables></user></domain></section></document>\r\n';
  }

  private invite(context: string, realm: string, params: any): string {
    let password = '1234';
    let domain = params['domain'];
    let user = params['user'];
    let sipRequestUser = params['sip_request_user'];

    return '<?xml version="1.0" encoding="utf-8"?>\r\n' +
      '<document type="freeswitch/xml">\r\n' +
      '<section name="directory" description="User Directory">\r\n' +
      '<domain name="' + domain + '">\r\n' +
      '<user id="' + user + '">\r\n' +
      '<params>\r\n' +
      '<param name="password" value="' + password + '" />\r\n' +
      '<param name="dial-string" value="{sip_contact_user=' + user + '}{presence_id=$' + user + '@${dialed_domain}}${sofia_contact($' + user + '@${dialed_domain})}"/>\r\n' +
      '</params>\r\n' +
      '<variables>\r\n' +
      '<variable name="user_context" value="' + context + '" />\r\n' +
      '<variable name="presence_id" value="' + user + '@$${domain}"/>\r\n' +
      '</variables>\r\n' +
      '</user>\r\n' +
      '<user id="' + sipRequestUser + '">\r\n' +
      '<params>\r\n' +
      '<param name="password" value="' + password + '" />\r\n' +
      '<param name="dial-string" value="{sip_contact_user=' + user + '}{presence_id=$' + sipRequestUser + '@${dialed_domain}}${sofia_contact($' + sipRequestUser + '@${dialed_domain})}"/>\r\n' +
      '</params>\r\n' +
      '<variables>\r\n' +
      '<variable name="user_context" value="$context" />\r\n' +
      '<variable name="presence_id" value="' + sipRequestUser + '@$${domain}"/>\r\n' +
      '</variables></user></domain></section></document>\r\n';
  }

  private locateUser(realm: string, params: any): string {
    let domain = params['domain'];
    let user = params['user'];
    return '<?xml version="1.0" encoding="utf-8"?>' +
      '<document type="freeswitch/xml">' +
      '<section name="directory" description="User Directory">' +
      '<domain name="' + domain + '">' +
      '<params>' +
      '<param name="dial-string" value="{sip_contact_user=${dialed_user}}{presence_id=${dialed_user}@${dialed_domain}}${sofia_contact(${dialed_user}@${dialed_domain})}"/>' +
      '</params>' +
      '<user id="' + user + '">' +
      '<variables>' +
      '<variable name="default_gateway" value="$${default_provider}"/>' +
      '<variable name="presence_id" value="' + user + '@$${domain}"/>' +
      '</variables>' +
      '</user></domain></section></document>';
  }

  private configSofia(context: string, realm: string, params: any): string {
    let domain = params['domain'];
    return '<?xml version="1.0" encoding="utf-8"?>' +
      '<document type="freeswitch/xml">' +
      '<section name="directory" description="User Directory">' +
      '<domain name="' + domain + '">' +
      '<params>' +
      '<param name="dial-string" value="{sip_contact_user=${dialed_user}}{presence_id=${dialed_user}@${dialed_domain}}${sofia_contact(${dialed_user}@${dialed_domain})}"/>' +
      '</params>' +
      '<groups name="default">' +
      '<users>' +
      '<user id="$${default_provider}">' +
      '<gateways>' +
      '<gateway name="$${default_provider}">' +
      '<param name="username" value="$${default_provider_username}"/>' +
      '<param name="password" value="$${default_provider_password}"/>' +
      '<param name="from-user" value="$${default_provider_username}"/>' +
      '<param name="from-domain" value="$${default_provider_from_domain}"/>' +
      '<param name="expire-seconds" value="600"/>' +
      '<param name="register" value="$${default_provider_register}"/>' +
      '<param name="retry-seconds" value="30"/>' +
      '<param name="extension" value="$${default_provider_contact}"/>' +
      '<param name="contact-params" value="domain_name=$${domain}"/>' +
      '<param name="context" value="' + context + '"/>' +
      '</gateway>' +
      '</gateways>' +
      '<params>' +
      '<param name="password" value="$${default_provider_password}"/>' +
      '</params>' +
      '</user>' +
      '</users>' +
      '</groups>' +
      '<variables>' +
      '<variable name="default_gateway" value="$${default_provider}"/>' +
      '</variables></domain></section></document>';
  }
}
