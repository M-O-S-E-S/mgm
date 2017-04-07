import { Response, RequestHandler } from 'express';
import { Store } from '../Store';
import { IJob, IUser, IRegion, IHost } from '../types';
import { AuthenticatedRequest, Credential } from '../Auth';
import { sign, verify } from 'jsonwebtoken';
import { EmailMgr } from '../Email'
import Promise = require('bluebird');
import { PerformanceStore } from '../Performance';

import * as fs from 'fs';

export function GetJobsHandler(store: Store): RequestHandler {
  return function (req: AuthenticatedRequest, res) {
    store.Jobs.getFor(req.user.uuid).then((jobs: IJob[]) => {
      res.json({
        Success: true,
        Jobs: jobs
      });
    }).catch((err: Error) => {
      res.json({
        Success: false,
        Message: err.message
      });
    });
  };
}

export function PasswordResetCodeHandler(store: Store, cert: Buffer): RequestHandler {
  return (req: AuthenticatedRequest, res) => {
    let email = req.body.email || '';

    if (email === '') {
      return res.json({ Success: false, Message: 'Email cannot be blank' });
    }

    store.Users.getByEmail(email).then((u: IUser) => {
      return store.Jobs.create('ResetToken', u, 'Token Requested');
    }).then((j: IJob) => {
      return new Promise<string>((resolve, reject) => {
        sign({ email: email }, cert, {
          expiresIn: '2d'
        }, (err, token) => {
          if (err) return reject(err);
          resolve(token);
        });
      });
    }).then((token: string) => {
      return EmailMgr.instance().sendAuthResetToken(email, token);
    }).then(() => {
      res.json({ Success: true });
    }).catch((err: Error) => {
      res.json({ Success: false, Message: err.message });
    });
  }
}

export function PasswordResetHandler(store: Store, cert: Buffer): RequestHandler {
  return (req: AuthenticatedRequest, res) => {
    let name: string = req.body.name || '';
    let token = req.body.token || '';
    let password = req.body.password || '';

    if (!password || password === '') {
      return res.json({ Success: false, Message: 'Blank passwords not permitted' });
    }

    let user: IUser;

    new Promise<string>((resolve, reject) => {
      verify(token, cert, (err, decoded) => {
        if (err) return reject(new Error('Invalid Token'));
        resolve(decoded.email);
      });
    }).then((email: string) => {
      return store.Users.getByEmail(email);
    }).then((u: IUser) => {
      user = u;
      if (u.name().toLowerCase() === name.toLowerCase()) {
        return store.Users.setPassword(u, Credential.fromPlaintext(password));
      }
      throw new Error('Invalid submission');
    }).then(() => {
      return store.Jobs.create('ResetToken', user, 'Password Reset')
    }).then(() => {
      res.json({ Success: true });
    }).catch((err: Error) => {
      res.json({ Success: false, Message: err.message });
    });
  }
}

export function DeleteJobHandler(store: Store): RequestHandler {
  return (req: AuthenticatedRequest, res) => {
    let taskID = parseInt(req.params.id);

    // some jobs have files associated with them, purge if present
    store.Jobs.getByID(taskID).then((j: IJob) => {
      try {
        let datum = JSON.parse(j.data);
        if (datum.File && datum.File !== '') {
          fs.exists(datum.File, (exists) => {
            if (exists) {
              fs.unlink(datum.File);
            }
          });
        }
      } catch (e) {/*not all jobs contain json*/ }
      return store.Jobs.destroy(j);
    }).then(() => {
      res.json({ Success: true });
    }).catch((err: Error) => {
      res.json({ Success: false, Message: err.message });
    });
  };
}

import { LoadOar, SaveOar } from '../Region';

export function NukeContentHandler(store: Store, perf: PerformanceStore, defaultOarPath: string): RequestHandler {
  return (req: AuthenticatedRequest, res) => {
    let regionID: string = req.params.uuid;
    let userID: string = req.user.uuid;

    if (!req.user.isAdmin && !req.user.regions.has(regionID)) {
      return res.json({ Success: false, Message: 'Access Denied' });
    }

    let region: IRegion;
    let host: IHost;
    let user: IUser;

    store.Users.getByID(userID).then((u: IUser) => {
      user = u;
      return store.Regions.getByUUID(regionID.toString())
    }).then((r: IRegion) => {
      region = r;
      return perf.isRegionRunning(r).then((isRunning: boolean) => {
        if (!isRunning)
          throw new Error('Region is not running');
      }).then(() => {
        return store.Hosts.getByAddress(r.node);
      });
    }).then((h: IHost) => {
      host = h;
      return store.Jobs.create(
        'nuke',
        user,
        JSON.stringify({
          Status: 'Pending...',
          Region: region.uuid
        })
      )
    }).then((j: IJob) => {
      return store.Users.getByID(req.user.uuid).then((u: IUser) => {
        return LoadOar(region, host, j, u, defaultOarPath);
      });
    }).then(() => {
      res.json({ Success: true });
    }).catch((err: Error) => {
      res.json({ Success: false, Message: err.message });
    });
  };
}

export function LoadOarHandler(store: Store, perf: PerformanceStore): RequestHandler {
  return (req: AuthenticatedRequest, res) => {
    let regionID = req.params.uuid;

    if (!req.user.isAdmin && !req.user.regions.has(regionID)) {
      return res.json({ Success: false, Message: 'Access Denied' });
    }

    let user: IUser;

    store.Users.getByID(req.user.uuid).then((u: IUser) => {
      user = u;
      return store.Regions.getByUUID(regionID);
    }).then((r: IRegion) => {
      return perf.isRegionRunning(r).then((isRunning: boolean) => {
        if (!isRunning)
          throw new Error('Region is not running');
      }).then(() => {
        return store.Jobs.create(
          'load_oar',
          user,
          JSON.stringify({
            Status: 'Pending...',
            Region: regionID.toString()
          })
        );
      });
    }).then((j: IJob) => {
      res.json({ Success: true, ID: j.id });
    }).catch((err: Error) => {
      res.json({ Success: false, Message: err.message });
    });
  };
}

export function SaveOarHandler(store: Store, perf: PerformanceStore): RequestHandler {
  return (req: AuthenticatedRequest, res) => {
    let regionID: string = req.params.uuid;

    if (!req.user.isAdmin && !req.user.regions.has(regionID)) {
      return res.json({ Success: false, Message: 'Access Denied' });
    }

    let region: IRegion;
    let host: IHost;
    let user: IUser;

    store.Users.getByID(req.user.uuid).then((u: IUser) => {
      user = u;
      return store.Regions.getByUUID(regionID.toString());
    }).then((r: IRegion) => {
      region = r;
      return perf.isRegionRunning(r).then((isRunning: boolean) => {
        if (!isRunning)
          throw new Error('Region is not running');
      }).then(() => {
        return store.Hosts.getByAddress(r.node);
      });
    }).then((h: IHost) => {
      host = h;

      return store.Jobs.create(
        'save_oar',
        user,
        JSON.stringify({
          Status: 'Pending...',
          Region: regionID.toString()
        })
      )
    }).then((j: IJob) => {
      return store.Users.getByID(req.user.uuid).then((user: IUser) => {
        return SaveOar(region, host, j, user);
      });
    }).then(() => {
      res.json({ Success: true });
    }).catch((err: Error) => {
      res.json({ Success: false, Message: err.message });
    });
  };
}

interface uploadRequest extends AuthenticatedRequest {
  file: {
    path: string
  }
}

export function UserUploadHandler(store: Store, perf: PerformanceStore): RequestHandler {
  return (req: uploadRequest, res) => {
    let taskID = parseInt(req.params.id);

    store.Jobs.getByID(taskID).then((j: IJob) => {
      switch (j.type) {
        case 'load_oar':
          let user = req.user.uuid;
          if (user !== j.user) {
            throw new Error('Permission Denied');
          }
          let datum = JSON.parse(j.data);
          datum.Status = "Loading";
          datum.File = req.file.path;
          let region: IRegion;

          return store.Jobs.setData(j, JSON.stringify(datum)).then((j: IJob) => {
            return store.Regions.getByUUID(datum.Region);
          }).then((r: IRegion) => {
            region = r;
            return perf.isRegionRunning(r).then((isRunning: boolean) => {
              if (!isRunning)
                throw new Error('Region is not running');
            }).then(() => {
              return store.Hosts.getByAddress(r.node);
            });
          }).then((h: IHost) => {
            return store.Users.getByID(req.user.uuid).then((u: IUser) => {
              return LoadOar(region, h, j, u);
            });
          })
        default:
          throw new Error('invalid upload for job type: ' + j.type);
      }
    }).then(() => {
      res.json({ Success: true });
    }).catch((err: Error) => {
      console.log(err);
      res.json({ Success: false, Message: err.message });
    });
  };
}

export function UserDownloadHandler(store: Store, uploadFolder: string): RequestHandler {
  return (req: AuthenticatedRequest, res) => {
    let jobID = parseInt(req.params.id);

    store.Jobs.getByID(jobID).then((j: IJob) => {
      switch (j.type) {
        case 'save_oar':
          if (j.user !== req.user.uuid) {
            throw new Error('Permission Denied');
          }
          let datum = JSON.parse(j.data);
          res.setHeader('Content-Disposition', 'attachment; filename="' + datum.FileName + '.oar"');
          res.setHeader('Content-Type', 'application/octet-stream');
          res.sendFile(datum.File.split('/').pop(), { root: uploadFolder });
          break;
      }
    }).catch((err) => {
      console.log('An error occurred sending a file to a user: ' + err);
    });
  };
}