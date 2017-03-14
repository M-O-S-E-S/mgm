
var fs = require('fs');

export interface Config {
  mgmdb: {
    host: string
    user: string
    password: string
    database: string
  }

  main: {
    log_dir: string
    upload_dir: string
    default_oar_path: string
    privateKeyPath: string
  }

  templates: { [key: string]: string }

  mail: {
    service?: string
    user?: string
    pass?: string
    sourceAccount?: string
    admins?: string
    gridname?: string
    public_url?: string
  }

  haldb: {
    host: string
    user: string
    password: string
    database: string
  }

  halcyon: {
    grid_server: string
    user_server: string
    messaging_server: string
    whip: string
  }




  //privateKeyPath: string
  //certificate: Buffer
  //voiceIP: string
  //internalUrl: string

  get_grid_info: {
    login_uri: string,
    manage: string,
    grid_name: string,
    grid_nick: string,
  }
}


export function Validate(config: Config): void {
  /** MGM Validation */
  if (!config.main.log_dir) {
    throw new Error('Error loading config: mgm log_dir is missing, region logs cannot be collected');
  } else {
    if (!fs.existsSync(config.main.log_dir)) {
      throw new Error('Error loading config: mgm log_dir is present, but the folder does not exist');
    }
  }
  if (!config.main.upload_dir) {
    throw new Error('Error loading config: mgm upload_dir is missing, oar functions will not work');
  } else {
    if (!fs.existsSync(config.main.upload_dir)) {
      throw new Error('Error loading config: mgm upload_dir is present, but the folder does not exist');
    }
  }
  //if (!config.main.default_oar_path) {
  //  throw new Error('Error loading config: mgm default oar path is missing, \'nuke\' functionality will not work');
  //} else {
  //  if (!fs.existsSync(config.main.default_oar_path)) {
  //    throw new Error('Error loading config: mgm default_oar_path is present, but the location does not exist');
  //  }
  //}
  if (!config.templates) {
    throw new Error('Error loading config: templates section is missing');
  }
  //if (!config.mgm.voiceIP) {
  //  console.log('Error loading config: mgm voice IP is missing, voice will not work');
  //  return false;
  //}
  //if (!config.mgm.internalUrl) {
  //  console.log('Error loading config: mgm internal ip address is missing');
  //  return false;
  //}
  //if (!config.mail) {
  //  console.log('Error loading config: mgm mail is missing, email notifications may not work');
  //  return false;
  //}
  if (!config.main.privateKeyPath) {
    throw new Error('Error loading config: privateKeyPath is mising');
  } else {
    if (!fs.existsSync(config.main.privateKeyPath)) {
      console.log(config.main.privateKeyPath);
      throw new Error('Error loading config: mgm privateKeyPath is present, but the location does not exist');
    }
  }
}
