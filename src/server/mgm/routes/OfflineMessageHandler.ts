
import * as express from 'express';
import { UUIDString } from '../../halcyon/UUID';

import { Parser } from 'xml2js';
import { OfflineMgr } from '../util/OfflineMgr';

export function OfflineMessageHandler(): express.Router {
  let router = express.Router();

  // insert middleware to put the body back
  router.use(function(req, res, next) {
    var data = '';
    req.setEncoding('utf8');
    req.on('data', function(chunk) {
      data += chunk;
    });
    req.on('end', function() {
      req.body = data;
      next()
    });
  });

  router.post('/SaveMessage', (req, res) => {
    let xmlMessage: string = req.body;
    xmlMessage = xmlMessage.slice(xmlMessage.lastIndexOf('?>') + 2);

    let p = new Parser();

    new Promise<string>((resolve, reject) => {
      p.parseString(xmlMessage, (err, result) => {
        if (err) return reject(err);
        resolve(result);
      });
    }).then((xml: any) => {
      let toAgent = new UUIDString(xml.GridInstantMessage.toAgentID[0]);
      return OfflineMgr.instance().save(toAgent, xmlMessage);
    }).then(() => {
      res.send('<?xml version="1.0" encoding="utf-8"?><boolean>true</boolean>');
    }).catch((err) => {
      console.log('Error saving offline message: ' + err.Message);
      res.send('');
    });
  });

  router.post('/RetrieveMessages', (req, res) => {
    let xmlMessage: string = req.body;
    let p = new Parser();
    let userID: UUIDString
    new Promise<string>((resolve, reject) => {
      p.parseString(xmlMessage, (err, result) => {
        if (err) return reject(err);
        resolve(result);
      });
    }).then((xml: any) => {
      userID = new UUIDString(xml.UUID.Guid[0]);
      return OfflineMgr.instance().getFor(userID);
    }).then((messages: string[]) => {

      res.send('<?xml version="1.0" encoding="utf-8"?><ArrayOfGridInstantMessage xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema">' +
        messages.join('') + '</ArrayOfGridInstantMessage>'
      );
    }).then(() => {
      return OfflineMgr.instance().clearFor(userID);
    }).catch((err) => {
      console.log('Error saving offline message: ' + err.Message);
      res.send('');
    });
  });

  router.all('*', (req, res) => {
    console.log('offline messages: ' + req.method + ': ' + req.originalUrl);
  });

  return router;
}
