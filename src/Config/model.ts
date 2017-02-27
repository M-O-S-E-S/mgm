
var fs = require('fs');

export interface Config {
  mgm: {
    db: {
      host: string
      user: string
      pass: string
      name: string
    }
    log_dir: string
    upload_dir: string
    default_oar_path: string
    templates: { [key: string]: string }
    voiceIP: string
    internalUrl: string
    mail: any
    privateKeyPath: string
    certificate: Buffer
  },
  halcyon: {
    db: {
      host: string
      user: string
      pass: string
      name: string
    }
    grid_server: string
    user_server: string
    messaging_server: string
    whip: string
  },
  grid_info: {
    login: string,
    mgm: string,
    gridName: string,
    gridNick: string,
  },
  console: {
    user: string,
    pass: string
  }
}

export function Validate(config: Config): boolean {
  /** MGM Validation */
  if (!config.mgm) {
    console.log('Error loading config: mgm section is missing');
    return false;
  }
  if (!config.mgm.db) {
    console.log('Error loading config: mgm database section is missing');
    return false;
  }
  if (!config.mgm.db.host || !config.mgm.db.user || !config.mgm.db.pass || !config.mgm.db.name) {
    console.log('Error loading config: mgm database section is invalid or incomplete');
    return false;
  }
  if (!config.mgm.log_dir) {
    console.log('Error loading config: mgm log_dir is missing, region logs cannot be collected');
    return false;
  } else {
    if (!fs.existsSync(config.mgm.log_dir)) {
      console.log('Error loading config: mgm log_dir is present, but the folder does not exist');
      return false;
    }
  }
  if (!config.mgm.upload_dir) {
    console.log('Error loading config: mgm upload_dir is missing, oar functions will not work');
    return false;
  } else {
    if (!fs.existsSync(config.mgm.upload_dir)) {
      console.log('Error loading config: mgm upload_dir is present, but the folder does not exist');
      return false;
    }
  }
  if (!config.mgm.default_oar_path) {
    console.log('Error loading config: mgm default oar path is missing, \'nuke\' functionality will not work');
    return false;
  } else {
    if (!fs.existsSync(config.mgm.default_oar_path)) {
      console.log('Error loading config: mgm default_oar_path is present, but the location does not exist');
      return false;
    }
  }
  if (!config.mgm.templates) {
    console.log('Error loading config: templates section is missing');
    return false;
  }
  if (!config.mgm.voiceIP) {
    console.log('Error loading config: mgm voice IP is missing, voice will not work');
    return false;
  }
  if (!config.mgm.internalUrl) {
    console.log('Error loading config: mgm internal ip address is missing');
    return false;
  }
  if (!config.mgm.mail) {
    console.log('Error loading config: mgm mail is missing, email notifications may not work');
    return false;
  }
  if (!config.mgm.privateKeyPath) {
    console.log('Error loading config: privateKeyPath is mising');
    return false;
  }else {
    if (!fs.existsSync(config.mgm.privateKeyPath)) {
      console.log('Error loading config: mgm privateKeyPath is present, but the location does not exist');
      return false;
    }
  }

  return true;
}