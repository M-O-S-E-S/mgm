
var urllib = require('urllib');

import { Region } from './Region';
import { Host } from './host';
import { parseString } from 'xml2js';

export interface ConsoleSession {
  url: string
  SessionID: string
  prompt: string
}

export class RestConsole {

  static open(address: string, port: number, username: string, password: string): Promise<ConsoleSession> {
    let url = 'http://' + address + ':' + port;
    let client = urllib.create();

    return client.request(url + '/StartSession/', {
      method: 'POST',
      data: {
        'USER': username,
        'PASS': password
      }
    }).then((body) => {
      return new Promise<any>((resolve,reject) => {
        parseString(body.data, (err, result) => {
          if(err)
            return reject(err);
          resolve(result);
        });
      });
    }).then( (parsed) => {
      return {
        url: url,
        SessionID: parsed.ConsoleSession.SessionID[0],
        prompt: parsed.ConsoleSession.Prompt[0]
      }
    });
  }

  static close(session: ConsoleSession): Promise<void> {
    let client = urllib.create();

    return client.request(session.url + '/CloseSession/', {
      method: 'POST',
      data: {
        'ID': session.SessionID
      }
    });
  }

  static read(session: ConsoleSession): Promise<string[]>{
    let client = urllib.create();

    return client.request(session.url + '/ReadResponses/' + session.SessionID + '/', {
      method: 'POST',
      timeout: 90000, //90 seconds, region should error out first
      data: {
        'ID': session.SessionID
      }
    }).then( (body) => {
      return new Promise<any>((resolve,reject) => {
        parseString(body.data, (err, result) => {
          if(err)
            return reject(err);
          resolve(result);
        });
      });
    }).then( (parsed) => {
      let lines: string[] = [];
      if(!parsed || !parsed.ConsoleSession || !parsed.ConsoleSession.Line){
        return [];
      }
      for( let l of parsed.ConsoleSession.Line){
        lines.push(l._);
      }
      return lines;
    });
  }

  static write(session: ConsoleSession, command: string): Promise<void> {
    let client = urllib.create();
    return client.request(session.url + '/SessionCommand/', {
      method: 'POST',
      data: {
        'ID': session.SessionID,
        'COMMAND': command
      }
    });
  }
}
