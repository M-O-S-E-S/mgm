import { RequestHandler } from 'express';
import { Store } from '../Store';
import { IUser, IPendingUser } from '../Types';

import { Parser } from 'xml2js';

// insert middleware to put the body back
/*router.use(function(req, res, next) {
  var data = '';
  req.setEncoding('utf8');
  req.on('data', function(chunk) {
    data += chunk;
  });
  req.on('end', function() {
    req.body = data;
    next()
  });
});*/

export function SaveOfflineMessageHandler(store: Store): RequestHandler {
  return (req, res) => {
    let xmlMessage: string = req.body;
    xmlMessage = xmlMessage.slice(xmlMessage.lastIndexOf('?>') + 2);

    let p = new Parser();

    new Promise<string>((resolve, reject) => {
      p.parseString(xmlMessage, (err, result) => {
        if (err) return reject(err);
        resolve(result);
      });
    }).then((xml: any) => {
      let toAgent = xml.GridInstantMessage.toAgentID[0];
      return store.OfflineMessages.save(toAgent.toString(), xmlMessage);
    }).then(() => {
      res.send('<?xml version="1.0" encoding="utf-8"?><boolean>true</boolean>');
    }).catch((err) => {
      console.log('Error saving offline message: ' + err.Message);
      res.send('');
    });
  };
}

export function ReadOfflineMessageHandler(store: Store): RequestHandler {
  return (req, res) => {
    let xmlMessage: string = req.body;
    let p = new Parser();
    let userID: string;
    new Promise<string>((resolve, reject) => {
      p.parseString(xmlMessage, (err, result) => {
        if (err) return reject(err);
        resolve(result);
      });
    }).then((xml: any) => {
      userID = xml.UUID.Guid[0];
      return store.OfflineMessages.getFor(userID.toString());
    }).then((messages: string[]) => {
      res.send('<?xml version="1.0" encoding="utf-8"?><ArrayOfGridInstantMessage xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema">' +
        messages.map((m: string) => { return m }).join('') + '</ArrayOfGridInstantMessage>'
      );
    }).then(() => {
      return store.OfflineMessages.destroyFor(userID.toString());
    }).catch((err) => {
      console.log('Error saving offline message: ' + err.Message);
      res.send('');
    });
  };
}
