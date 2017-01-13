
import * as express from 'express';

import { Freeswitch, FreeSwitchDirectory, FreeSwitchUser, FreeSwitchChannel } from './Freeswitch';

export function FreeswitchHandler(fs: Freeswitch): express.Router {
  let router = express.Router();

  /*****************************
   * Freeswitch APIS
   *****************************/

  /*router.get('/', (req,res) => {
    res.send(fs.halcyonConfig());
  });*/

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

  /*****************************
   * Client APIS
   *****************************/

  router.post('/viv_get_prelogin.php', (req, res) => {
    let remoteIP: string = req.ip.split(':').pop();
    console.log('post: /fsapi/viv_get_prelogin.php from ' + remoteIP);
    let result = fs.clientConfig();
    return res.send(result);
  });

  router.post('/viv_signin.php', (req, res) => {
    let remoteIP: string = req.ip.split(':').pop();
    console.log('post: /fsapi/viv_signin.php from ' + remoteIP);
    let result = fs.signin(req.body);
    return res.send(result);
  });

  // giving empty responses to various unknown SLVoice.exe queries
  router.post('/viv_signout.php', (req, res) => {res.send('')});
  router.post('/viv_session_fonts.php', (req, res) => {res.send('')});
  router.post('/viv_template_fonts.php', (req, res) => {res.send('')});
  router.post('/viv_session_fonts.php', (req, res) => {res.send('')});
  router.post('/viv_template_fonts.php', (req, res) => {res.send('')});

  /*****************************
   * Region APIS
   *****************************/

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

  router.get('/getChannel', (req, res) => {
    let chan: FreeSwitchChannel = fs.getChannel(req.query.parent, req.query.name);
    if(chan){
      return res.send(
        '<Result><Channel><ID>'
        + chan.id + 
        '</ID><URI>'
        + chan.uri + '</URI><Name>'
        + chan.name + '</Name><Parent>'
        + chan.parent + '</Parent></Channel></Result>'
      );
    }
    return res.send('<Result></Result>');
  });

  router.get('/createChannel', (req, res) => {
    fs.createChannel(req.query.parent, req.query.id, req.query.name)
    let chan: FreeSwitchChannel = fs.getChannel(req.query.parent, req.query.name);
    if(chan){
      return res.send(
        '<Result><Channel><ID>'
        + chan.id + 
        '</ID><URI>'
        + chan.uri + '</URI><Name>'
        + chan.name + '</Name><Parent>'
        + chan.parent + '</Parent></Channel></Result>'
      );
    }
    return res.send('<Result></Result>');
  });

  router.get('/getAccountInfo', (req, res) => {
    let userAccount: FreeSwitchUser = fs.getAccountInfo(req.query.user);
    if(userAccount){
      return res.send(
        '<Result><Account><UserID>'+
        userAccount.id+'</UserID><Password>'+
        userAccount.password+'</Password><Realm>'+
        userAccount.realm+'</Realm></Account></Result>')
    }
    return res.send('<Result></Result>');
  });

  router.all('*', (req, res, next) => {
    console.log('voice: ' + req.method + ': ' + req.originalUrl);
    next();
  });

  return router;
}
