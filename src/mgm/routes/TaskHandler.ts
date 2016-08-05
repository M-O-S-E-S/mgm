
import * as express from 'express';
import * as path from "path";

import { Job, JobMgr } from '../Job';
import { MGM } from '../MGM';
import { UUIDString } from '../../halcyon/UUID';
import { Region, RegionMgr } from '../Region';
import { Host, HostMgr } from '../Host';
import { User, UserMgr, Credential } from '../../halcyon/User';
import { EmailMgr } from '../util/Email';;

import fs = require("fs");
import * as multer from 'multer';
let jwt = require('jsonwebtoken');

export function TaskHandler(mgm: MGM): express.Router {
  let router = express.Router();

  let uploadDir = mgm.getUploadDir();

  //ensure the directory for logs exists
  if (!fs.existsSync(uploadDir)) {
    fs.mkdir(path.join(uploadDir), (err) => {
      if (err && err.code !== "EEXIST")
        throw new Error('Cannot create region log directory at ' + uploadDir);
    });
  }

  router.get('/', MGM.isUser, (req, res) => {
    JobMgr.instance().getFor(new UUIDString(req.cookies['uuid'])).then((jobs: Job[]) => {
      res.send(JSON.stringify({
        Success: true,
        Tasks: jobs
      }));
    }).catch((err: Error) => {
      res.send(JSON.stringify({ Success: false, Message: err.message }));
    });
  });

  router.post('/loadOar/:uuid', MGM.isAdmin, (req, res) => {
    let merge = req.body.merge;
    let regionID = new UUIDString(req.params.uuid);
    let user = new UUIDString(req.cookies['uuid']);

    console.log('User ' + user + ' requesting load oar for region ' + regionID);

    RegionMgr.instance().getRegion(regionID).then((r: Region) => {
      if (!r.isRunning) {
        throw new Error('Region is not running');
      }
      let j: Job = {
        id: 0,
        timestamp: '',
        type: 'load_oar',
        user: user,
        data: JSON.stringify({
          Status: 'Pending...',
          Region: regionID.toString(),
          merge: merge
        })
      };

      return JobMgr.instance().insert(j);
    }).then((j: Job) => {
      res.send(JSON.stringify({ Success: true, ID: j.id }));
    }).catch((err: Error) => {
      res.send(JSON.stringify({ Success: false, Message: err.message }));
    });
  });

  router.post('/delete/:id', MGM.isUser, (req, res) => {
    let taskID = parseInt(req.params.id);

    JobMgr.instance().get(taskID).then((j: Job) => {
      let datum = JSON.parse(j.data);
      if (datum.File && datum.File !== '') {
        fs.exists(datum.File, (exists) => {
          if (exists) {
            fs.unlink(datum.File);
          }
        });
      }
      return JobMgr.instance().delete(j.id);
    }).then(() => {
      res.send(JSON.stringify({ Success: true }));
    }).catch((err: Error) => {
      res.send(JSON.stringify({ Success: false, Message: err.message }));
    });
  });

  router.post('/saveOar/:uuid', MGM.isUser, (req, res) => {
    let regionID = new UUIDString(req.params.uuid);
    let user = new UUIDString(req.cookies['uuid']);

    let region: Region;
    let host: Host;

    RegionMgr.instance().getRegion(regionID).then((r: Region) => {
      console.log('User ' + user + ' requesting save oar for region ' + regionID);
      if (!r.isRunning) {
        throw new Error('Region is not running');
      }
      region = r;
      return HostMgr.instance().get(r.getNodeAddress());
    }).then((h: Host) => {
      host = h;

      let j: Job = {
        id: 0,
        timestamp: '',
        type: 'save_oar',
        user: user,
        data: JSON.stringify({
          Status: 'Pending...',
          Region: regionID.toString()
        })
      };

      return JobMgr.instance().insert(j);
    }).then((j: Job) => {
      return mgm.saveOar(region, host, j);
    }).then(() => {
      res.send(JSON.stringify({ Success: true }));
    }).catch((err: Error) => {
      res.send(JSON.stringify({ Success: false, Message: err.message }));
    });
  });

  router.post('/nukeContent/:uuid', MGM.isUser, (req, res) => {
    res.send(JSON.stringify({ Success: false, Message: 'Not Implemented' }));
  });

  router.post('/loadIar', MGM.isUser, (req, res) => {
    res.send(JSON.stringify({ Success: false, Message: 'Not Implemented' }));
  });

  router.post('/saveIar', MGM.isUser, (req, res) => {
    res.send(JSON.stringify({ Success: false, Message: 'Not Implemented' }));
  });

  router.post('/resetCode', (req, res) => {
    let email = req.body.email;

    UserMgr.instance().getUserByEmail(email).then( (u: User) => {
      console.log('User ' + u.getUUID().toString() + ' requesting password reset token');
      return new Promise<string>((resolve, reject) => {
        jwt.sign({email: email}, 'super secret code goes here', {
          expiresIn: '2d'
        }, (err,token) => {
          if(err) return reject(err);
          resolve(token);
        })
      })
    }).then((token: string) => {
      return EmailMgr.instance().sendAuthResetToken(email, token);
    }).then(() => {
      res.send(JSON.stringify({ Success: true }));
    }).catch((err: Error) => {
      res.send(JSON.stringify({ Success: false, Message: err.message }));
    });
  });

  router.post('/resetPassword', (req, res) => {
    let name = req.body.name;
    let token = req.body.token;
    let password = req.body.password;

    if(! password || password === ''){
      return res.send(JSON.stringify({ Success: false, Message: 'Blank passwords not permitted' }));
    }

    new Promise<string>( (resolve, reject) => {
      jwt.verify(token, 'super secret code goes here', (err, decoded) => {
        if(err) return reject(new Error('Invalid Token'));
        resolve(decoded.email);
      });
    }).then( (email:string) => {
      return UserMgr.instance().getUserByEmail(email);
    }).then( (u: User) => {
      if(u.getUsername() + ' ' + u.getLastName() === name){
        return u.setCredential(Credential.fromPlaintext(password));
      }
      return Promise.reject(new Error('Invalid submission'));
    }).then(() => {
      res.send(JSON.stringify({ Success: true }));
    }).catch((err: Error) => {
      res.send(JSON.stringify({ Success: false, Message: err.message }));
    });
  });

  router.get('/ready/:id', (req, res) => {
    let jobID = parseInt(req.params.id);

    JobMgr.instance().get(jobID).then( (j: Job) => {
      switch(j.type){
        case 'save_oar':
          let user = new UUIDString(req.cookies['uuid']);
          if(j.user.toString() !== user.toString()){
            throw new Error('Permission Denied');
          }
          let datum = JSON.parse(j.data);
          res.setHeader('Content-Disposition', 'attachment; filename="'+datum.FileName+'.oar"');
          res.setHeader('Content-Type', 'application/octet-stream');
          res.sendFile(datum.File);
          break;
        case 'load_oar':
          let remoteIP: string = req.ip.split(':').pop();
          return HostMgr.instance().get(remoteIP).then( (h: Host) => {
            //valid host, serve the file
            let datum = JSON.parse(j.data);
            res.sendFile(datum.File);
          });
      }

    }).catch( (err) => {
      console.log('An error occurred sending a file to a user: ' + err);
    });
  });

  router.post('/report/:id', (req, res) => {
    let taskID = parseInt(req.params.id);
    let remoteIP: string = req.ip.split(':').pop();

    HostMgr.instance().get(remoteIP).then((h: Host) => {
      return JobMgr.instance().get(taskID);
    }).then( (j: Job) => {
      let datum = JSON.parse(j.data);
      datum.Status = req.body.Status;
      j.data = JSON.stringify(datum);
      return JobMgr.instance().update(j);
    }).then( () => {
      res.send('OK');
    }).catch( (err) => {
      console.log(err);
    });
  });

  router.post('/upload/:id', multer({ dest: uploadDir }).single('file'), (req, res) => {
    let taskID = parseInt(req.params.id);

    console.log('upload file received for job ' + taskID);

    JobMgr.instance().get(taskID).then((j: Job) => {
      switch (j.type) {
        case 'save_oar':
          let remoteIP: string = req.ip.split(':').pop();
          let fileName: string;
          return HostMgr.instance().get(remoteIP).then((h: Host) => {
            //host is valid
            let datum = JSON.parse(j.data);
            datum.Status = 'Done';
            datum.File = req.file.path;
            datum.FileName = req.file.originalname;
            datum.Size = req.file.size;
            j.data = JSON.stringify(datum);
            fileName = datum.FileName;
            return JobMgr.instance().update(j);
          }).then( () => {
            return UserMgr.instance().getUser(j.user);
          }).then( (u: User) => {
            return EmailMgr.instance().sendSaveOarComplete(u.getEmail(), fileName);
          })
        case 'load_oar':
          let user = new UUIDString(req.cookies['uuid']);
          if(user.toString() !== j.user.toString()){
            throw new Error('Permission Denied');
          }
          let datum = JSON.parse(j.data);
          datum.Status = "Loading";
          datum.File = req.file.path;
          j.data = JSON.stringify(datum);
          let region: Region;
          return JobMgr.instance().update(j).then( (j: Job) =>{
            return RegionMgr.instance().getRegion(datum.Region);
          }).then( (r: Region) => {
            region = r;
            if(! r.isRunning){
              throw new Error('Region is not running');
            }
            return HostMgr.instance().get(r.getNodeAddress());
          }).then( (h: Host) => {
            return mgm.loadOar(region, h, j);
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
