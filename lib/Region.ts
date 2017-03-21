import { IRegion, IHost, IJob, IUser } from './types';
import { Config } from './Config';
import { Store } from './Store';
import * as urllib from 'urllib';
import Promise = require('bluebird');
import * as formstream from 'formstream';
import { RemoteAdmin } from './RemoteAdmin';
import { HalcyonJWT } from './Auth';

export function RemoveRegionFromHost(r: IRegion, h: IHost): Promise<void> {
  return urllib.request('http://' + h.address + ':' + h.port + '/remove/' + r.uuid);
}

export function PutRegionOnHost(store: Store, r: IRegion, h: IHost): Promise<void> {
  return store.Regions.setHost(r, h).then((r: IRegion) => {
    if (h === null) {
      return Promise.resolve();
    }
    return urllib.request('http://' + h.address + ':' + h.port + '/add/' + r.uuid + '/' + r.name, { timeout: 10000 });;
  });
}

/**
 * Stop a region by connecting to it's RemoteAdmin xmlrpc endpoint and issuing shutdown
 * @param region The region to be halted
 * @param user The user requesting the action
 */
export function StopRegion(region: IRegion, user: IUser): Promise<void> {
  console.log('halting ' + region.uuid);
  let admin: RemoteAdmin
  return HalcyonJWT.instance().GetAdminToken(user).then((token: string) => {
    admin = new RemoteAdmin(region);
    return admin.login(token);
  }).then(() => {
    return admin.shutdown(region);
  });
}

/**
 * Stop a region by connecting to it's mgmNode instance and killing the process
 * @param region The region to be halted
 * @param host the host containing the region
 */

export function KillRegion(r: IRegion, h: IHost): Promise<void> {
  console.log('killing ' + r.uuid);
  let url = 'http://' + h.address + ':' + h.port + '/kill/' + r.uuid;
  return urllib.request(url).then((body) => {
    let result = JSON.parse(body.data);
    if (!result.Success) {
      throw new Error(result.Message);
    }
  });
}

/**
 * Start a region by contacting it's mgmnode instance
 * @param region
 * @param host
 */
export function StartRegion(r: IRegion, h: IHost): Promise<void> {
  console.log('starting ' + r.uuid);
  let url = 'http://' + h.address + ':' + h.port + '/start/' + r.uuid;
  return urllib.request(url).then((body) => {
    let result = JSON.parse(body.data);
    if (!result.Success) {
      throw new Error(result.Message);
    }
  });
}

/**
 * Save an oar file by connecting via RemoteAdmin, then asking mgmNode to track and upload the file
 * @param region Save a regions oar by first triggering the save through RemoteAdmin, then queueing mgmNode to retrieve the file
 * @param host
 * @param user
 * @param job
 */

export function SaveOar(region: IRegion, host: IHost, job: IJob, user: IUser): Promise<void> {
  console.log('triggering oar save for ' + region.uuid);
  let admin: RemoteAdmin;
  return HalcyonJWT.instance().GetAdminToken(user).then((token: string) => {
    admin = new RemoteAdmin(region);
    return admin.login(token);
  }).then(() => {
    return admin.saveOar(region);
  }).then(() => {
    return admin.logout();
  }).then(() => {
    // ask mgmNode to watch the file and upload when complete
    let url = 'http://' + host.address + ':' + host.port + '/saveOar/' + region.uuid + '/' + job.id;
    return urllib.request(url).then((body) => {
      let result = JSON.parse(body.data);
      if (!result.Success) {
        throw new Error(result.Message);
      }
    });
  });
}

/**
 * 
 * @param r Load on oar by pushing the file to mgmNode, then triggering th load over RemoteAdmin
 * @param h 
 * @param j 
 */
export function LoadOar(r: IRegion, h: IHost, j: IJob, u: IUser, oarPath?: string): Promise<void> {
  console.log('triggering oar load for ' + r.uuid);
  let admin: RemoteAdmin

  let form = formstream();
  switch (j.type) {
    case 'nuke':
      form.file('oarFile', oarPath, r.name + '.oar');
      break;
    default:
      let datum = JSON.parse(j.data);
      form.file('oarFile', datum.File, r.name + '.oar');
      break;
  }

  form.field('jobID', j.id);

  let url = 'http://' + h.address + ':' + h.port + '/loadOar/' + r.uuid + '/';
  return urllib.request(url, {
    method: 'POST',
    headers: form.headers(),
    stream: form
  }).then((body) => {
    let result = JSON.parse(body.data);
    if (!result.Success) {
      throw new Error(result.Message);
    }
  }).then(() => {
    return HalcyonJWT.instance().GetAdminToken(u);
  }).then((token: string) => {
    admin = new RemoteAdmin(r);
    return admin.login(token);
  }).then(() => {
    return admin.loadOar(r);
  }).then(() => {
    return admin.logout();
  })

}

export function RegionINI(r: IRegion, conf: Config): { [key: string]: { [key: string]: string } } {
  let connString: string = 'Data Source=' + conf.main.lanIP +
    ';Database=' + conf.haldb.database +
    ';User ID=' + conf.haldb.user +
    ';Password=' + conf.haldb.password + ';';

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
  config['Network']['http_listener_port'] = '' + r.port;
  config['Network']['default_location_x'] = '' + r.x;
  config['Network']['default_location_y'] = '' + r.y;
  config['Network']['hostname'] = r.publicAddress;
  config['Network']['http_listener_ssl'] = 'false';
  config['Network']['grid_server_url'] = conf.halcyon.grid_server;
  config['Network']['grid_send_key'] = 'null';
  config['Network']['grid_recv_key'] = 'null';
  config['Network']['user_server_url'] = conf.halcyon.user_server;
  config['Network']['user_send_key'] = 'null';
  config['Network']['user_recv_key'] = 'null';
  config['Network']['asset_server_url'] = conf.halcyon.whip;
  config['Network']['messaging_server_url'] = conf.halcyon.messaging_server;
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
  config['Messaging']['OfflineMessageURL'] = conf.offlinemessages.api_url;
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
  config['SimulatorFeatures']['MapImageServerURI'] = conf.main.publicIP;
  config['SimulatorFeatures']['SearchServerURI'] = conf.main.publicIP;
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

  config['FreeSwitchVoice'] = {};
  config['FreeSwitchVoice']['enabled'] = 'true';
  config['FreeSwitchVoice']['account_service'] = conf.freeswitch.api_url;

  return config;
}
