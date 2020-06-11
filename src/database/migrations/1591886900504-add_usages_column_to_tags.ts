import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class addUsagesColumnToTags1591886900504 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn(
      'tags',
      new TableColumn({
        name: 'usages',
        type: 'int',
        default: 0,
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn('tags', 'usages');
  }
}
