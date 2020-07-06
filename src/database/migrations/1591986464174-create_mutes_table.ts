import { MigrationInterface, QueryRunner, Table, TableUnique } from 'typeorm';

export class createMutesTable1591986464174 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'mutes',
        columns: [
          {
            name: 'id',
            type: 'text',
            isUnique: true,
            isPrimary: true,
          },
          {
            name: 'userId',
            type: 'varchar',
          },
          {
            name: 'modId',
            type: 'varchar',
          },
          {
            name: 'guildId',
            type: 'varchar',
          },
          {
            name: 'endDate',
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

    await queryRunner.createUniqueConstraint(
      'mutes',
      new TableUnique({
        name: 'UQ_guildId_userId',
        columnNames: ['guildId', 'userId'],
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropUniqueConstraint('mutes', 'UQ_guildId_userId');
    await queryRunner.dropTable('mutes');
  }
}
