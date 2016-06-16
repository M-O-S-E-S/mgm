
import { SqlConnector } from './sqlConnector';
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

import * as express from 'express';
import * as http from 'http';

import * as request from 'request';
import fs = require('fs');
import { RestConsole, ConsoleSession } from './console';

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
  }
  console: {
    user: string,
    pass: string
  }
}

export class MGM {
  private conf: Config
  private sql: SqlConnector
  private hal: HAL

  constructor(config: Config) {
    this.conf = config;
    this.sql = new SqlConnector(config)
    this.hal = new HAL(config.halcyon);
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
    router.use('/auth', AuthHandler(this.hal));
    router.use('/console', ConsoleHandler(this, this.conf.console));
    router.use('/task', TaskHandler(this, this.conf.mgm.upload_dir));
    router.use('/estate', EstateHandler(this.hal));
    router.use('/host', HostHandler(this));
    router.use('/user', UserHandler(this.hal, this.conf.mgm.templates));
    router.use('/region', RegionHandler(this, this.hal, this.conf.console, this.conf.mgm.log_dir));
    router.use('/group', GroupHandler(this.hal));

    router.use('/server/dispatch', DispatchHandler(this, this.conf.mgm.log_dir));

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

  //perform job tasking asynchronously
  doJob(j: Job) {
    let datum = JSON.parse(j.data);

    switch (j.type) {
      case 'load_oar':
        /*loading oar is a multi step job:
         * 1 - push file to mgmNode
         * 2 - trigger oar load on console
         * 3 - observe logs for oar completion
        */
        let region: Region;
        let host: Host;
        let oarPath: string;
        console.log('beginning task load oar');
        this.getRegion(new UUIDString(datum.Region)).then((r: Region) => {
          region = r;
          return this.getHost(r.slaveAddress);
        }).then((h: Host) => {
          host = h;
          console.log('uploading oar to mgmNode');
          datum.Status = 'Copying...';
          j.data = JSON.stringify(datum);
          this.updateJob(j);
          return new Promise<string>((resolve, reject) => {

            var formData = {
              fileData: fs.createReadStream(datum.File),
            }

            request.post({
              url: 'http://' + h.address + ':' + h.port + '/upload',
              formData: formData
            }, (err, res, body) => {
                if (err) return reject(err);
                try {
                  let result = JSON.parse(body);
                  if(result.Success){
                    resolve(result.File);
                  } else {
                    reject(new Error('Cannot push file to mgmNode'));
                  }
                } catch(err){
                  reject(new Error('Error sending file to mgmNode'));
                }
              })
          });
        }).then((uri: string) => {
          // open a console and trigger the load
          oarPath = uri;
          let session: ConsoleSession;
          return RestConsole.open(region.slaveAddress, region.consolePort, this.conf.console.user, this.conf.console.pass)
          .then((cs: ConsoleSession) => {
            session = cs;
            return RestConsole.write(session, 'load oar ' + oarPath);
          }).then( () => {
            return RestConsole.close(session);
          })
        }).then( () => {
          datum.Status = 'Loading Oar...';
          j.data = JSON.stringify(datum);
          this.updateJob(j);
          console.log('load oar triggered successfuly');
        }).then( () => {
          //monitor region log for oar change
        }).finally( () => {
          //pull file back off of mgmNode whether we succeed or fail
          //request.get('http://' + host.address + ':' + host.port + '/delete/' + oarPath.slice(-36))
        }).catch((err: Error) => {
          console.log('load oar failed: ' + err.message);
          datum.Status = 'Failed:' + err.message;
          j.data = JSON.stringify(datum);
          this.updateJob(j);
        })

      default:
        console.log('No worker present for job type: ' + j.type);
        datum.Status = 'Worker Not Implemented';
        j.data = JSON.stringify(datum);
        this.updateJob(j);
    }
  }

  deleteJob(j: Job): Promise<void> {
    return this.sql.deleteJob(j.id);
  }
  updateJob(j: Job): Promise<Job> {
    return this.sql.updateJob(j);
  }

  getJob(id: number): Promise<Job> {
    return this.sql.getJob(id).then((row: any) => {
      return this.buildJob(row);
    });
  }

  getJobsFor(id: UUIDString): Promise<Job[]> {
    return this.sql.getJobsFor(id).then((rows: any[]) => {
      let jobs: Job[] = [];
      for (let r of rows) {
        jobs.push(this.buildJob(r));
      }
      return jobs;
    });
  }

  insertJob(j: Job): Promise<Job> {
    return this.sql.insertJob(j);
  }

  getAllRegions(): Promise<Region[]> {
    return this.sql.getAllRegions().then((rows: any[]) => {
      let regions: Region[] = [];
      for (let r of rows) {
        regions.push(this.buildRegion(r));
      }
      return regions;
    });
  }

  getRegionsFor(id: UUIDString): Promise<Region[]> {
    return this.sql.getRegionsFor(id).then((rows: any[]) => {
      let regions: Region[] = [];
      for (let r of rows) {
        regions.push(this.buildRegion(r));
      }
      return regions;
    })
  }

  getRegion(id: UUIDString): Promise<Region> {
    return this.sql.getRegion(id).then((row: any) => {
      return this.buildRegion(row);
    });
  }

  getHost(ip: string): Promise<Host> {
    return this.sql.getHost(ip).then((row) => {
      return this.buildHost(row);
    });
  }

  getHosts(): Promise<Host[]> {
    return this.sql.getHosts().then((rows: any[]) => {
      let hosts: Host[] = [];
      for (let r of rows) {
        hosts.push(this.buildHost(r));
      }
      return hosts;
    })
  }

  getRegionsOn(h: Host): Promise<Region[]> {
    return this.sql.getRegionsOn(h).then((rows: any[]) => {
      let regions: Region[] = [];
      for (let r of rows) {
        regions.push(this.buildRegion(r));
      }
      return regions;
    })
  }

  getRegionByName(name: string): Promise<Region> {
    return this.sql.getRegionByName(name).then((row: any) => {
      return this.buildRegion(row);
    })
  }

  updateRegion(r: Region): Promise<Region> {
    return this.sql.updateRegion(r);
  }

  updateHost(h: Host): Promise<Host> {
    return this.sql.updateHost(h);
  }

  updateHostStats(h: Host, stats: string): Promise<Host> {
    return this.sql.updateHostStats(h, stats);
  }

  updateRegionStats(r: Region, isRunning: boolean, stats: string): Promise<void> {
    return this.sql.updateRegionStats(r, isRunning, stats);
  }

  deleteHost(address: string): Promise<void> {
    return this.sql.deleteHost(address);
  }

  insertHost(address: string): Promise<void> {
    return this.sql.insertHost(address);
  }

  insertRegion(r: Region): Promise<Region> {
    r.status = {};
    return this.sql.insertRegion(r);
  }

  destroyRegion(r: Region): Promise<void> {
    return this.sql.destroyRegion(r);
  }

  startRegion(r: Region, h: Host): Promise<void> {
    console.log('starting ' + r.name);
    let client = urllib.create();
    let url = 'http://' + h.address + ':' + h.port + '/region/' + r.name + '/start';
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
    console.log('terminating ' + r.name);
    let client = urllib.create();
    let url = 'http://' + h.address + ':' + h.port + '/region/' + r.name + '/stop';
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
    return this.sql.setRegionCoordinates(r, x, y);
  }

  removeRegionFromHost(r: Region, h: Host): Promise<void> {
    let client = urllib.create();
    return client.request('http://' + h.address + ':' + h.port + '/region/' + r.name + '/remove');
  }

  putRegionOnHost(r: Region, h: Host): Promise<void> {
    //host may be null

    //update region in mysql
    return this.sql.setHostForRegion(r, h).then(() => {
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
    return this.sql.getConfigs(r);
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
    config['Startup']['permissionmodules'] = 'DefaultPermissionModule';
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
    config['Network']['ConsoleUser'] = r.consoleUname.toString();
    config['Network']['ConsolePass'] = r.consolePass.toString();
    config['Network']['console_port'] = '' + r.consolePort;

    config['Chat'] = {};
    config['Chat']['enabled'] = 'true';
    config['Chat']['whisper_distance'] = '10';
    config['Chat']['say_distance'] = '30';
    config['Chat']['shout_distance'] = '100';

    config['Messaging'] = {};
    config['Messaging']['InstantMessageModule'] = 'InstantMessageModule';
    config['Messaging']['MessageTransferModule'] = 'MessageTransferModule';
    config['Messaging']['OfflineMessageModule'] = 'OfflineMessageModule';

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

  private buildJob(row: any): Job {
    let j: Job = {
      id: row.id,
      timestamp: row.timestamp,
      type: row.type,
      user: new UUIDString(row.user),
      data: row.data
    }
    return j;
  }

  private buildHost(row: any): Host {
    let h = new Host;
    h.address = row.address;
    h.port = row.port;
    h.name = row.name;
    //h.cmd_key = new UUIDString(rows[0].cmd_key);
    h.slots = row.slots;
    h.status = JSON.parse(row.status);
    return h;
  }

  private buildRegion(row: any): Region {
    let r = new Region()
    r.uuid = new UUIDString(row.uuid);
    r.name = row.name;
    r.size = row.size;
    r.httpPort = row.httpPort;
    r.consolePort = row.consolePort;
    // halcyon does not use these for console connectivity
    //r.consoleUname = new UUIDString(row.consoleUname);
    //r.consolePass = new UUIDString(row.consolePass);
    r.locX = row.locX;
    r.locY = row.locY;
    r.externalAddress = row.externalAddress;
    r.slaveAddress = row.slaveAddress;
    r.isRunning = row.isRunning;
    r.status = JSON.parse(row.status);
    return r;
  }
}
