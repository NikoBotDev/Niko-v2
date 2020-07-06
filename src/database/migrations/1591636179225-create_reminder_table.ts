import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export class createReminderTable1591636179225 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'reminders',
        columns: [
          {
            name: 'userId',
            type: 'varchar',
          },
          {
            name: 'guildId',
            type: 'varchar',
          },
          {
            name: 'channelId',
            type: 'varchar',
          },
          {
            name: 'message',
            type: 'text',
          },
          {
            name: 'time',
            type: 'timestamp',
          },
          {
            name: 'createdAt',
            type: 'timestamp',
          },
          {
            name: 'updatedAt',
            type: 'timestamp',
          },
        ],
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('reminders');
  }
}
