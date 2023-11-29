import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddTitleAnnouncement1701188767218 implements MigrationInterface {
  name = 'AddTitleAnnouncement1701188767218';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "announcement" ADD "title" character varying NOT NULL`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "announcement" DROP COLUMN "title"`);
  }
}
