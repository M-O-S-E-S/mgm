
var urllib = require('urllib');
import { Parser } from 'xml2js';
import { UUIDString } from './UUID';

export interface AdminSession {
  url: string
  SessionID: UUIDString
}

function LoginRequest(username: string, password: string): string {
  return '<?xml version="1.0"?><methodCall><methodName>session.login_with_password</methodName>\
    <params><param><value>'+ username + '</value></param>\
    <param><value>' + password + '</value></param>\
    </params></methodCall>';
}

function LogoutRequest(id: UUIDString): string {
  return '<?xml version="1.0"?><methodCall><methodName>session.logout</methodName>\
    <params><param><value>'+ id.toString() + '</value></param>\
    </params></methodCall>';
}

function BackupRequest(session: UUIDString, regionName: string, filename: string, saveAssets: boolean) {
  return '<?xml version="1.0"?><methodCall><methodName>Region.Backup</methodName>\
    <params><param><value>'+ session.toString() + '</value></param>\
    <param><value>' + regionName + '</value></param>\
    <param><value>' + filename + '</value></param>\
    <param><value>' + saveAssets + '</value></param>\
    </params></methodCall>';
}

export class Response {
  value: string
  status: string

  static Parse(data: string): Promise<Response> {
    return new Promise<Response>((resolve, reject) => {
      let p = new Parser();
      let r = new Response();
      let e: string;
      p.parseString(data, (err, result) => {
        for (let m of result.methodResponse.params[0].param[0].value[0].struct[0].member) {
          switch (m.name[0]) {
            case 'Value':
              if (m.value[0].string) {
                r.value = m.value[0].string[0];
              } else if (m.value[0].boolean) {
                r.value = m.value[0].boolean[0] === 1 ? 'true' : 'false';
              }
              break;
            case 'Status':
              r.status = m.value[0].string[0];
              break;
            case 'ErrorDescription':
              e = m.value[0].string[0];
          }
        }
      });
      if (r.status === 'Success') {
        resolve(r);
      } else {
        reject(new Error(e));
      }
    });
  }
}

export class RemoteAdmin {

  static Open(address: string, port: number, username: string, password: string): Promise<AdminSession> {
    console.log('opening remote admin session');
    let url = 'http://' + address + ':' + port + '/xmlrpc/RemoteAdmin/';
    return urllib.request(url, {
      method: 'POST',
      data: LoginRequest(username, password)
    }).then((body) => {
      return Response.Parse(body.data);
    }).then((r: Response) => {
      return {
        url: url,
        SessionID: new UUIDString(r.value)
      }
    });
  }

  static Backup(session: AdminSession, regionName: string, filename: string, saveAssets: boolean): Promise<AdminSession> {
    console.log('backup called');
    // Halcyon tries to wait for the oar save to finish, but its http server times out after 5 seconds
    // we must catch this server-side timeout and report as success
    // THERE IS NO WAY TO DISCERN A SLOW SERVER FROM A SUCCESSFUL CALL
    return new Promise<AdminSession>((resolve, reject) => {
      urllib.request(session.url, {
        method: 'POST',
        data: BackupRequest(session.SessionID, regionName, filename, saveAssets)
      }).then((body) => {
        return Response.Parse(body.data);
      }).then((r: Response) => {
        if (r.value === 'true') {
          resolve(session);
        } else {
          reject(new Error('Could not execute oar save'));
        }
      }).catch((err: Error) => {
        if (err.name === 'ResponseTimeoutError') {
          resolve(session);
        } else {
          reject(err);
        }
      });
    });
  }

  static Close(session: AdminSession): Promise<void> {
    console.log('closing remote admin session');
    return urllib.request(session.url, {
      method: 'POST',
      data: LogoutRequest(session.SessionID)
    }).then((body) => {
      return Response.Parse(body.data);
    });
  }

}
