
import { UUIDString } from './halcyon/UUID';
import { SqlConnector } from './halcyon/sqlConnector';
import { Sql } from './mysql/sql';
import { User, Appearance, Credential } from './halcyon/User';

var conf = require('../conf.json');

let hal = new SqlConnector(new Sql(conf.halcyon));

function createBots() {
  hal.getUser(new UUIDString('38ed49f0-986a-40e7-bb12-227ea40b8b7c')).then((t: User) => {
    let fs = require('fs');
    fs.readFile('users.txt', 'utf8', (err, data) => {
      if (err)
        throw err;
      let rows: string[] = data.trim().split('\n');
      let workers = [];
      for (let row of rows) {
        let u = JSON.parse(row)
        console.log(u.lname);
        let w = t.templateOnto(u.fname, u.lname, u.password, u.email, hal);
        workers.push(w);
      }

      Promise.all(workers).then(() => {
        console.log('complete');
        process.exit();
      });
    });
  });
}

function deleteBots() {
  let fs = require('fs');
  fs.readFile('users.txt', 'utf8', (err, data) => {
    if (err)
      throw err;
    let rows: string[] = data.trim().split('\n');
    let workers = [];

    hal.getAllUsers().then((users: User[]) => {
      for (let row of rows) {
        let j = JSON.parse(row)
        for (let u of users) {
          if (u.username === j.fname && u.lastname === j.lname) {
            let p = hal.deleteUser(u.UUID).then(() => {
              console.log('deleted: ' + u.lastname);
            });
            workers.push(p);
          }
        }

      }
    }).then(() => {
      return Promise.all(workers);
    }).finally(() => {
      console.log('complete');
      process.exit();
    });
  });
}

//deleteBots();
createBots();
