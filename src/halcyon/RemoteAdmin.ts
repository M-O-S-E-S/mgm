
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
    <param><value>' + password + '</value></param></params></methodCall>';
}

function LogoutRequest(id: UUIDString): string {
  return '<?xml version="1.0"?><methodCall><methodName>session.logout</methodName>\
    <params><param><value>'+ id.toString() + '</value></param>\
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
        //console.log(result.methodResponse.params[0].param[0].value[0].struct[0].member);
        for (let m of result.methodResponse.params[0].param[0].value[0].struct[0].member) {
          switch (m.name[0]) {
            case 'Value':
              r.value = m.value[0].string[0];
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

  static Close(session: AdminSession): Promise<void> {
    return urllib.request(session.url, {
      method: 'POST',
      data: LogoutRequest(session.SessionID)
    }).then((body) => {
      return Response.Parse(body.data);
    });
  }

}
