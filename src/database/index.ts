import { createConnection, Connection } from 'typeorm';

class Database {
  public connection?: Connection;
  constructor() {}

  async init() {
    this.connection = await createConnection();
  }
}

export default new Database();
