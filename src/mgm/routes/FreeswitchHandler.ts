
import * as express from 'express';

import { Freeswitch } from '../Freeswitch';

export function FreeswitchHandler(fs: Freeswitch): express.Router {
  let router = express.Router();

  router.post('/freeswitch-config', (req, res) => {

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
    }
    res.send('');
  });

  router.post('/viv_get_prelogin.php', (req, res) => {
    console.log('/viv_get_prelogin.php');
    console.log(req.body);
    let result = fs.config(req.body);
    console.log(result);
    return res.send(result);
  });

  router.post('/viv_signin.php', (req, res) => {
    return res.send(fs.signin(req.body));
  });

  //region-config
  // fs.getConfig

  router.all('*', (req, res) => {
    console.log('voice: ' + req.method + ': ' + req.originalUrl);
  });

  return router;
}
