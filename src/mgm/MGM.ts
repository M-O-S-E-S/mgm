
import { MGMDB } from './database/mgmDB';
import { Job } from './Job';
import { Region } from './Region';
import { Host } from './host';
import { UUIDString } from '../halcyon/UUID';
import { SqlConnector as HAL } from '../halcyon/sqlConnector';
import { AuthHandler } from './routes/AuthHandler';
import { ConsoleHandler } from './routes/ConsoleHandler';
import { TaskHandler } from './routes/TaskHandler';
import { EstateHandler } from './routes/EstateHandler';
import { HostHandler } from './routes/HostHandler';
import { UserHandler } from './routes/UserHandler';
import { RegionHandler } from './routes/RegionHandler';
import { GroupHandler } from './routes/GroupHandler';
import { DispatchHandler } from './routes/DispatchHandler';
import { OfflineMessageHandler } from './routes/OfflineMessageHandler';
import { Freeswitch } from './Freeswitch';
import { FreeswitchHandler } from './routes/FreeswitchHandler';

import * as express from 'express';
import * as http from 'http';

var urllib = require('urllib');
import fs = require('fs');
import { RegionLogs } from './util/regionLogs';

var urllib = require('urllib');

export interface Config {
  mgm: {
    db_host: string
    db_user: string
    db_pass: string
    db_name: string
    log_dir: string
    upload_dir: string
    templates: { [key: string]: string }
    voiceIP: string
    internalUrl: string
  },
  halcyon: {
    db_host: string
    db_user: string
    db_pass: string
    db_name: string
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
  private hal: HAL
  private db: MGMDB

  constructor(config: Config) {
    this.conf = config;
    this.hal = new HAL(config.halcyon);

    //initialize singletons
    this.db = new MGMDB(config.mgm);
    new RegionLogs(this.conf.mgm.log_dir);

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
    let router = express.Router();
    let fs = new Freeswitch(this.conf);

    router.use('/auth', AuthHandler(this.hal));
    router.use('/console', ConsoleHandler(this, this.conf.console));
    router.use('/task', TaskHandler(this, this.conf.mgm.upload_dir));
    router.use('/estate', EstateHandler(this.hal));
    router.use('/host', HostHandler(this));
    router.use('/user', UserHandler(this.hal, this.conf.mgm.templates));
    router.use('/region', RegionHandler(this, this.hal, this.conf.console));
    router.use('/group', GroupHandler(this.hal));

    router.use('/fsapi', FreeswitchHandler(fs));

    router.use('/offline', OfflineMessageHandler());

    router.use('/server/dispatch', DispatchHandler(this));

    router.get('/', (req, res) => {
      res.send('MGM');
    });

    router.get('/get_grid_info', (req, res) => {
      res.send('<?xml version="1.0"?><gridinfo><login>' +
        this.conf.grid_info.login +
        '</login><register>' +
        this.conf.grid_info.mgm +
        '</register><welcome>' +
        this.conf.grid_info.mgm + '\welcome.html' +
        '</welcome><password>' +
        this.conf.grid_info.mgm +
        '</password><gridname>' +
        this.conf.grid_info.gridName +
        '</gridname><gridnick>' +
        this.conf.grid_info.gridNick +
        '</gridnick><about>' +
        this.conf.grid_info.mgm +
        '</about><economy>' +
        this.conf.grid_info.mgm +
        '</economy></gridinfo>');
    });

    router.get('/map/regions', (req, res) => {
      if (!req.cookies['uuid']) {
        res.send(JSON.stringify({ Success: false, Message: 'No session found' }));
        return;
      }

      this.getAllRegions().then((regions: Region[]) => {
        let result = [];
        for (let r of regions) {
          result.push({
            Name: r.name,
            x: r.locX,
            y: r.locY
          })
        }
        res.send(JSON.stringify(result));
      }).catch((err: Error) => {
        res.send(JSON.stringify({ Success: false, Message: err.message }));
      });
    });

    router.post('/register/submit', (req, res) => {
      console.log('Received registration request.  Not Implemented');
      res.send(JSON.stringify({ Success: false, Message: 'Not Implemented' }));
    });

    return router;
  }

  deleteJob(j: Job): Promise<void> {
    return this.db.jobs.delete(j.id);
  }
  updateJob(j: Job): Promise<Job> {
    return this.db.jobs.update(j);
  }

  getJob(id: number): Promise<Job> {
    return this.db.jobs.get(id);
  }

  getJobsFor(id: UUIDString): Promise<Job[]> {
    return this.db.jobs.getFor(id);
  }

  insertJob(j: Job): Promise<Job> {
    return this.db.jobs.insert(j);
  }

  getAllRegions(): Promise<Region[]> {
    return this.db.regions.getAll();
  }

  getRegionsFor(id: UUIDString): Promise<Region[]> {
    return this.db.regions.getFor(id);
  }

  getRegion(id: UUIDString): Promise<Region> {
    return this.db.regions.get(id);
  }

  getHost(ip: string): Promise<Host> {
    return this.db.hosts.get(ip);
  }

  getHosts(): Promise<Host[]> {
    return this.db.hosts.getAll();
  }

  getRegionsOn(h: Host): Promise<Region[]> {
    return this.db.regions.getOn(h.address);
  }

  getRegionByName(name: string): Promise<Region> {
    return this.db.regions.getByName(name);
  }

  updateRegion(r: Region): Promise<Region> {
    return this.db.regions.update(r);
  }

  updateHost(h: Host): Promise<Host> {
    return this.db.hosts.update(h);
  }

  updateHostStats(h: Host, stats: string): Promise<Host> {
    return this.db.hosts.updateStats(h, stats);
  }

  updateRegionStats(r: Region, isRunning: boolean, stats: string): Promise<void> {
    return this.db.regions.updateStats(r, isRunning, stats);
  }

  deleteHost(address: string): Promise<void> {
    return this.db.hosts.delete(address);
  }

  insertHost(address: string): Promise<void> {
    return this.db.hosts.insert(address);
  }

  insertRegion(r: Region): Promise<Region> {
    return this.db.regions.insert(r);
  }

  destroyRegion(r: Region): Promise<void> {
    return this.db.regions.delete(r);
  }

  startRegion(r: Region, h: Host): Promise<void> {
    console.log('starting ' + r.name);
    let client = urllib.create();
    let url = 'http://' + h.address + ':' + h.port + '/start/' + r.uuid.toString();
    return client.request(url).then((body) => {
      let result = JSON.parse(body.data);
      if (result.Success) {
        return Promise.resolve();
      } else {
        return Promise.reject(new Error(result.Message));
      }
    });
  }

  stopRegion(r: Region, h: Host): Promise<void> {
    console.log('halting ' + r.name);
    let client = urllib.create();
    let url = 'http://' + h.address + ':' + h.port + '/stop/' + r.uuid.toString();
    return client.request(url).then((body) => {
      let result = JSON.parse(body.data);
      if (result.Success) {
        return Promise.resolve();
      } else {
        return Promise.reject(new Error(result.Message));
      }
    });
  }

  consoleCommand(r: Region, h: Host, cmd: string): Promise<void> {
    let client = urllib.create();
    let url = 'http://' + h.address + ':' + h.port + '/consoleCmd/' + r.uuid.toString();
    return client.request(url, {
      method: 'POST',
      data: { "cmd" : cmd }
    }).then((body) => {
      let result = JSON.parse(body.data);
      if (result.Success) {
        return Promise.resolve();
      } else {
        return Promise.reject(new Error(result.Message));
      }
    });
  }

  saveOar(r: Region, h: Host, j: Job): Promise<void> {
    console.log('triggering oar save for ' + r.name);
    let client = urllib.create();
    let url = 'http://' + h.address + ':' + h.port + '/saveOar/' + r.uuid.toString() + '/' + j.id;
    return client.request(url).then((body) => {
      let result = JSON.parse(body.data);
      if (result.Success) {
        return Promise.resolve();
      } else {
        return Promise.reject(new Error(result.Message));
      }
    });
  }

  loadOar(r: Region, h: Host, j: Job): Promise<void> {
    console.log('triggering oar load for ' + r.name);
    let client = urllib.create();
    let url = 'http://' + h.address + ':' + h.port + '/loadOar/' + r.uuid.toString() + '/' + j.id;
    return client.request(url).then((body) => {
      let result = JSON.parse(body.data);
      if (result.Success) {
        return Promise.resolve();
      } else {
        return Promise.reject(new Error(result.Message));
      }
    });
  }

  killRegion(r: Region, h: Host): Promise<void> {
    console.log('killing ' + r.name);
    let client = urllib.create();
    let url = 'http://' + h.address + ':' + h.port + '/kill/' + r.uuid.toString();
    return client.request(url).then((body) => {
      let result = JSON.parse(body.data);
      if (result.Success) {
        return Promise.resolve();
      } else {
        return Promise.reject(new Error(result.Message));
      }
    });
  }

  setRegionCoordinates(r: Region, x: number, y: number): Promise<void> {
    return this.db.regions.setCoordinates(r, x, y);
  }

  removeRegionFromHost(r: Region, h: Host): Promise<void> {
    let client = urllib.create();
    return client.request('http://' + h.address + ':' + h.port + '/region/' + r.name + '/remove');
  }

  putRegionOnHost(r: Region, h: Host): Promise<void> {
    //host may be null

    //update region in mysql
    return this.db.regions.setHost(r, h.address || '').then(() => {
      //sql is updated, contact new host
      if (h === null) {
        return Promise.resolve();
      }

      let client = urllib.create();
      return new Promise<void>((resolve, reject) => {
        client.request('http://' + h.address + ':' + h.port + '/region/' + r.name + '/add', { timeout: 10000 }).then(() => {
          resolve();
        }).catch(() => {
          reject(new Error('Region assignment recorded, but could not contac tthe host'));
        })
      });
    });
  }

  getConfigs(r: Region): Promise<{ [key: string]: { [key: string]: string } }> {
    return this.db.regions.getConfigs(r);
  }

  getRegionINI(r: Region): Promise<{ [key: string]: { [key: string]: string } }> {
    let connString: string = 'Data Source=' + this.conf.halcyon.db_host + ';Database=' + this.conf.halcyon.db_name + ';User ID=' + this.conf.halcyon.db_user + ';Password=' + this.conf.halcyon.db_pass + ';';

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
    config['Network']['http_listener_port'] = '' + r.httpPort;
    config['Network']['default_location_x'] = '' + r.locX;
    config['Network']['default_location_y'] = '' + r.locY;
    config['Network']['hostname'] = r.externalAddress;
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
