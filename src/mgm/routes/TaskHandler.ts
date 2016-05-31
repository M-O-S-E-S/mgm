
import * as express from 'express';

import { Job } from '../Job';
import { MGM } from '../MGM';
import { UUIDString } from '../../halcyon/UUID';

export function TaskHandler(mgm: MGM): express.Router {
  let router = express.Router();

  router.get('/', (req, res) => {
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

  router.post('/loadOar/:uuid', (req, res) => {
    res.send(JSON.stringify({ Success: false, Message: 'Not Implemented' }));
  });

  router.post('/saveOar/:uuid', (req, res) => {
    res.send(JSON.stringify({ Success: false, Message: 'Not Implemented' }));
  });

  router.post('/nukeContent/:uuid', (req, res) => {
    res.send(JSON.stringify({ Success: false, Message: 'Not Implemented' }));
  });

  router.post('/loadIar', (req, res) => {
    res.send(JSON.stringify({ Success: false, Message: 'Not Implemented' }));
  });

  router.post('/saveIar', (req, res) => {
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

  router.get('/upload', (req, res) => {
    res.send('MGM');
  });

  return router;
}
