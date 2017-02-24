import { RequestHandler } from 'express';
import { Store } from '../Store';
import { IJob, IUser, IRegion, IHost } from '../Types';
import { AuthenticatedRequest, Credential } from '../Auth';
import { sign, verify } from 'jsonwebtoken';
import { EmailMgr } from '../lib'

import * as fs from 'fs';

import { Response, GetJobsResponse } from '../View/ClientStack';

export function GetJobsHandler(store: Store): RequestHandler {
  return function (req: AuthenticatedRequest, res) {
    store.Jobs.getFor(req.user.uuid).then((jobs: IJob[]) => {
      res.json(<GetJobsResponse>{
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

import { LoadOar } from '../lib/Region';

export function NukeContentHandler(store: Store): RequestHandler {
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
      if (!r.isRunning) {
        throw new Error('Region is not running');
      }
      region = r;
      return store.Hosts.getByAddress(r.node);
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
      return LoadOar(region, host, j);
    }).then(() => {
      res.json({ Success: true });
    }).catch((err: Error) => {
      res.json({ Success: false, Message: err.message });
    });
  };
}

/*
  router.post('/loadOar/:uuid', isAdmin, (req: AuthenticatedRequest, res) => {
    let merge = req.body.merge;
    let regionID = new UUIDString(req.params.uuid);
    let user = new UUIDString(req.user.uuid);

    console.log('User ' + user + ' requesting load oar for region ' + regionID);

    db.Regions.getByUUID(regionID.toString()).then((r: RegionInstance) => {
      if (!r.isRunning) {
        throw new Error('Region is not running');
      }
      return db.Jobs.create(
        'load_oar',
        user.toString(),
        JSON.stringify({
          Status: 'Pending...',
          Region: regionID.toString(),
          merge: merge
        })
      );
    }).then((j: JobInstance) => {
      res.json({ Success: true, ID: j.id });
    }).catch((err: Error) => {
      res.json({ Success: false, Message: err.message });
    });
  });

  // we do not check per-user permissions, only admins may do this
  router.post('/saveOar/:uuid', isAdmin, (req: AuthenticatedRequest, res) => {
    let regionID = new UUIDString(req.params.uuid);
    let user = new UUIDString(req.user.uuid);

    let region: RegionInstance;
    let host: HostInstance;

    db.Regions.getByUUID(regionID.toString()).then((r: RegionInstance) => {
      console.log('User ' + user + ' requesting save oar for region ' + regionID);
      if (!r.isRunning) {
        throw new Error('Region is not running');
      }
      region = r;
      return db.Hosts.getByAddress(r.slaveAddress);
    }).then((h: HostInstance) => {
      host = h;

      console.log('TODO: User Permissions over ')
      return db.Jobs.create(
        'save_oar',
        user.toString(),
        JSON.stringify({
          Status: 'Pending...',
          Region: regionID.toString()
        })
      )
    }).then((j: JobInstance) => {
      return SaveOar(region, host, j);
    }).then(() => {
      res.json({ Success: true });
    }).catch((err: Error) => {
      res.json({ Success: false, Message: err.message });
    });
  });

  router.get('/ready/:id', (req, res) => {
    let jobID = parseInt(req.params.id);

    db.Jobs.getByID(jobID).then((j: JobInstance) => {
      switch (j.type) {
        case 'save_oar':
          let user = new UUIDString(req.user.uuid);
          if (j.user.toString() !== user.toString()) {
            throw new Error('Permission Denied');
          }
          let datum = JSON.parse(j.data);
          res.setHeader('Content-Disposition', 'attachment; filename="' + datum.FileName + '.oar"');
          res.setHeader('Content-Type', 'application/octet-stream');
          res.sendFile(datum.File);
          break;
        case 'load_oar':
          let remoteIP: string = req.ip.split(':').pop();
          return db.Hosts.getByAddress(remoteIP).then((h: HostInstance) => {
            //valid host, serve the file
            let datum = JSON.parse(j.data);
            res.sendFile(datum.File);
          });
        case 'nuke':
          remoteIP = req.ip.split(':').pop();
          return db.Hosts.getByAddress(remoteIP).then((h: HostInstance) => {
            //valid host, serve the blank file
            res.sendFile(defaultOar);
          });
      }

    }).catch((err) => {
      console.log('An error occurred sending a file to a user: ' + err);
    });
  });

  router.post('/report/:id', (req, res) => {
    let taskID = parseInt(req.params.id);
    let remoteIP: string = req.ip.split(':').pop();

    db.Hosts.getByAddress(remoteIP).then((h: HostInstance) => {
      return db.Jobs.getByID(taskID);
    }).then((j: JobInstance) => {
      let datum = JSON.parse(j.data);
      datum.Status = req.body.Status;
      j.data = JSON.stringify(datum);
      return j.save();
    }).then(() => {
      res.send('OK');
    }).catch((err) => {
      console.log(err);
    });
  });

  router.post('/upload/:id', multer({ dest: uploadDir }).single('file'), (req, res) => {
    let taskID = parseInt(req.params.id);

    console.log('upload file received for job ' + taskID);

    db.Jobs.getByID(taskID).then((j: JobInstance) => {
      if (!j) throw new Error('Job not found');
      switch (j.type) {
        case 'save_oar':
          let remoteIP: string = req.ip.split(':').pop();
          let fileName: string;
          return db.Hosts.getByAddress(remoteIP).then((h: HostInstance) => {
            //host is valid
            let datum = JSON.parse(j.data);
            datum.Status = 'Done';
            datum.File = req.file.path;
            datum.FileName = req.file.originalname;
            datum.Size = req.file.size;
            j.data = JSON.stringify(datum);
            fileName = datum.FileName;
            return j.save();
          }).then(() => {
            return db.Users.getByID(j.user);
          }).then((u: UserInstance) => {
            return EmailMgr.instance().sendSaveOarComplete(u.email, fileName);
          })
        case 'load_oar':
          let user = new UUIDString(req.user.uuid);
          if (user.toString() !== j.user.toString()) {
            throw new Error('Permission Denied');
          }
          let datum = JSON.parse(j.data);
          datum.Status = "Loading";
          datum.File = req.file.path;
          j.data = JSON.stringify(datum);
          let region: RegionInstance;

          return j.save().then((j: JobInstance) => {
            return db.Regions.getByUUID(datum.Region);
          }).then((r: RegionInstance) => {
            region = r;
            if (!r.isRunning) {
              throw new Error('Region is not running');
            }
            return db.Hosts.getByAddress(r.slaveAddress);
          }).then((h: HostInstance) => {
            return LoadOar(region, h, j);
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
  });

  return router;
}
*/