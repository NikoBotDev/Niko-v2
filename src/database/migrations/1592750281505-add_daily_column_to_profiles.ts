import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

// eslint-disable-next-line prettier/prettier
export class addDailyColumnToProfiles1592750281505
  implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn(
      'profiles',
      new TableColumn({
        name: 'daily',
        type: 'timestamp',
        default: 'NOW()',
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn('profiles', 'daily');
  }
}
