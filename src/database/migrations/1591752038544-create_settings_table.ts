import { MigrationInterface, QueryRunner, Table, ColumnType } from 'typeorm';

export class createSettingsTable1591752038544 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'settings',
        columns: [
          {
            name: 'guild_id',
            type: 'varchar',
            isPrimary: true,
            isUnique: true,
          },
          {
            name: 'settings',
            type: 'text',
          },
        ],
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('settings');
  }
}
