
import * as express from 'express';
import * as path from "path";

import { PersistanceLayer, JobInstance, RegionInstance, HostInstance, UserInstance } from '../database';
import { UUIDString, Credential, EmailMgr } from '../lib';
import { Config } from '../Config';
import { IJob } from '../common/messages';
import { SaveOar, LoadOar } from '../lib/Region';

import fs = require("fs");
import * as multer from 'multer';
let jwt = require('jsonwebtoken');

export function TaskHandler(db: PersistanceLayer, conf: Config, isUser, isAdmin): express.Router {
  let router = express.Router();

  let uploadDir = conf.mgm.upload_dir;
  let defaultOar = conf.mgm.default_oar_path;

  //ensure the directory for logs exists
  if (!fs.existsSync(uploadDir)) {
    fs.mkdir(path.join(uploadDir), (err) => {
      if (err && err.code !== "EEXIST")
        throw new Error('Cannot create region log directory at ' + uploadDir);
    });
  }

  if(!fs.existsSync(defaultOar)) {
    throw new Error('Default oar does not exist at ' + defaultOar);
  }

  router.get('/', isUser, (req, res) => {
    db.Jobs.getFor(req.user.uuid).then((jobs: JobInstance[]) => {
      res.send(JSON.stringify({
        Success: true,
        Jobs: jobs.map((j: JobInstance) => {
          let ij: IJob = {
            id: j.id,
            timestamp: j.timestamp,
            type: j.type,
            user: j.user,
            data: j.data
          }
          return ij;
        })
      }));
    }).catch((err: Error) => {
      res.send(JSON.stringify({ Success: false, Message: err.message }));
    });
  });

  router.post('/loadOar/:uuid', isAdmin, (req, res) => {
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
      res.send(JSON.stringify({ Success: true, ID: j.id }));
    }).catch((err: Error) => {
      res.send(JSON.stringify({ Success: false, Message: err.message }));
    });
  });

  router.post('/delete/:id', isUser, (req, res) => {
    let taskID = parseInt(req.params.id);
    console.log('deleting job ' + taskID);

    db.Jobs.getByID(taskID).then((j: JobInstance) => {
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
      return j.destroy();
    }).then(() => {
      res.send(JSON.stringify({ Success: true }));
    }).catch((err: Error) => {
      res.send(JSON.stringify({ Success: false, Message: err.message }));
    });
  });

  // we do not check per-user permissions, only admins may do this
  router.post('/saveOar/:uuid', isAdmin, (req, res) => {
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
      res.send(JSON.stringify({ Success: true }));
    }).catch((err: Error) => {
      res.send(JSON.stringify({ Success: false, Message: err.message }));
    });
  });

  router.post('/nukeContent/:uuid', isUser, (req, res) => {
    let regionID = new UUIDString(req.params.uuid);
    let user = new UUIDString(req.user.uuid);

    let region: RegionInstance;
    let host: HostInstance;

    db.Regions.getByUUID(regionID.toString()).then((r: RegionInstance) => {
      console.log('User ' + user + ' requesting nuke for region ' + regionID);
      if (!r.isRunning) {
        throw new Error('Region is not running');
      }
      region = r;
      return db.Hosts.getByAddress(r.slaveAddress);
    }).then((h: HostInstance) => {
      host = h;

      console.log('TODO: User Permissions over ')
      return db.Jobs.create(
        'nuke',
        user.toString(),
        JSON.stringify({
          Status: 'Pending...',
          Region: regionID.toString()
        })
      )
    }).then((j: JobInstance) => {
      return LoadOar(region, host, j);
    }).then(() => {
      res.send(JSON.stringify({ Success: true }));
    }).catch((err: Error) => {
      res.send(JSON.stringify({ Success: false, Message: err.message }));
    });

  });

  router.post('/loadIar', isUser, (req, res) => {
    res.send(JSON.stringify({ Success: false, Message: 'Not Implemented' }));
  });

  router.post('/saveIar', isUser, (req, res) => {
    res.send(JSON.stringify({ Success: false, Message: 'Not Implemented' }));
  });

  router.post('/resetCode', (req, res) => {
    let email = req.body.email || '';

    if (email === '') {
      return res.send(JSON.stringify({ Success: false, Message: 'Email cannot be blank' }));
    }

    db.Users.getByEmail(email).then((u: UserInstance) => {
      if (!u || email !== u.email) throw new Error('User does not exist');
      console.log('User ' + u.UUID + ' requesting password reset token');
      return db.Jobs.create('ResetToken', u.UUID, 'Token Requested').then((j: JobInstance) => {
        console.log('Password reset job created for ' + u.UUID + ' with ID ' + j.id);
        return new Promise<string>((resolve, reject) => {
          jwt.sign({ email: email }, conf.mgm.certificate, {
            expiresIn: '2d'
          }, (err, token) => {
            if (err) return reject(err);
            resolve(token);
          });
        });
      }).then((token: string) => {
        return EmailMgr.instance().sendAuthResetToken(email, token);
      }).then(() => {
        res.send(JSON.stringify({ Success: true }));
      }).catch((err: Error) => {
        res.send(JSON.stringify({ Success: false, Message: err.message }));
      });
    });
  });

  router.post('/resetPassword', (req, res) => {
    let name: string = req.body.name || '';
    let token = req.body.token || '';
    let password = req.body.password || '';

    if (!password || password === '') {
      return res.send(JSON.stringify({ Success: false, Message: 'Blank passwords not permitted' }));
    }

    let id = '';

    new Promise<string>((resolve, reject) => {
      jwt.verify(token, conf.mgm.certificate, (err, decoded) => {
        if (err) return reject(new Error('Invalid Token'));
        resolve(decoded.email);
      });
    }).then((email: string) => {
      return db.Users.getByEmail(email);
    }).then((u: UserInstance) => {
      id = u.UUID;
      if (u.username.toLowerCase() + ' ' + u.lastname.toLowerCase() === name.toLowerCase()) {
        u.passwordHash = Credential.fromPlaintext(password).hash;
        return u.save();
      }
      throw new Error('Invalid submission');
    }).then(() => {
      return db.Jobs.create('ResetToken', id, 'Password Reset')
    }).then(() => {
      res.send(JSON.stringify({ Success: true }));
    }).catch((err: Error) => {
      res.send(JSON.stringify({ Success: false, Message: err.message }));
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
      res.send(JSON.stringify({ Success: true }));
    }).catch((err: Error) => {
      console.log(err);
      res.send(JSON.stringify({ Success: false, Message: err.message }));
    });
  });

  return router;
}
