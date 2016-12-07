
import * as io from "socket.io-client";

// singleton object to hold the websocket connection
export class Connection {
  private static _instance: Connection = new Connection();

  sock: SocketIOClient.Socket;

  constructor() {
    if (Connection._instance) {
      throw new Error("Error: Instantiation failed: Use SingletonClass.getInstance() instead of new.");
    }
    Connection._instance = this;
  }

  static instance(): Connection {
    return Connection._instance;
  }

  closeSocket() {
    if (this.sock && this.sock.connected)
      this.sock.close();
    this.sock = null;
  }

}