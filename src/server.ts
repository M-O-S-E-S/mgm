
/// <reference path="../typings/index.d.ts" />

import * as express from 'express';
import * as bodyParser from 'body-parser';
import * as path from 'path';
import * as fs from 'fs';

import { SetupRoutes } from './routes';
import { Config, Validate } from './Config';

let conf: Config = require('../settings.js');
if (!Validate(conf)) {
  process.exit(1);
}
conf.mgm.certificate = fs.readFileSync(conf.mgm.privateKeyPath)


//initialize singletons
import { EmailMgr } from './lib';
new EmailMgr(conf.mgm.mail);

let app = express();

app.use(bodyParser.json({ limit: '1gb' }));       // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
  extended: true,
  limit: '1gb'
}));

app.use(express.static(__dirname + '/public'));

app.use('/api', SetupRoutes(conf));

app.get('*', (req, res) => {
  res.sendFile(__dirname + '/public/index.html');
})

app.listen(3000, function () {
  console.log('MGM listening on port 3000!');
});
