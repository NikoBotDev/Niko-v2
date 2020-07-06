import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export class createProfilesTable1592240920413 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'profiles',
        columns: [
          {
            name: 'userId',
            type: 'text',
            isPrimary: true,
          },
          {
            name: 'level',
            type: 'int',
            default: 1,
          },
          {
            name: 'xp',
            type: 'int',
            default: 1,
          },
          {
            name: 'coins',
            type: 'int',
            default: 0,
          },
          {
            name: 'married',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'profile_bg',
            type: 'varchar',
            default: "'default'",
          },
          {
            name: 'badges',
            type: 'json',
            default: "'[]'",
          },
          {
            name: 'streak',
            type: 'int',
            default: 0,
          },
          {
            name: 'createdAt',
            type: 'timestamp',
            default: 'NOW()',
          },
          {
            name: 'updatedAt',
            type: 'timestamp',
            default: 'NOW()',
          },
        ],
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('profiles');
  }
}
