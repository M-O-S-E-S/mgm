
import { UUIDString } from '../halcyon/UUID';

export class Asset {
  uuid: UUIDString
  type: number
  local: boolean
  temporary: boolean
  createTime: number

  name: string
  description: string
  data: Buffer

  static HEADER_SIZE: number = 45;  //minimum size, with name='' and description='' and data=''
  static TYPE_TAG_OFFSET: number = 32;
  static LOCAL_TAG_OFFSET: number = 33;
  static TEMP_TAG_OFFSET: number = 34;
  static CREATE_TAG_OFFSET: number = 35;
  static NAME_TAG_OFFSET: number = 39;


  constructor(id: UUIDString, type: number, local: boolean, temporary: boolean, created: number, name: string, description: string, data: Buffer) {
    this.uuid = id;
    this.type = type;
    this.local = local;
    this.temporary = temporary;
    this.createTime = created;
    this.name = name.slice(0, 255);
    this.description = description.slice(0, 255);
    this.data = data;
  }

  serialize(): Buffer {
    let buf = new Buffer(Asset.HEADER_SIZE + this.name.length + this.description.length + this.data.length);
    buf.write(this.uuid.getShort());                              // 32 bytes   0:31
    buf[Asset.TYPE_TAG_OFFSET] = this.type;                       // 1 byte     32
    buf[Asset.LOCAL_TAG_OFFSET] = this.local ? 1 : 0;             // 1 byte     33
    buf[Asset.TEMP_TAG_OFFSET] = this.temporary ? 1 : 0;          // 1 byte     34
    buf.writeInt32BE(this.createTime, Asset.CREATE_TAG_OFFSET);   // 4 bytes    35-38
    buf[Asset.NAME_TAG_OFFSET] = this.name.length;                // 1 byte     39
    let descOffset: number;
    if(this.name.length > 0){
      buf.write(this.name, Asset.NAME_TAG_OFFSET + 1);           // ?? bytes   (writing at 40)
      descOffset = Asset.NAME_TAG_OFFSET + this.name.length + 1;
    } else {
      descOffset = Asset.NAME_TAG_OFFSET + 1;
    }

    buf[descOffset] = this.description.length;                    // 1 byte     40
    let dataOffset: number;
    if(this.description.length > 0){
      buf.write(this.description, descOffset + 1);                  // ?? bytes
      dataOffset = descOffset + this.description.length + 1;
    } else {
      dataOffset = descOffset + 1;
    }

    buf.writeInt32BE(this.data.length, dataOffset);               // 4 bytes    41-44
    this.data.copy(buf, dataOffset + 4);                          // ?? bytes
    return buf;
  }

  static fromBuffer(buf: Buffer): Asset {
    if (buf.length < Asset.HEADER_SIZE)
      throw new Error('Invalid asset buffer');
    let id: UUIDString = new UUIDString(buf.slice(0, 32).toString());
    let type: number = buf[Asset.TYPE_TAG_OFFSET];
    let local: boolean = buf[Asset.LOCAL_TAG_OFFSET] == 1;
    let temp: boolean = buf[Asset.TEMP_TAG_OFFSET] == 1;
    let create: number = buf.readInt32BE(Asset.CREATE_TAG_OFFSET);
    let nameLen: number = buf[Asset.NAME_TAG_OFFSET];
    let name: string = '';
    if (nameLen > 0 && buf.length >= Asset.HEADER_SIZE + nameLen) {
      name = buf.slice(Asset.NAME_TAG_OFFSET + 1, Asset.NAME_TAG_OFFSET + 1 + nameLen).toString();
    }
    let descOffset = Asset.NAME_TAG_OFFSET + name.length + 1;
    let descLen: number = buf[descOffset];
    let desc: string = '';
    if (descLen > 0 && buf.length >= Asset.HEADER_SIZE + nameLen + descLen) {
      desc = buf.slice(descOffset + 1, descOffset + 1 + descLen).toString();
    }
    let dataOffset = descOffset + desc.length + 1;
    let dataLen = buf.readInt32BE(dataOffset);
    let data = new Buffer([]);
    if(buf.length >= Asset.HEADER_SIZE + nameLen + descLen + dataLen)
      data = buf.slice(dataOffset + 4, dataOffset + 4 + dataLen);

    return new Asset(id, type, local, temp, create, name, desc, data);
  }

  toString(): string {
    return this.name + ', ' + this.description + ': ' + this.uuid;
  }
}
