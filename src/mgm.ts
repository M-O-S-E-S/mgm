
/// <reference path="../typings/index.d.ts" />

import * as express from 'express';
import * as bodyParser from 'body-parser';
import * as path from "path";

import { Sql } from './mysql/sql';
import { MGM } from './mgm/MGM';
import { SqlConnector as HAL } from './halcyon/sqlConnector';
import { User } from './halcyon/User';
import { Host } from './mgm/host';
import { UUIDString } from './halcyon/UUID';
import { Job } from './mgm/Job';
import { Region } from './mgm/Region';
import { Estate } from './halcyon/estate';
import { Group } from './halcyon/Group';
import { RestConsole, ConsoleSession } from './mgm/console';

var conf = require('../settings.js');

let mgm = new MGM(conf.mgm, conf.halcyon);
let hal = new HAL(new Sql(conf.halcyon));

import fs = require("fs");
if (!fs.exists(path.join(__dirname, 'log'))) {
  fs.mkdir(path.join(__dirname, 'log'), (err) => {
    if (err && err.code !== "EEXIST")
      throw err
  });
}

let app = express();

var cookieParser = require('cookie-parser')
app.use(cookieParser('super-secret-cookie-session-key!!!1!'));

//var bodyParser = require('body-parser')
app.use(bodyParser.json({ limit: '1gb' }));       // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
  extended: true,
  limit: '1gb'
}));

app.get('/', (req, res) => {
  res.send('MGM');
});

app.get('/get_grid_info', (req, res) => {
  res.send('<?xml version="1.0"?><gridinfo><login>' +
    conf.grid_info.login +
    '</login><register>' +
    conf.grid_info.mgm +
    '</register><welcome>' +
    conf.grid_info.mgm + '\welcome.html' +
    '</welcome><password>' +
    conf.grid_info.mgm +
    '</password><gridname>' +
    conf.grid_info.gridName +
    '</gridname><gridnick>' +
    conf.grid_info.gridNick +
    '</gridnick><about>' +
    conf.grid_info.mgm +
    '</about><economy>' +
    conf.grid_info.mgm +
    '</economy></gridinfo>');
});

app.get('/region/logs/:uuid', (req, res) => {
  if (!req.cookies['uuid']) {
    res.send(JSON.stringify({ Success: false, Message: 'No session found' }));
    return;
  }

  let regionID = new UUIDString(req.params.uuid);
  mgm.getRegion(regionID).then((r: Region) => {
    res.sendFile(path.join(__dirname, 'log', r.name));
  }).catch((err: Error) => {
    res.send(JSON.stringify({ Success: false, Message: err.message }));
  });
});

app.post('/server/dispatch/logs/:name', (req, res) => {
  let regionName = req.params.name;
  let remoteIP: string = req.ip.split(':').pop();
  mgm.getHost(remoteIP).then((host: Host) => {
    return mgm.getRegionByName(regionName);
  }).then((r: Region) => {
    let logs: string[] = JSON.parse(req.body.log);
    fs.appendFile(path.join(__dirname, 'log/' + r.name), logs.join('\n'));
  }).catch((err: Error) => {
    res.send(JSON.stringify({ Success: false, Message: err.message }));
  });
});

app.post('/console/open/:uuid', (req, res) => {
  if (!req.cookies['uuid']) {
    res.send(JSON.stringify({ Success: false, Message: 'No session found' }));
    return;
  }
  let regionID = new UUIDString(req.params.uuid);
  mgm.getRegion(regionID).then((r: Region) => {
    if (!r.isRunning) {
      throw new Error('Region must be running to open a console');
    }
    return RestConsole.open(r.slaveAddress, r.consolePort, conf.console.user, conf.console.pass);
  }).then((session: ConsoleSession) => {
    res.cookie('console', session);
    res.send(JSON.stringify({ Success: true, Prompt: session.prompt }));
  }).catch((err: Error) => {
    res.send(JSON.stringify({ Success: false, Message: err.message }));
  });
});

app.post('/console/read/:uuid', (req, res) => {
  if (!req.cookies['console']) {
    res.send(JSON.stringify({ Success: false, Message: 'No session found' }));
    return;
  }
  let regionID = new UUIDString(req.params.uuid);
  mgm.getRegion(regionID).then((r: Region) => {
    if (!r.isRunning) {
      throw new Error('Region is no longer running');
    }
    return RestConsole.read(req.cookies['console']);
  }).then((lines) => {
    res.send(JSON.stringify({ Success: true, Lines: lines }));
  }).catch((err: Error) => {
    res.send(JSON.stringify({ Success: false, Message: err.message }));
  });
});

app.post('/console/close/:uuid', (req, res) => {
  if (!req.cookies['console']) {
    res.send(JSON.stringify({ Success: false, Message: 'No session found' }));
    return;
  }
  let regionID = new UUIDString(req.params.uuid);
  mgm.getRegion(regionID).then((r: Region) => {
    if (!r.isRunning) {
      throw new Error('Region is no longer running');
    }
    return RestConsole.close(req.cookies['console']);
  }).then(() => {
    res.send(JSON.stringify({ Success: true }));
  }).catch((err: Error) => {
    res.send(JSON.stringify({ Success: false, Message: err.message }));
  });
});

app.post('/console/write/:uuid', (req, res) => {
  if (!req.cookies['console']) {
    res.send(JSON.stringify({ Success: false, Message: 'No session found' }));
    return;
  }
  let regionID = new UUIDString(req.params.uuid);
  let command: string = req.body.command;
  mgm.getRegion(regionID).then((r: Region) => {
    if (!r.isRunning) {
      throw new Error('Region is no longer running');
    }
    return RestConsole.write(req.cookies['console'], command);
  }).then(() => {
    res.send(JSON.stringify({ Success: true }));
  }).catch((err: Error) => {
    res.send(JSON.stringify({ Success: false, Message: err.message }));
  });
});


//resume session
app.get('/auth', (req, res) => {
  if (req.cookies['uuid'] && req.cookies['uuid'] != '') {
    console.log('User ' + req.cookies['uuid'] + ' resuming session');

    res.send(JSON.stringify({
      Success: true,
      username: req.cookies['name'],
      accessLevel: req.cookies['userLevel'],
      email: req.cookies['email']
    }));
  } else {
    res.send(JSON.stringify({
      Success: false
    }));
  }
});

app.get('/task', (req, res) => {
  if (!req.cookies['uuid']) {
    res.send(JSON.stringify({ Success: false, Message: 'No session found' }));
    return;
  }

  mgm.getJobsFor(new UUIDString(req.cookies['uuid'])).then((jobs: Job[]) => {
    res.send(JSON.stringify({
      Success: true,
      Tasks: jobs
    }));
  }).catch((err: Error) => {
    res.send(JSON.stringify({ Success: false, Message: err.message }));
  });
});

app.get('/map/regions', (req, res) => {
  if (!req.cookies['uuid']) {
    res.send(JSON.stringify({ Success: false, Message: 'No session found' }));
    return;
  }

  mgm.getAllRegions().then((regions: Region[]) => {
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

app.get('/group', (req, res) => {
  if (!req.cookies['uuid']) {
    res.send(JSON.stringify({ Success: false, Message: 'No session found' }));
    return;
  }

  hal.getGroups().then((groups: Group[]) => {
    let result = [];
    for (let g of groups) {
      let r = {
        ShowInList: g.ShowInList,
        InsigniaID: g.InsigniaID.toString(),
        MaturePublish: g.MaturePublish,
        FounderID: g.FounderID.toString(),
        EveryOnePowers: '?',
        OwnerRoleID: g.OwnerRoleID.toString(),
        OwnerPowers: '?',
        uuid: g.GroupID.toString(),
        name: g.Name,
        members: [],
        roles: []
      };
      for (let m of g.Members) {
        r.members.push({
          OwnerID: m.AgentID
        });
      }
      for (let m of g.Roles) {
        r.roles.push({
          Name: m.Name,
          Description: m.Description,
          Title: m.Title,
          Powers: '?',
          roleID: m.RoleID.toString()
        })
      }
      result.push(r);
    }
    res.send(JSON.stringify({ Success: true, Groups: result }));
  }).catch((err: Error) => {
    res.send(JSON.stringify({ Success: false, Message: err.message }));
  })
});

app.get('/region', (req, res) => {
  if (!req.cookies['uuid']) {
    res.send(JSON.stringify({ Success: false, Message: 'No session found' }));
    return;
  }
  let regions: Region[];
  let w;
  if (req.cookies['userLevel'] >= 250) {
    w = mgm.getAllRegions();
  } else {
    w = mgm.getRegionsFor(new UUIDString(req.cookies['uuid']));
  }
  function toMGMDate(delta: number): string {
    var days = Math.floor(delta / 86400);
    delta -= days * 86400;
    var hours = Math.floor(delta / 3600) % 24;
    delta -= hours * 3600;
    var minutes = Math.floor(delta / 60) % 60;
    delta -= minutes * 60;
    var seconds = delta % 60;
    return days + '.' + hours + ':' + minutes + ':' + seconds;
  }
  w.then((rs: Region[]) => {
    regions = rs;
    return hal.getEstates();
  }).then( (estates: Estate[]) => {
    let result = [];
    for (let r of regions) {
      let estateName: string = '';
      for(let e of estates){
        for(let reg of e.regions){
          if(reg.toString() === r.uuid.toString()){
            estateName = e.name;
          }
        }
      }
      r.status['simStats'] = { 'Uptime': toMGMDate(r.status.uptime) };
      result.push({
        uuid: r.uuid.toString(),
        name: r.name,
        x: r.locX,
        y: r.locY,
        size: r.size,
        estateName: estateName,
        status: r.status,
        node: r.slaveAddress ? r.slaveAddress : '',
        isRunning: r.isRunning,
      });
    }

    res.send(JSON.stringify({
      Success: true,
      Regions: result
    }));
  });
});

app.get('/region/config/:uuid?', (req, res) => {
  if (!req.cookies['uuid']) {
    res.send(JSON.stringify({ Success: false, Message: 'No session found' }));
    return;
  }

  if (req.cookies['userLevel'] < 250) {
    res.send(JSON.stringify({ Success: false, Message: 'Permission Denied' }));
    return;
  }

  let regionID = req.params.uuid;
  let p;
  if (regionID) {
    p = mgm.getRegion(new UUIDString(regionID)).then((r: Region) => {
      return mgm.getConfigs(r);
    });

  } else {
    p = mgm.getConfigs(null);
  }
  p.then((configs) => {
    res.send(JSON.stringify({ Success: true, Config: configs }));
  }).catch((err) => {
    res.send(JSON.stringify({ Success: false, Message: err.message }));
  })
});

app.post('/region/start/:regionID', (req, res) => {
  if (!req.cookies['uuid']) {
    res.send(JSON.stringify({ Success: false, Message: 'No session found' }));
    return;
  }

  if (req.cookies['userLevel'] < 250) {
    res.send(JSON.stringify({ Success: false, Message: 'Permission Denied' }));
    return;
  }

  let regionID = new UUIDString(req.params.regionID);
  let r: Region

  mgm.getRegion(regionID).then((region: Region) => {
    r = region;
    return mgm.getHost(r.slaveAddress);
  }).then((h: Host) => {
    return mgm.startRegion(r, h);
  }).then(() => {
    res.send(JSON.stringify({ Success: true }));
  }).catch((err: Error) => {
    res.send(JSON.stringify({ Success: false, Message: err.message }));
  })
});

app.get('/user', (req, res) => {
  if (!req.cookies['uuid']) {
    res.send(JSON.stringify({ Success: false, Message: 'No session found' }));
    return;
  }

  hal.getAllUsers().then((users: User[]) => {
    //map these to simina appearing users for current MGM front-end
    let result: any[] = [];
    let counter = 0;
    for (let u of users) {
      result.push({
        name: u.username + ' ' + u.lastname,
        uuid: u.UUID.toString(),
        email: u.email + counter,
        userLevel: u.godLevel,
        identities: [{
          Identifier: u.username + ' ' + u.lastname,
          Enabled: true
        }],
        group: ''
      });
      counter++;
    }
    res.send(JSON.stringify({
      Success: true,
      Users: result,
      Pending: []
    }));
  });
});

app.get('/estate', (req, res) => {
  if (!req.cookies['uuid']) {
    res.send(JSON.stringify({ Success: false, Message: 'No session found' }));
    return;
  }

  hal.getEstates().then((estates: Estate[]) => {
    let result: any[] = []
    for(let r of estates){
      result.push({
        id: r.id,
        name: r.name,
        owner: r.owner.toString(),
        managers: r.managers.map( (id: UUIDString) => { return id.toString(); }),
        regions: r.regions.map( (id: UUIDString) => { return id.toString(); }),
      });
    }
    res.send(JSON.stringify({
      Success: true,
      Estates: result
    }));
  }).catch((err: Error) => {
    res.send(JSON.stringify({
      Success: false,
      Message: err.message
    }));
  })

});

app.get('/host', (req, res) => {
  if (!req.cookies['uuid']) {
    res.send(JSON.stringify({ Success: false, Message: 'No session found' }));
    return;
  }

  if (req.cookies['userLevel'] < 250) {
    res.send(JSON.stringify({ Success: false, Message: 'Permission Denied' }));
    return;
  }

  mgm.getHosts().then((hosts: Host[]) => {
    res.send(JSON.stringify({
      Success: true,
      Hosts: hosts
    }));
  });
});

app.get('/auth/logout', (req, res) => {
  if (req.cookies['uuid']) {
    console.log('User ' + req.cookies['uuid'] + ' logging out');

    res.clearCookie('name');
    res.clearCookie('uuid');
    res.clearCookie('userLevel');
    res.clearCookie('email');
    res.send(JSON.stringify({
      Success: true
    }));
  }
});

app.post('/auth/login', (req, res) => {
  let auth = req.body;
  let username: string = auth.username || '';
  let password: string = auth.password || '';
  hal.getUserByName(username).then((u: User) => {
    if (u.passwordHash.compare(password)) {

      res.cookie('name', u.username);
      res.cookie('uuid', u.UUID.toString());
      res.cookie('userLevel', u.godLevel);
      res.cookie('email', u.email);

      res.send(JSON.stringify({
        Success: true,
        username: u.username,
        accessLevel: u.godLevel,
        email: u.email
      }));

    } else {
      //reject
      res.send(JSON.stringify({
        Success: false,
        Message: 'Invalid Credentials'
      }));
    }
  }).catch((err: Error) => {
    res.send(JSON.stringify({ Success: false, Message: err.message }));
  });
});

app.post('/region/stop/:uuid', (req, res) => {
  let regionID = new UUIDString(req.params.uuid);
  let session: ConsoleSession;

  mgm.getRegion(regionID).then((r: Region) => {
    if (!r.isRunning) {
      throw new Error('Region ' + r.name + ' is not running');
    }
    return RestConsole.open(r.slaveAddress, r.consolePort, conf.console.user, conf.console.pass);
  }).then((s: ConsoleSession) => {
    session = s;
    return RestConsole.write(s, 'quit');
    // dont bother closing the session, the process is terminating
  }).then(() => {
    res.send(JSON.stringify({ Success: true }));
  }).catch((err: Error) => {
    res.send(JSON.stringify({ Success: false, Message: err.message }));
  });
});

app.post('/region/kill/:uuid', (req, res) => {
  let regionID = new UUIDString(req.params.uuid);
  let target: Region;
  mgm.getRegion(regionID).then((r: Region) => {
    if (!r.isRunning) {
      throw new Error('Region ' + r.name + ' is not running');
    }
    if (r.slaveAddress === null || r.slaveAddress === '') {
      throw new Error('Region ' + r.name + ' is not assigned a host');
    }
    target = r;
    return mgm.getHost(r.slaveAddress);
  }).then((h: Host) => {
    return mgm.killRegion(target, h);
  }).catch((err) => {
    res.send(JSON.stringify({ Success: false, Message: err.message }));
  });
})

app.get('/server/dispatch/region/:name', (req, res) => {
  let regionName = req.params.name;
  //validate host
  let remoteIP: string = req.ip.split(':').pop();
  mgm.getHost(remoteIP).then((host: Host) => {
    //get region on host
    return mgm.getRegionsOn(host);
  }).then((regions: Region[]) => {
    for (let r of regions) {
      if (r.name === regionName) {
        return r;
      }
    }
    throw new Error('Requested region does not exist on the requesting host');
  }).then((r: Region) => {
    res.send(JSON.stringify({
      Success: true,
      Region: {
        RegionUUID: r.uuid.toString(),
        LocationX: r.locX,
        LocationY: r.locY,
        InternalPort: r.httpPort,
        ExternalHostName: r.externalAddress
      }
    }));
  }).catch((err: Error) => {
    res.send(JSON.stringify({ Success: false, Message: err.message }));
    return;
  });
});

app.get('/server/dispatch/process/:name', (req, res) => {
  let regionName = req.params.name;
  let httpPort = req.query.httpPort;
  let consolePort = req.query.consolePort;
  let externalAddress = req.query.externalAddress;
  //validate host
  let remoteIP: string = req.ip.split(':').pop();
  mgm.getHost(remoteIP).then((host: Host) => {
    //get region on host
    return mgm.getRegionsOn(host);
  }).then((regions: Region[]) => {
    for (let r of regions) {
      if (r.name === regionName) {
        return r;
      }
    }
    throw new Error('Requested region does not exist on the requesting host');
  }).then((r: Region) => {
    r.httpPort = httpPort;
    r.consolePort = consolePort;
    r.externalAddress = externalAddress;
    return mgm.updateRegion(r);
  }).then((r: Region) => {
    return mgm.getRegionINI(r);
  }).then((config: { [key: string]: { [key: string]: string } }) => {
    res.send(JSON.stringify({ Success: true, Region: config }));
  }).catch((err: Error) => {
    res.send(JSON.stringify({ Success: false, Message: err.message }));
    return;
  });
});

app.post('/server/dispatch/node', (req, res) => {
  let remoteIP: string = req.ip.split(':').pop();
  mgm.getHost(remoteIP).then((host: Host) => {
    console.log('Received registration for node at ' + remoteIP);
    let payload = req.body;

    host.slots = payload.slots;
    host.name = payload.host;
    host.port = payload.port;
    host.cmd_key = new UUIDString(payload.key);

    return host;
  }).then((h: Host) => {
    return mgm.updateHost(h);
  }).then((h: Host) => {
    return mgm.getRegionsOn(h);
  }).then((regions: Region[]) => {
    let result = []
    for (let r of regions) {
      result.push({
        name: r.name,
        uuid: r.uuid.toString(),
        locX: r.locX,
        locY: r.locY,
        size: r.size
      });
    }
    res.send(JSON.stringify({
      Success: true,
      Regions: result
    }));
  }).catch((err: Error) => {
    res.send(JSON.stringify({ Success: false, Message: err.message }));
    return;
  });
});

app.post('/server/dispatch/stats/:host', (req, res) => {
  let host = req.params.host; //url parameter, not relaly used
  let remoteIP: string = req.ip.split(':').pop();
  mgm.getHost(remoteIP).then((host: Host) => {
    //this is from mgmNode, which isnt following the rules
    let stats = JSON.parse(req.body.json);
    let hostStatus = JSON.stringify(stats.host);

    let workers = [];
    workers.push(mgm.updateHostStats(host, hostStatus));

    let halted = 0;
    let running = 0;
    for (let proc of stats.processes) {
      let w = mgm.getRegionByName(proc.name).then((r: Region) => {
        r.isRunning = proc.running.toUpperCase() === 'FALSE' ? false : true;
        if (r.isRunning)
          running++;
        else
          halted++;
        return mgm.updateRegionStats(r, proc.running.toUpperCase() === 'FALSE' ? false : true, JSON.stringify(proc.stats));
      });
      workers.push(w);
    }

    return Promise.all(workers).then(() => {
      res.send('Stats recieved: ' + running + ' running processes, and ' + halted + ' halted processes');
    });

  }).catch((err: Error) => {
    res.send(JSON.stringify({ Success: false, Message: err.message }));
  });
});

app.post('/host/remove', (req, res) => {
  if (!req.cookies['uuid']) {
    res.send(JSON.stringify({ Success: false, Message: 'No session found' }));
    return;
  }

  if (req.cookies['userLevel'] < 250) {
    res.send(JSON.stringify({ Success: false, Message: 'Permission Denied' }));
    return;
  }

  let host: string = req.body.host || '';

  mgm.deleteHost(host).then(() => {
    res.send(JSON.stringify({ Success: true }));
  }).catch((err: Error) => {
    res.send(JSON.stringify({ Success: false, Message: err.message }));
  });
});

app.post('/host/add', (req, res) => {
  if (!req.cookies['uuid']) {
    res.send(JSON.stringify({ Success: false, Message: 'No session found' }));
    return;
  }

  if (req.cookies['userLevel'] < 250) {
    res.send(JSON.stringify({ Success: false, Message: 'Permission Denied' }));
    return;
  }

  let host: string = req.body.host || '';
  if (host === '') {
    res.send(JSON.stringify({ Success: false, Message: 'Invalid host' }));
    return;
  }

  mgm.insertHost(host).then(() => {
    res.send(JSON.stringify({ Success: true }));
  }).catch((err: Error) => {
    res.send(JSON.stringify({ Success: false, Message: err.message }));
  });
});

app.post('/region/host/:regionID', (req, res) => {
  if (!req.cookies['uuid']) {
    return res.send(JSON.stringify({ Success: false, Message: 'No session found' }));
  }

  if (req.cookies['userLevel'] < 250) {
    return res.send(JSON.stringify({ Success: false, Message: 'Permission Denied' }));
  }

  //moving a region to a new host

  //get region
  let regionID = new UUIDString(req.params.regionID);
  let hostAddress: string = req.body.host || '';
  let region: Region;
  let newHost: Host;

  mgm.getRegion(regionID).then((r: Region) => {
    if (r.isRunning) {
      throw new Error('Region is currently running');
    }
    region = r;
    if(r.slaveAddress === hostAddress){
      throw new Error('Region is already on that host');
    }
  }).then(() => {
    //get new host
    return new Promise<Host>((resolve, reject) => {
      mgm.getHost(hostAddress).then((h: Host) => {
        resolve(h);
      }).catch(() => {
        resolve(null);
      })
    });
  }).then((h: Host) => {
    newHost = h;

    //try to get region's current host
    return new Promise<Host>((resolve, reject) => {
      mgm.getHost(region.slaveAddress).then((h: Host) => {
        resolve(h);
      }).catch(() => {
        resolve(null);
      })
    });
  }).then((fromHost: Host) => {
    //if the old host does not exist, skip to the next step
    if (fromHost === null) {
      return Promise.resolve();
    }

    //try to remove the host, but we dont care if we fail
    return new Promise<void>((resolve, reject) => {
      mgm.removeRegionFromHost(region, fromHost).then(() => {
        resolve();
      }).catch(() => {
        resolve();
      });
    });
  }).then(() => {
    //we are removed from the old host
    return mgm.putRegionOnHost(region, newHost);
  }).then(() => {
    res.send(JSON.stringify({ Success: true }));
  }).catch((err: Error) => {
    res.send(JSON.stringify({ Success: false, Message: err.message }));
  });
});

app.get('/task/ready', (req, res) => {
  res.send('MGM');
});

app.get('/task/report', (req, res) => {
  res.send('MGM');
});

app.get('/task/upload', (req, res) => {
  res.send('MGM');
});

app.post('/region/destroy/:uuid', (req, res) => {
  if (!req.cookies['uuid']) {
    return res.send(JSON.stringify({ Success: false, Message: 'No session found' }));
  }

  if (req.cookies['userLevel'] < 250) {
    return res.send(JSON.stringify({ Success: false, Message: 'Permission Denied' }));
  }

  let regionID = new UUIDString(req.params.uuid);
  let region: Region;

  mgm.getRegion(regionID).then((r: Region) => {
    if (r.isRunning) {
      return res.send(JSON.stringify({ Success: false, Message: 'cannot delete a running region' }));
    }
    if (r.slaveAddress !== null) {
      return res.send(JSON.stringify({ Success: false, Message: 'region is still allocated a host' }));
    }
    region = r;
  }).then(() => {
    return mgm.destroyRegion(region);
  }).then(() => {
    return hal.destroyRegion(region.uuid.toString());
  }).then(() => {
    res.send(JSON.stringify({ Success: true }));
  }).catch((err: Error) => {
    res.send(JSON.stringify({ Success: false, Message: err.message }));
  });
});

app.post('/region/estate/:uuid', (req, res) => {
  if (!req.cookies['uuid']) {
    return res.send(JSON.stringify({ Success: false, Message: 'No session found' }));
  }

  if (req.cookies['userLevel'] < 250) {
    return res.send(JSON.stringify({ Success: false, Message: 'Permission Denied' }));
  }

  let regionID = new UUIDString(req.params.uuid);
  let estateID: number = parseInt(req.body.estate);

  let estate: Estate;

  hal.getEstate(estateID).then( (e : Estate) => {
    estate = e;
    return mgm.getRegion(regionID);
  }).then( (r: Region) => {
    return hal.setEstateForRegion(r.uuid.toString(), estate);
  }).then( () => {
    res.send(JSON.stringify({ Success: true }));
  }).catch((err: Error) => {
    res.send(JSON.stringify({ Success: false, Message: err.message }));
  });
});

app.post('/region/setXY/:uuid', (req, res) => {
  res.send(JSON.stringify({ Success: false, Message: 'Not Implemented' }));
});

app.post('/region/create', (req, res) => {
  if (!req.cookies['uuid']) {
    return res.send(JSON.stringify({ Success: false, Message: 'No session found' }));
  }

  if (req.cookies['userLevel'] < 250) {
    return res.send(JSON.stringify({ Success: false, Message: 'Permission Denied' }));
  }

  let region: Region = new Region();
  region.name = req.body.name;
  region.size = req.body.size;
  region.locX = req.body.x;
  region.locY = req.body.y;
  let estateID = req.body.estate;
  let estate: Estate;

  hal.getEstate(estateID).then((e: Estate) => {
    estate = e;
    return mgm.insertRegion(region);
  }).then((r: Region) => {
    region = r;
    return hal.setEstateForRegion(region.uuid.toString(), estate);
  }).then(() => {
    return res.send(JSON.stringify({ Success: true }));
  }).catch((err: Error) => {
    res.send(JSON.stringify({ Success: false, Message: err.message }));
  });
});

app.post('/task/loadOar/:uuid', (req, res) => {
  res.send(JSON.stringify({ Success: false, Message: 'Not Implemented' }));
});

app.post('/task/saveOar/:uuid', (req, res) => {
  res.send(JSON.stringify({ Success: false, Message: 'Not Implemented' }));
});

app.post('/task/nukeContent/:uuid', (req, res) => {
  res.send(JSON.stringify({ Success: false, Message: 'Not Implemented' }));
});

app.post('/task/loadIar', (req, res) => {
  res.send(JSON.stringify({ Success: false, Message: 'Not Implemented' }));
});

app.post('/task/saveIar', (req, res) => {
  res.send(JSON.stringify({ Success: false, Message: 'Not Implemented' }));
});

app.post('/task/resetCode', (req, res) => {
  res.send(JSON.stringify({ Success: false, Message: 'Not Implemented' }));
});

app.post('/task/resetPassword', (req, res) => {
  res.send(JSON.stringify({ Success: false, Message: 'Not Implemented' }));
});

app.post('/auth/changePassword', (req, res) => {
  res.send(JSON.stringify({ Success: false, Message: 'Not Implemented' }));
});

app.post('/estate/create', (req, res) => {
  res.send(JSON.stringify({ Success: false, Message: 'Not Implemented' }));
});

app.post('/estate/destroy/:id', (req, res) => {
  res.send(JSON.stringify({ Success: false, Message: 'Not Implemented' }));
});

app.post('/user/destroy/:id', (req, res) => {
  res.send(JSON.stringify({ Success: false, Message: 'Not Implemented' }));
});

app.post('/user/create', (req, res) => {
  res.send(JSON.stringify({ Success: false, Message: 'Not Implemented' }));
});

app.post('/group/addUser/:id', (req, res) => {
  res.send(JSON.stringify({ Success: false, Message: 'Not Implemented' }));
});

app.post('/user/accessLevel', (req, res) => {
  res.send(JSON.stringify({ Success: false, Message: 'Not Implemented' }));
});

app.post('/user/email', (req, res) => {
  res.send(JSON.stringify({ Success: false, Message: 'Not Implemented' }));
});

app.post('/user/password', (req, res) => {
  res.send(JSON.stringify({ Success: false, Message: 'Not Implemented' }));
});

app.post('/user/suspend', (req, res) => {
  res.send(JSON.stringify({ Success: false, Message: 'Not Implemented' }));
});

app.post('/register/submit', (req, res) => {
  res.send(JSON.stringify({ Success: false, Message: 'Not Implemented' }));
});


app.listen(3000, function() {
  console.log('MGM listening on port 3000!');
});
