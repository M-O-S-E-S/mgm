
import * as express from 'express';

import { Freeswitch, FreeSwitchDirectory, FreeSwitchUser, FreeSwitchChannel } from './Freeswitch';

export function FreeswitchHandler(fs: Freeswitch, isNode): express.Router {
  let router = express.Router();

  /*****************************
   * Freeswitch APIS
   *****************************/

  router.get('/', isNode, (req,res) => {
    res.send(fs.halcyonConfig());
  });

  router.post('/freeswitch-config', (req, res) => {
    let remoteIP: string = req.ip.split(':').pop();
    let section = req.body.section;

    switch (section) {
      case 'directory':
        return res.send(fs.directory(req.body));
      case 'dialplan':
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
    return res.send(fs.clientConfig());
  });

  router.post('/viv_signin.php', (req, res) => {
    let remoteIP: string = req.ip.split(':').pop();
    res.send(fs.signin(req.body));
  });

  // giving empty responses to various unknown SLVoice.exe queries
  //router.post('/viv_signout.php', (req, res) => { console.log('viv_signout stub'); res.send('')});
  //router.post('/viv_session_fonts.php', (req, res) => { console.log('viv_session_fonts stub'); res.send('')});
  //router.post('/viv_template_fonts.php', (req, res) => { console.log('viv_template_fonts stub'); res.send('')});
  //router.post('/viv_buddy.php', (req, res) => { console.log('viv_buddy stub'); res.send('')});
  //router.post('/viv_watcher.php', (req, res) => { console.log('viv_watcher stub'); res.send('')});


  /*****************************
   * Region APIS
   *****************************/

/* These are currently not used
  router.get('/getDirectory', isNode, (req, res) => {
    // directory request from a region
    // TODO: validate that this is a region we are communicating with
    let dir: FreeSwitchDirectory = fs.getDirectory(req.query.channame);
    if(dir){
      return res.send('<Result><Directory><ID>'+dir.id+'</ID></Directory></Result>')
    }
    return res.send('<Result></Result>');
  });

  router.get('/createDirectory', isNode, (req, res) => {
    // region requesting to create a directory
    // directories hold channels, but are channels themselves, ignore that for now
    fs.createDirectory(req.query.dirid, req.query.chan_desc, req.query.chan_type);
    let dir: FreeSwitchDirectory = fs.getDirectory(req.query.dirid);
    if(dir){
      return res.send('<Result><Directory><ID>'+dir.id+'</ID></Directory></Result>')
    }
    return res.send('<Result></Result>');
  });

  router.get('/getChannel', isNode, (req, res) => {
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

  router.get('/createChannel', isNode, (req, res) => {
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
*/

  router.get('/getAccountInfo', isNode, (req, res) => {
    let userAccount: FreeSwitchUser = fs.getAccountInfo(req.query.user, req.query.name);
    if(userAccount){
      let xml ='<Result><Account><UserID>'+
        userAccount.id+'</UserID><Password>'+
        userAccount.password+'</Password><Realm>'+
        userAccount.realm+'</Realm></Account></Result>';
      console.log('get account info')
      console.log(xml);
      return res.send(xml);
    }
    return res.send('<Result></Result>');
  });

  router.all('*', (req, res, next) => {
    console.log('freeswitch: ' + req.method + ': ' + req.originalUrl + ' unhandled');
    next();
  });

  return router;
}
