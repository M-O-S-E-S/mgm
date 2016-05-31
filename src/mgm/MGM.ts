
import { SqlConnector } from './sqlConnector';
import { Job } from './Job';
import { Region } from './Region';
import { Host } from './host';
import { UUIDString } from '../halcyon/UUID';

var urllib = require('urllib');

export interface mgmConfig {
  db_host: string
  db_user: string
  db_pass: string
  db_name: string
}

export interface halcyonConfig {
  db_host: string
  db_user: string
  db_pass: string
  db_name: string
  grid_server: string
  user_server: string
  messaging_server: string
  whip: string
}

export class MGM {
  private conf: halcyonConfig
  private sql: SqlConnector

  constructor(c: mgmConfig, h: halcyonConfig) {
    this.conf = h;
    this.sql = new SqlConnector(c)
  }

  getJobsFor(id: UUIDString): Promise<Job[]> {
    return this.sql.getJobsFor(id).then((rows: any[]) => {
      let jobs: Job[] = [];
      for (let r of rows) {
        let j = new Job()
        j.timestamp = r.timestamp;
        j.type = r.type;
        j.user = new UUIDString(r.user);
        j.data = r.data;
        jobs.push(j);
      }
      return jobs;
    });
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
        client.request('http://' + h.address + ':' + h.port + '/region/' + r.name + '/add').then(() => {
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
    let connString: string = 'Data Source=' + this.conf.db_host + ';Database=' + this.conf.db_name + ';User ID=' + this.conf.db_user + ';Password=' + this.conf.db_pass + ';';

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
    config['Startup']['use_aperture_server'] = 'no';
    config['Startup']['aperture_server_port'] = '8000';
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
    config['Network']['grid_server_url'] = this.conf.grid_server;
    config['Network']['grid_send_key'] = 'null';
    config['Network']['grid_recv_key'] = 'null';
    config['Network']['user_server_url'] = this.conf.user_server;
    config['Network']['user_send_key'] = 'null';
    config['Network']['user_recv_key'] = 'null';
    config['Network']['asset_server_url'] = this.conf.whip;
    config['Network']['messaging_server_url'] = this.conf.messaging_server;
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
    config['SimulatorFeatures']['MapImageServerURI'] = this.conf.user_server;
    config['SimulatorFeatures']['SearchServerURI'] = this.conf.user_server;
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
