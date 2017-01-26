
export class UUIDString {
  private id: string

  constructor(id: string) {
    if (!id || !id.match('^[0-9a-f]{8}-?[0-9a-f]{4}-?[0-9a-f]{4}-?[0-9a-f]{4}-?[0-9a-f]{12}'))
      throw new Error('Error parsing UUIDString, invalid uuid: ' + id);
    if (id.length == 36) {
      this.id = id;
    } else if (id.length == 32) {
      this.id = id.slice(0, 8) + '-' + id.slice(8, 12) + '-' + id.slice(12, 16) + '-' + id.slice(16, 20) + '-' + id.slice(20);
    }
  }

  getreadable(): string {
    return this.id;
  }

  getShort(): string {
    return this.id.split('-').join('');
  }

  toString(): string {
    return this.id;
  }

  toJSON(): string {
    return this.id;
  }

  static zero(): UUIDString {
    return new UUIDString('00000000-0000-0000-0000-000000000000');
  }

  static random(): UUIDString {
    // based on http://stackoverflow.com/questions/26501688/a-typescript-guid-class
    return new UUIDString('xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
      let r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    }));
  }
}
