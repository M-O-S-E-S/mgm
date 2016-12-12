
import { Job } from './Job';
import { Region, RegionMgr } from './Region';
import { EstateMgr } from '../halcyon/Estate';
import { UserMgr } from '../halcyon/User';
import { PendingUserMgr } from './PendingUser';
import { GroupMgr } from '../halcyon/Group';
import { JobMgr } from './Job'
import { EmailMgr } from './util/Email';
import { Host, HostMgr } from './Host';
import { UUIDString } from '../halcyon/UUID';
import { Sql } from '../mysql/sql';
import { SetupRoutes } from './routes';

import * as express from 'express';
import * as http from 'http';

var urllib = require('urllib');
import fs = require('fs');
import { RegionLogs } from './util/regionLogs';

var urllib = require('urllib');

export interface Config {
  mgm: {
    db: {
      host: string
      user: string
      pass: string
      name: string
    },
    log_dir: string
    upload_dir: string
    templates: { [key: string]: string }
    voiceIP: string
    internalUrl: string
    mail: any
    tokenKey: string
  },
  halcyon: {
    db: {
      host: string
      user: string
      pass: string
      name: string
    },
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

export class MGM {
  private conf: Config

  constructor(config: Config) {
    this.conf = config;
    let hal = new Sql(config.halcyon.db);

    //initialize singletons
    let db = new Sql(config.mgm.db);
    new RegionLogs(this.conf.mgm.log_dir);
    new RegionMgr(db, hal);
    new EstateMgr(hal);
    new UserMgr(hal);
    new GroupMgr(hal);
    new JobMgr(db);
    new HostMgr(db);
    new EmailMgr(this.conf.mgm.mail);
    new PendingUserMgr(db);
  }

  static isUser(req, res, next) {
    if (req.cookies['uuid']) {
      return next();
    }
    return res.send(JSON.stringify({ Success: false, Message: 'No session found' }));
  }

  static isAdmin(req, res, next) {
    if (req.cookies['userLevel'] >= 250) {
      return next();
    }
    return res.send(JSON.stringify({ Success: false, Message: 'Permission Denied' }));
  }

  getRouter(): express.Router {
    return SetupRoutes(this, this.conf.mgm.voiceIP);
  }

  getGridInfo(): any {
    return this.conf.grid_info;
  }

  startRegion(r: Region, h: Host): Promise<void> {
    console.log('starting ' + r.getName());
    let url = 'http://' + h.getAddress() + ':' + h.getPort() + '/start/' + r.getUUID().toString();
    return urllib.request(url).then((body) => {
      let result = JSON.parse(body.data);
      if (!result.Success) {
        throw new Error(result.Message);
      }
    });
  }

  stopRegion(r: Region, h: Host): Promise<void> {
    console.log('halting ' + r.getName());
    let url = 'http://' + h.getAddress() + ':' + h.getPort() + '/stop/' + r.getUUID().toString();
    return urllib.request(url).then((body) => {
      let result = JSON.parse(body.data);
      if (!result.Success) {
        throw new Error(result.Message);
      }
    });
  }

  consoleCommand(r: Region, h: Host, cmd: string): Promise<void> {
    let url = 'http://' + h.getAddress() + ':' + h.getPort() + '/consoleCmd/' + r.getUUID().toString();
    return urllib.request(url, {
      method: 'POST',
      data: { "cmd" : cmd }
    }).then((body) => {
      let result = JSON.parse(body.data);
      if (!result.Success) {
        throw new Error(result.Message);
      }
    });
  }

  saveOar(r: Region, h: Host, j: Job): Promise<void> {
    console.log('triggering oar save for ' + r.getName());
    let url = 'http://' + h.getAddress() + ':' + h.getPort() + '/saveOar/' + r.getUUID().toString() + '/' + j.id;
    return urllib.request(url).then((body) => {
      let result = JSON.parse(body.data);
      if (!result.Success) {
        throw new Error(result.Message);
      }
    });
  }

  loadOar(r: Region, h: Host, j: Job): Promise<void> {
    console.log('triggering oar load for ' + r.getName());
    let url = 'http://' + h.getAddress() + ':' + h.getPort() + '/loadOar/' + r.getUUID().toString() + '/' + j.id;
    return urllib.request(url).then((body) => {
      let result = JSON.parse(body.data);
      if (!result.Success) {
        throw new Error(result.Message);
      }
    });
  }

  killRegion(r: Region, h: Host): Promise<void> {
    console.log('killing ' + r.getName());
    let url = 'http://' + h.getAddress() + ':' + h.getPort() + '/kill/' + r.getUUID().toString();
    return urllib.request(url).then((body) => {
      let result = JSON.parse(body.data);
      if (!result.Success) {
        throw new Error(result.Message);
      }
    });
  }

  removeRegionFromHost(r: Region, h: Host): Promise<void> {
    return urllib.request('http://' + h.getAddress() + ':' + h.getPort() + '/remove/' + r.getUUID().toString());
  }

  putRegionOnHost(r: Region, h: Host): Promise<void> {
    //host may be null
    return r.setNodeAddress(h? h.getAddress() : '').then(() => {
      //sql is updated, contact new host
      if (h === null) {
        return Promise.resolve();
      }

      urllib.request('http://' + h.getAddress() + ':' + h.getPort() + '/add/' + r.getUUID().toString() + '/' + r.getName(), { timeout: 10000 });
    });
  }

  getTokenKey(): string {
    return this.conf.mgm.tokenKey;
  }

  getUploadDir(): string {
    return this.conf.mgm.upload_dir;
  }

  getTemplates(): {[key: string]: string} {
    return this.conf.mgm.templates;
  }

  getRegionINI(r: Region): Promise<{ [key: string]: { [key: string]: string } }> {
    let connString: string = 'Data Source=' + this.conf.halcyon.db.host + ';Database=' + this.conf.halcyon.db.name + ';User ID=' + this.conf.halcyon.db.user + ';Password=' + this.conf.halcyon.db.pass + ';';

    let config: { [key: string]: { [key: string]: string } } = {}
    config['Startup'] = {};
    config['Startup']['save_crashes'] = 'false';
    config['Startup']['gridmode'] = 'true';
    config['Startup']['startup_console_commands_file'] = 'startup_commands.txt';
    config['Startup']['shutdown_console_commands_file'] = 'shutdown_commands.txt';
    config['Startup']['region_info_source'] = 'filesystem';
    config['Startup']['DrawPrimOnMapTile'] = 'true';
    config['Startup']['TextureOnMapTile'] = 'false';
    config['Startup']['NonPhysicalPrimMax'] = '256';
    config['Startup']['PhysicalPrimMax'] = '10';
    config['Startup']['ClampPrimSize'] = 'false';
    config['Startup']['storage_plugin'] = 'OpenSim.Data.MySQL.dll';
    config['Startup']['storage_connection_string'] = connString;
    config['Startup']['asset_database'] = 'whip';
    config['Startup']['MinimumTimeBeforePersistenceConsidered'] = '60';
    config['Startup']['MaximumTimeBeforePersistenceConsidered'] = '600';
    config['Startup']['physical_prim'] = 'true';
    config['Startup']['physics'] = 'InWorldz.PhysxPhysics';
    config['Startup']['permissionmodules'] = 'DefaultPermissionsModule';
    config['Startup']['serverside_object_permissions'] = 'true';
    config['Startup']['allow_grid_gods'] = 'true';
    config['Startup']['use_aperture_server'] = 'yes';
    config['Startup']['aperture_server_port'] = '80';
    config['Startup']['aperture_server_caps_token'] = '2960079';
    config['Startup']['core_connection_string'] = connString + 'Pooling=True;Min Pool Size=0;';
    config['Startup']['rdb_connection_string'] = connString + 'Pooling=True;Min Pool Size=0;';

    config['SMTP'] = {};
    config['SMTP']['enabled'] = 'false';

    config['Communications'] = {};
    config['Communications']['InterregionComms'] = 'RESTComms';

    config['Inventory'] = {};
    config['Inventory']['inventory_plugin'] = 'InWorldz.Data.Inventory.Cassandra.dll';
    config['Inventory']['inventory_cluster'] = 'Halcyon Cluster';
    config['Inventory']['legacy_inventory_source'] = connString + 'Pooling=True;Min Pool Size=5;';
    config['Inventory']['migration_active'] = 'true';

    config['Network'] = {};
    config['Network']['http_listener_port'] = '' + r.getPort();
    config['Network']['default_location_x'] = '' + r.getX();
    config['Network']['default_location_y'] = '' + r.getY();
    config['Network']['hostname'] = r.getExternalAddress();
    config['Network']['http_listener_ssl'] = 'false';
    config['Network']['grid_server_url'] = this.conf.halcyon.grid_server;
    config['Network']['grid_send_key'] = 'null';
    config['Network']['grid_recv_key'] = 'null';
    config['Network']['user_server_url'] = this.conf.halcyon.user_server;
    config['Network']['user_send_key'] = 'null';
    config['Network']['user_recv_key'] = 'null';
    config['Network']['asset_server_url'] = this.conf.halcyon.whip;
    config['Network']['messaging_server_url'] = this.conf.halcyon.messaging_server;
    config['Network']['shard'] = 'HalcyonHome';

    config['Chat'] = {};
    config['Chat']['enabled'] = 'true';
    config['Chat']['whisper_distance'] = '10';
    config['Chat']['say_distance'] = '30';
    config['Chat']['shout_distance'] = '100';

    config['Messaging'] = {};
    config['Messaging']['InstantMessageModule'] = 'InstantMessageModule';
    config['Messaging']['MessageTransferModule'] = 'MessageTransferModule';
    config['Messaging']['OfflineMessageModule'] = 'OfflineMessageModule';
    config['Messaging']['OfflineMessageURL'] = this.conf.mgm.internalUrl + '/offline';
    config['Messaging']['MuteListModule'] = 'MuteListModule';
    config['Messaging']['MuteListURL'] = '127.0.0.1';

    config['Sun'] = {};
    config['Sun']['day_length'] = '24.0';
    config['Sun']['year_length'] = '360';
    config['Sun']['update_interval'] = '1000';

    config['Wind'] = {};
    config['Wind']['enabled'] = 'true';
    config['Wind']['wind_update_rate'] = '500';
    config['Wind']['wind_plugin'] = 'ZephyrWind';

    config['Cloud'] = {};
    config['Cloud']['enabled'] = 'false';

    config['Trees'] = {};
    config['Trees']['active_trees'] = 'false';

    config['Groups'] = {};
    config['Groups']['Enabled'] = 'true';
    config['Groups']['Module'] = 'FlexiGroups';
    config['Groups']['Provider'] = 'Native';
    config['Groups']['NativeProviderDBType'] = 'MySQL';
    config['Groups']['NativeProviderConnString'] = connString + 'Pooling=True;Min Pool Size=5;';
    config['Groups']['XmlRpcDebugEnabled'] = 'false';

    config['Profile'] = {};
    config['Profile']['ProfileConnString'] = connString + 'Pooling=True;Min Pool Size=5;';

    config['Modules'] = {};
    config['Modules']['AssetServices'] = 'LocalAssetServicesConnector';
    config['Modules']['UserServices'] = 'LocalUserServicesConnector';

    config['InWorldz.PhysxPhysics'] = {};
    config['InWorldz.PhysxPhysics']['use_visual_debugger'] = 'false';
    config['InWorldz.PhysxPhysics']['use_ccd'] = 'true';

    config['Mesh'] = {};
    config['Mesh']['AllowMeshUpload'] = 'true';

    config['SimulatorFeatures'] = {};
    config['SimulatorFeatures']['MapImageServerURI'] = this.conf.halcyon.user_server;
    config['SimulatorFeatures']['SearchServerURI'] = this.conf.halcyon.user_server;
    config['SimulatorFeatures']['MeshEnabled'] = 'true';
    config['SimulatorFeatures']['PhysicsMaterialsEnabled'] = 'false';

    config['ChatLogModule'] = {};
    config['ChatLogModule']['Enabled'] = 'false';

    config['GuestModule'] = {};
    config['GuestModule']['Enabled'] = 'false';

    config['ChatFilterModule'] = {};
    config['ChatFilterModule']['Enabled'] = 'false';

    config['AvatarRemoteCommands'] = {};
    config['AvatarRemoteCommands']['Enabled'] = 'false';

    return Promise.resolve(config);
  }
}
