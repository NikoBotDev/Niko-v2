export = {
  type: 'sqlite',
  migrations: ['./src/database/migrations/*.ts'],
  database: './.data/db.sqlite',
  entities: ['./src/database/entities/*.ts'],
  cli: {
    migrationsDir: './src/database/migrations',
    entitiesDir: './src/database/entities',
  },
};
