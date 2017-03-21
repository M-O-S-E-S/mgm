
var fs = require('fs');
import ini = require('ini');

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
    privateKeyPath: string
    publicIP: string
    lanIP: string
  }

  redis: {
    host: string
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

  freeswitch: {
    api_url: string
  }

  offlinemessages: {
    api_url: string
  }

  get_grid_info: {
    login_uri: string,
    manage: string,
    grid_name: string,
    grid_nick: string,
  }
}

function BlankConfig(): Config {
  return {
    mgmdb: { host: null, user: null, password: null, database: null },
    main: { log_dir: null, upload_dir: null, privateKeyPath: null, publicIP: null, lanIP: null },
    redis: { host: null },
    templates: null,
    mail: null,
    haldb: { host: null, user: null, password: null, database: null },
    halcyon: { grid_server: null, user_server: null, messaging_server: null, whip: null },
    freeswitch: { api_url: null },
    offlinemessages: { api_url: null },
    get_grid_info: { login_uri: null, manage: null, grid_name: null, grid_nick: null }
  }
}

export function LoadConfig(iniPath: string): Config {
  let conf: Config = BlankConfig();
  try {
    conf = ini.parse(fs.readFileSync('./mgm.ini').toString());
  } catch (err) { }

  // override any or all ini values with any env settings
  conf = {
    mgmdb: {
      host: conf.mgmdb.host || process.env.MGM_DB_HOST,
      database: conf.mgmdb.database || process.env.MGM_DB_DATABASE,
      user: conf.mgmdb.user || process.env.MGM_DB_USER,
      password: conf.mgmdb.password || process.env.MGM_DB_PASS
    },
    haldb: {
      host: conf.haldb.host || process.env.HAL_DB_HOST,
      database: conf.haldb.database || process.env.HAL_DB_DATABASE,
      user: conf.haldb.user || process.env.HAL_DB_USER,
      password: conf.haldb.password || process.env.HAL_DB_PASS
    },
    main: {
      publicIP: conf.main.publicIP || process.env.PUBLIC_IP,
      lanIP: conf.main.lanIP || process.env.LAN_IP,
      log_dir: conf.main.log_dir || process.env.LOG_DIR,
      upload_dir: conf.main.upload_dir || process.env.UPLOAD_DIR,
      privateKeyPath: conf.main.privateKeyPath || process.env.PRIVATE_KEY
    },
    redis: { host: conf.redis.host || process.env.REDIS_HOST },
    freeswitch: { api_url: conf.freeswitch.api_url || process.env.FREESWITCH_API },
    offlinemessages: { api_url: conf.offlinemessages.api_url || process.env.OFFLINE_MESSAGES_API },
    templates: conf.templates || process.env.TEMPLATES ? JSON.parse(process.env.TEMPLATES) : null,
    mail: conf.mail || process.env.MAIL ? JSON.parse(process.env.MAIL) : null,
    halcyon: {
      grid_server: conf.halcyon.grid_server || process.env.GRID_SERVER,
      user_server: conf.halcyon.user_server || process.env.USER_SERVER,
      messaging_server: conf.halcyon.messaging_server || process.env.MESSAGING_SERVER,
      whip: conf.halcyon.whip || process.env.WHIP_SERVER
    },
    get_grid_info: {
      grid_name: conf.get_grid_info.grid_name || process.env.GRID_NAME,
      grid_nick: conf.get_grid_info.grid_nick || process.env.GRID_NICK,
      login_uri: conf.get_grid_info.login_uri || process.env.LOGIN_URI,
      manage: conf.get_grid_info.manage || process.env.MGM_PUBLIC_ADDRESS
    }
  }

  Validate(conf);

  return conf;
}

function Validate(config: Config): void {
  if (!config) throw new Error('INVALID CONFIG: config not provided');

  if (!config.mgmdb) throw new Error('INVALID CONFIG: [mgmdb] missing');
  if (!config.mgmdb.host) throw new Error('INVALID CONFIG: [mgmdb] host missing');
  if (!config.mgmdb.user) throw new Error('INVALID CONFIG: [mgmdb] user missing');
  if (!config.mgmdb.password) throw new Error('INVALID CONFIG: [mgmdb] password missing');
  if (!config.mgmdb.database) throw new Error('INVALID CONFIG: [mgmdb] database missing');

  if (!config.haldb) throw new Error('INVALID CONFIG: [haldb] missing');
  if (!config.haldb.host) throw new Error('INVALID CONFIG: [haldb] host missing');
  if (!config.haldb.user) throw new Error('INVALID CONFIG: [haldb] user missing');
  if (!config.haldb.password) throw new Error('INVALID CONFIG: [haldb] password missing');
  if (!config.haldb.database) throw new Error('INVALID CONFIG: [haldb] database missing');

  if (!config.main) throw new Error('INVALID CONFIG: [main] missing');
  if (!config.main.log_dir) throw new Error('INVALID CONFIG: [main] log_dir missing');
  if (!config.main.upload_dir) throw new Error('INVALID CONFIG: [main] upload_dir missing');
  if (!config.main.privateKeyPath) throw new Error('INVALID CONFIG: [main] privateKeyPath missing');
  if (!config.main.publicIP) throw new Error('INVALID CONFIG: [main] publicIP missing');
  if (!config.main.lanIP) throw new Error('INVALID CONFIG: [main] lanIP missing');

  if (!config.redis) throw new Error('INVALID CONFIG: [redis] missing');
  if (!config.redis.host) throw new Error('INVALID CONFIG: [redis] host missing');

  if (!config.templates) throw new Error('INVALID CONFIG: [templates] missing');

  if (!config.mail) throw new Error('INVALID CONFIG: [mail] missing');

  if (!config.halcyon) throw new Error('INVALID CONFIG: [halcyon] missing');
  if (!config.halcyon.grid_server) throw new Error('INVALID CONFIG: [halcyon] grid_server missing');
  if (!config.halcyon.user_server) throw new Error('INVALID CONFIG: [halcyon] user_server missing');
  if (!config.halcyon.messaging_server) throw new Error('INVALID CONFIG: [halcyon] messaging_server missing');
  if (!config.halcyon.whip) throw new Error('INVALID CONFIG: [halcyon] whip missing');

  if (!config.freeswitch) throw new Error('INVALID CONFIG: [freeswitch] missing');
  if (!config.freeswitch.api_url) throw new Error('INVALID CONFIG: [freeswitch] api_url missing');

  if (!config.offlinemessages) throw new Error('INVALID CONFIG: [offlinemessages] missing');
  if (!config.offlinemessages.api_url) throw new Error('INVALID CONFIG: [offlinemessages] api_url missing');

  if (!config.get_grid_info) throw new Error('INVALID CONFIG: [get_grid_info] missing');
  if (!config.get_grid_info.login_uri) throw new Error('INVALID CONFIG: [get_grid_info] login_uri missing');
  if (!config.get_grid_info.manage) throw new Error('INVALID CONFIG: [get_grid_info] manage missing');
  if (!config.get_grid_info.grid_name) throw new Error('INVALID CONFIG: [get_grid_info] grid_name missing');
  if (!config.get_grid_info.grid_nick) throw new Error('INVALID CONFIG: [get_grid_info] grid_nick missing');
}
