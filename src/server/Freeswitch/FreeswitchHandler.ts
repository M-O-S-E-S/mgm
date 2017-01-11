
import * as express from 'express';

import { Freeswitch, FreeSwitchDirectory } from './Freeswitch';

export function FreeswitchHandler(fs: Freeswitch): express.Router {
  let router = express.Router();

  router.get('/', (req,res) => {
    res.send(fs.halcyonConfig());
  });

  router.post('/freeswitch-config', (req, res) => {
    let remoteIP: string = req.ip.split(':').pop();
    console.log('post: /fsapi/freeswitch-config from ' + remoteIP);
    let section = req.body.section;

    switch (section) {
      case 'directory':
        console.log('/freeswitch-config: directory');
        return res.send(fs.directory(req.body));
      case 'dialplan':
        console.log('/freeswitch-config: dialplan');
        return res.send(fs.dialplan(req.body));
      default:
        console.log('unknown freeswitch config section: ' + section);
        return res.send('');
    }
  });

  router.post('/viv_get_prelogin.php', (req, res) => {
    let remoteIP: string = req.ip.split(':').pop();
    console.log('post: /fsapi/viv_get_prelogin.php from ' + remoteIP);
    let result = fs.clientConfig();
    console.log(result);
    return res.send(result);
  });

  router.post('/viv_signin.php', (req, res) => {
    let remoteIP: string = req.ip.split(':').pop();
    console.log('post: /fsapi/viv_signin.php from ' + remoteIP);
    let result = fs.signin(req.body);
    console.log(result);
    return res.send(result);
  });

  router.get('/getDirectory', (req, res) => {
    // directory request from a region
    // TODO: validate that this is a region we are communicating with
    let dir: FreeSwitchDirectory = fs.getDirectory(req.query.channame);
    if(dir){
      return res.send('<Result><Directory><ID>'+dir.id+'</ID></Directory></Result>')
    }
    return res.send('<Result></Result>');
  });

  router.get('/createDirectory', (req, res) => {
    // region requesting to create a directory
    // directories hold channels, but are channels themselves, ignore that for now
    fs.createDirectory(req.query.dirid, req.query.chan_desc, req.query.chan_type);
    let dir: FreeSwitchDirectory = fs.getDirectory(req.query.dirid);
    if(dir){
      return res.send('<Result><Directory><ID>'+dir.id+'</ID></Directory></Result>')
    }
    return res.send('<Result></Result>');
  });

  router.all('*', (req, res, next) => {
    console.log('voice: ' + req.method + ': ' + req.originalUrl);
    next();
  });

  return router;
}
