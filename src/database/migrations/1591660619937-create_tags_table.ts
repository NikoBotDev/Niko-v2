import { MigrationInterface, QueryRunner, Table, TableIndex } from 'typeorm';

export class createTagsTable1591660619937 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'tags',
        columns: [
          {
            name: 'name',
            type: 'varchar',
            length: '80',
            isPrimary: true,
            isUnique: false
          },
          {
            name: 'content',
            type: 'text',
          },
          {
            name: 'guildId',
            type: 'varchar',
          },
          {
            name: 'userId',
            type: 'varchar',
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
      })
    );

    await queryRunner.createIndex(
      'tags',
      new TableIndex({
        columnNames: ['name', 'guildId'],
        isUnique: true,
        name: 'tag_name_guildId_unique',
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropIndex('tags', 'tag_name_guildId_unique');
    await queryRunner.dropTable('tags');
  }
}
