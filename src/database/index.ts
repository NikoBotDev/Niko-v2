import { createConnection, Connection, MigrationExecutor } from 'typeorm';

class Database {
  public connection?: Connection;

  async init() {
    this.connection = await createConnection();
    await this.connection.runMigrations();
  }
}

export default new Database();
