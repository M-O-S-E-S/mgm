import { createConnection, Connection } from 'promise-mysql';
import * as fs from 'fs';
import * as path from 'path';
import Promise = require('bluebird');

import { Config, LoadConfig } from '../Config';
let conf: Config = LoadConfig('../mgm.ini');

let sqlPath = process.argv[2] || '/mgm/sql/';

let creds = conf.mgmdb;
let conn: Connection

let maxVersion: number = -1;
let sqlFiles: { [key: number]: string } = {};

function loadSqlFile(c: Connection, filePath: string): Promise<void> {
  return new Promise<string>((resolve, reject) => {
    fs.readFile(filePath, (err: Error, data: Buffer) => {
      if (err) return reject(err);
      resolve(data.toString());
    });
  }).then((sql: string) => {
    return conn.query(sql);
  }).then( () => {
    console.log('loaded ' + filePath);
  }).catch( (err: Error) => {
    console.log('could not load ' + filePath);
    console.log(err.message);
  })
}

new Promise((resolve, reject) => {
  fs.readdir(sqlPath, (err, files: string[]) => {
    if (err) return reject(err);
    let sql = files.filter((f: string) => {
      return f.substr(f.length - 4) === '.sql';
    });
    resolve(sql);
  });
}).then((files: string[]) => {
  files.map((f: string) => {
    let index = parseInt(f.substring(0, 3));
    if (index > maxVersion)
      maxVersion = index;
    sqlFiles[index] = f;
  });
  return createConnection({
    host: creds.host,
    user: creds.user,
    password: creds.password,
    database: creds.database,
    multipleStatements: true
  });
}).then((c: Connection) => {
  conn = c;
  return c.query('SELECT * from mgmDb ORDER BY version DESC LIMIT 1').catch((err: Error) => {
    if ( err.message.length > 16 && 
      (err.message.substr(0, 16) === 'ER_NO_SUCH_TABLE' || err.message.substr(0,16) === 'ER_BAD_TABLE_ERROR')) {
      return [];
    } else {
      throw err;
    }
  });
}).then((rows: any[]) => {
  if (!rows || !rows.length || rows.length === 0)
    return -1;
  return parseInt(rows[0].version);
}).then((currentVersion: number) => {
  let p = Promise.resolve();
  while (currentVersion < maxVersion) {
    let num = currentVersion += 1;
    p = p.then(() => { return loadSqlFile(conn, path.join(sqlPath, sqlFiles[num])); })
  }
  return p;
}).then(() => {
  console.log('migration complete');
  process.exit(0);
}).catch((err: Error) => {
  console.log('An error occurred: ' + err.message);
  process.exit(1);
})
