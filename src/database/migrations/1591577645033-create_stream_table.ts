import { MigrationInterface, QueryRunner, Table, TableIndex } from 'typeorm';

export class createStreamTable1591577645033 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'streams',
        columns: [
          {
            name: 'channelId',
            type: 'varchar',
          },
          {
            name: 'guildId',
            type: 'varchar',
          },
          {
            name: 'message',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'username',
            type: 'varchar',
          },
          {
            name: 'streaming',
            type: 'boolean',
          },
          {
            name: 'startedAt',
            type: 'datetime',
            isNullable: true,
          },
          {
            name: 'createdAt',
            type: 'datetime',
          },
          {
            name: 'updatedAt',
            type: 'datetime',
          },
        ],
      }),
      true
    );

    await queryRunner.createIndex(
      'streams',
      new TableIndex({
        name: 'streams_channelId_username',
        isUnique: true,
        columnNames: ['channelId', 'username'],
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropIndex('streams', 'streams_channelId_username');
    await queryRunner.dropTable('streams');
  }
}
