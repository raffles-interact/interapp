import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddProfilePicture1704278346229 implements MigrationInterface {
  name = 'AddProfilePicture1704278346229';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "user" ADD "profile_picture" character varying`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "profile_picture"`);
  }
}
