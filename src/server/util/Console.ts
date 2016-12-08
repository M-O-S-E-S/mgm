var urllib = require('urllib');
import { RegionInstance, HostInstance } from '../database';

export function ConsoleCommand(r: RegionInstance, h: HostInstance, cmd: string): Promise<void> {
    let url = 'http://' + h.address + ':' + h.port + '/consoleCmd/' + r.uuid;
    return urllib.request(url, {
      method: 'POST',
      data: { "cmd" : cmd }
    }).then((body) => {
      let result = JSON.parse(body.data);
      if (!result.Success) {
        throw new Error(result.Message);
      }
    });
  }