
import { UUIDString } from './halcyon/UUID';
import { SqlConnector } from './halcyon/sqlConnector';
import { User, Appearance, Credential } from './halcyon/User';
import { Inventory } from './halcyon/Inventory';
import { Config } from './mgm/MGM';
import { RemoteAdmin } from './halcyon/RemoteAdmin';

let fs = require('fs');

var conf: Config = require('../settings.js');

let hal = new SqlConnector(conf.halcyon);

class UserRow {
  fname: string
  lname: string
  password: string
  email: string
  template: string
}
// users are of the format: { fname:, lname:, password:, email:, template: }
function createUsers(path: string) {
  fs.readFile(path, 'utf8', (err, data) => {
    if (err)
      throw err;
    let rows: string[] = data.trim().split('\n');
    let workers = rows.map((row) => {
      let r: UserRow = JSON.parse(row)
      console.log('r.lname');
      return hal.getUser(new UUIDString(conf.mgm.templates[r.template])).then((u: User) => {
        return u.templateOnto(r.fname, r.lname, r.password, r.email, hal);
      });
    });

    Promise.all(workers).then(() => {
      console.log('complete');
      process.exit();
    });
  });
}

function deleteUsers(path: string) {
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
  }).catch((err: Error) => {
    console.log('Error: ' + err.message);
  }).finally(() => {
    process.exit();
  })

}

function printInventory(id: string) {
  let uuid = new UUIDString(id);
  hal.getInventory(uuid).then((i: Inventory) => {
    for (let l of i.getItems()) {
      console.log(l.assetID.toString());
    }
    //console.log(i);
  }).then(() => {
    console.log('complete');
    process.exit();
  })
}

function usage() {
  console.log('---------USAGE--------');
  console.log('createUser fname lname password [email] [userLevel]');
  console.log('    create a new user. default user level is 1');
  console.log('createUsers filename');
  console.log('    create many users using a newline delimited file containing json records')
}

let args = process.argv.slice(2);

if (args.length < 1) {
  usage();
}

switch (args[0]) {
  case 'createUser':
    createUser(args.splice(1));
    break;
  case 'createUsers':
    createUsers(args.splice(1)[0]);
    break;
  case 'deleteUsers':
    deleteUsers(args.splice(1)[0]);
    break;
  case 'printInventory':
    printInventory(args.splice(1)[0]);
    break;
  case 'radmin':
    RemoteAdmin.Open('10.10.0.108', 9000, conf.console.user, conf.console.pass)
      .then( (session) => {
        return RemoteAdmin.Backup(session, 'Ratio', 'haz', true);
      }).then(RemoteAdmin.Close)
      .catch((err: Error) => {
        console.log('Error: ' + err.message);
      })
    break;
  default:
    usage();
}

//deleteBots();
//createBots();
