
import * as express from 'express';
import * as path from "path";

import { Job } from '../Job';
import { MGM } from '../MGM';
import { UUIDString } from '../../halcyon/UUID';
import { Region } from '../Region';

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

    mgm.getJob(taskID).then( (j: Job) => {
      let datum = JSON.parse(j.data);
      if( datum.File && datum.File !== ''){
        fs.unlink( datum.File);
      }
      return mgm.deleteJob(j);
    }).then( () => {
      res.send(JSON.stringify({ Success: true }));
    }).catch((err: Error) => {
      res.send(JSON.stringify({ Success: false, Message: err.message }));
    });
  });

  router.post('/saveOar/:uuid', MGM.isUser, (req, res) => {
    res.send(JSON.stringify({ Success: false, Message: 'Not Implemented' }));
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

  router.get('/ready', (req, res) => {
    res.send('MGM');
  });

  router.get('/report', (req, res) => {
    res.send('MGM');
  });

  router.post('/upload/:id', multer({ dest: uploadDir}).single('file'), (req, res) => {
    let taskID = parseInt(req.params.id);

    console.log('upload file received for job ' + taskID);

    mgm.getJob(taskID).then( (j: Job) => {
      switch(j.type){
        case 'load_oar':
          let datum = JSON.parse(j.data);
          datum.Status = "Loading";
          datum.File = req.file.path;
          j.data = JSON.stringify(datum);
          return mgm.updateJob(j);
        default:
          throw new Error('invalid upload for job type: ' + j.type);
      }
    }).then( (j: Job) => {
      //do oar loading magics.
      mgm.doJob(j);

      res.send(JSON.stringify({ Success: true }));
    }).catch((err: Error) => {
      res.send(JSON.stringify({ Success: false, Message: err.message }));
    });
  });

  return router;
}
