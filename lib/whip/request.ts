
import { RequestCodes, HEADERSIZE } from './types';
import { UUIDString } from '../halcyon/UUID';

/* Request data structure:

headerSize + dataSize
(byte) type
Ascii(assetUUID)
bytes(networkOrder(dataSize))

*/

export class ClientRequest {
  buf: Buffer
  id: UUIDString

  constructor(rType: RequestCodes, id?: UUIDString, data?: Buffer) {
    if (!id)
      id = UUIDString.zero();
    if (!data)
      data = new Buffer([]);

    this.id = id;
    this.buildHeader(rType, id, data.length);

    if (data.length > 0) {
      this.buf = Buffer.concat([this.buf, data]);
    }
  }

  private buildHeader(type: RequestCodes, id: UUIDString, dataLength: number) {
    this.buf = new Buffer(HEADERSIZE);
    this.buf.writeInt8(type, 0);
    this.buf.write(id.getShort(), 1);
    this.buf.writeUInt32BE(dataLength, 33);
  }
}
