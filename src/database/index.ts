import { createConnection, Connection } from 'typeorm';

class Database {
  public connection?: Connection;

  async init() {
    this.connection = await createConnection();
  }
}

export default new Database();
