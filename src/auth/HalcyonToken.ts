/// <reference path="../../definitions/urllib.d.ts" />

import * as urllib from 'urllib';

interface HalcyonResult {

}

export class HalcyonToken {
  
  static GetConsoleToken(userServerURI: string, username: string, password: string): Promise<string>{
    let url = userServerURI + '/auth/jwt/remote-console';
    return urllib.request(url, {
      method: 'POST',
      contentType: 'json',
      data: { 
        'username' : username,
        'password': password
      }
    }).then((body) => {
      if(body.status !== 200){
        throw new Error('Error communicating with user server');
      }
      let result = JSON.parse(body.data);
      switch(result.denied){
        case 'WrongUserLevel':
          return '';
        case 'InvalidPassword':
          return '';
        case undefined:
          return result.token || false;
        default:
          throw new Error(result.denied);
      }
    });
  }
}