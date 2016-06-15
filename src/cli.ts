
import { UUIDString } from './halcyon/UUID';
import { SqlConnector } from './halcyon/sqlConnector';
import { User, Appearance, Credential } from './halcyon/User';
import { Inventory } from './halcyon/Inventory';

var conf = require('../settings.js');

let hal = new SqlConnector(conf.halcyon);

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

function createUser(args: string[]) {
  if (args.length < 3) {
    return usage();
  }
  let firstName = args[0];
  let lastName = args[1];
  let password = args[2];
  let email = args[3] || '';
  let userLevel = parseInt(args[4]) || 1;

  console.log('Creating new user ' + firstName + ' ' + lastName);

  let user = new User(
    UUIDString.random(),
    firstName,
    lastName,
    email,
    Credential.fromPlaintext(password),
    userLevel,
    0
    );
  let inventory = Inventory.skeleton(user.UUID);
  hal.addUser(user).then(() => {
    return hal.addInventory(inventory);
  }).then(() => {
    console.log('User added successfully');
  }).catch( (err: Error) => {
    console.log('Error: ' + err.message);
  }).finally( () => {
    process.exit();
  })

}

function usage() {
  console.log('---------USAGE--------');
  console.log('createUser fname lname password [email] [userLevel]');
  console.log('    create a new user. default user level is 1');
}

let args = process.argv.slice(2);

if (args.length < 1) {
  usage();
}

switch (args[0]) {
  case 'createUser':
    createUser(args.splice(1));
    break;

  default:
    usage();
}

//deleteBots();
//createBots();
