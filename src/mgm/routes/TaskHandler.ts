
import * as express from 'express';
import * as path from "path";

import { Job } from '../Job';
import { MGM } from '../MGM';
import { UUIDString } from '../../halcyon/UUID';
import { Region } from '../Region';
import { Host } from '../Host';

import fs = require("fs");
import * as multer from 'multer';

export function TaskHandler(mgm: MGM, uploadDir: string): express.Router {
  let router = express.Router();

  //ensure the directory for logs exists
  if (!fs.existsSync(uploadDir)) {
    fs.mkdir(path.join(uploadDir), (err) => {
      if (err && err.code !== "EEXIST")
        throw new Error('Cannot create region log directory at ' + uploadDir);
    });
  }

  router.get('/', MGM.isUser, (req, res) => {
    mgm.getJobsFor(new UUIDString(req.cookies['uuid'])).then((jobs: Job[]) => {
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

    mgm.getRegion(regionID).then((r: Region) => {
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

      return mgm.insertJob(j);
    }).then((j: Job) => {
      res.send(JSON.stringify({ Success: true, ID: j.id }));
    }).catch((err: Error) => {
      res.send(JSON.stringify({ Success: false, Message: err.message }));
    });
  });

  router.post('/delete/:id', MGM.isUser, (req, res) => {
    let taskID = parseInt(req.params.id);

    mgm.getJob(taskID).then((j: Job) => {
      let datum = JSON.parse(j.data);
      if (datum.File && datum.File !== '') {
        fs.exists(datum.File, (exists) => {
          if (exists) {
            fs.unlink(datum.File);
          }
        });
      }
      return mgm.deleteJob(j);
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

    mgm.getRegion(regionID).then((r: Region) => {
      console.log('User ' + user + ' requesting save oar for region ' + regionID);
      if (!r.isRunning) {
        throw new Error('Region is not running');
      }
      region = r;
      return mgm.getHost(r.slaveAddress);
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

      return mgm.insertJob(j);
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
    res.send(JSON.stringify({ Success: false, Message: 'Not Implemented' }));
  });

  router.post('/resetPassword', (req, res) => {
    res.send(JSON.stringify({ Success: false, Message: 'Not Implemented' }));
  });

  router.get('/ready/:id', (req, res) => {
    let jobID = parseInt(req.params.id);

    mgm.getJob(jobID).then( (j: Job) => {
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
          return mgm.getHost(remoteIP).then( (h: Host) => {
            //valid host, serve the file

          });
      }

    }).catch( (err) => {
      console.log('An error occurred sending a file to a user: ' + err);
    });
  });

  router.post('/report/:id', (req, res) => {
    let taskID = parseInt(req.params.id);
    let remoteIP: string = req.ip.split(':').pop();

    mgm.getHost(remoteIP).then((h: Host) => {
      return mgm.getJob(taskID);
    }).then( (j: Job) => {
      let datum = JSON.parse(j.data);
      datum.Status = req.body.Status;
      j.data = JSON.stringify(datum);
      return mgm.updateJob(j);
    }).then( () => {
      res.send('OK');
    }).catch( (err) => {
      console.log(err);
    });
  });

  router.post('/upload/:id', multer({ dest: uploadDir }).single('file'), (req, res) => {
    let taskID = parseInt(req.params.id);

    console.log('upload file received for job ' + taskID);

    mgm.getJob(taskID).then((j: Job) => {
      switch (j.type) {
        case 'save_oar':
          let remoteIP: string = req.ip.split(':').pop();
          return mgm.getHost(remoteIP).then((h: Host) => {
            //host is valid
            let datum = JSON.parse(j.data);
            datum.Status = 'Done';
            datum.File = req.file.path;
            datum.FileName = req.file.originalname;
            datum.Size = req.file.size;
            j.data = JSON.stringify(datum);
            return mgm.updateJob(j);
          }).then( () => {});
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
          return mgm.updateJob(j).then( (j: Job) =>{
            return mgm.getRegion(datum.Region);
          }).then( (r: Region) => {
            region = r;
            if(! r.isRunning){
              throw new Error('Region is not running');
            }
            return mgm.getHost(r.slaveAddress);
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
