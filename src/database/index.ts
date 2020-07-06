import { createConnection, Connection, getConnectionOptions } from 'typeorm';

class Database {
  public connection?: Connection;

  async init() {
    const connectionOptions = await getConnectionOptions();
    Object.assign(connectionOptions, {
      url: process.env.DATABASE_URL,
      logging: process.env.NODE_ENV === 'development',
    });

    this.connection = await createConnection(connectionOptions);
    await this.connection.runMigrations();
  }
}

export default new Database();
