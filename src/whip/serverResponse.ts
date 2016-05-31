
import { ServerResponseCodes, HEADERSIZE } from './types';

export class ServerResponse {
  code: ServerResponseCodes
  id: string
  length: number
  data: Buffer
  byteLength: number

  constructor(data: Buffer){
    if(data.length < HEADERSIZE)
      throw new Error('Incomplete message in buffer');
    this.code = data[0];
    this.id = data.slice(1,33).toString();
    this.length = data.readUInt32BE(33);
    this.byteLength = HEADERSIZE+this.length;
    if(this.length > 0){
      if(data.length >= this.byteLength){
        //pull the data we need
        this.data = data.slice(HEADERSIZE, this.byteLength);
      } else {
        throw new Error('Incomplete message in buffer');
      }
    } else {
      this.data = new Buffer([]);
    }
  }
}
