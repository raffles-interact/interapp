import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddServiceIc1701099790456 implements MigrationInterface {
  name = 'AddServiceIc1701099790456';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "service_session_user" RENAME COLUMN "is_admin" TO "is_ic"`,
    );
    await queryRunner.query(
      `ALTER TABLE "service" ADD "service_ic_username" character varying NOT NULL`,
    );
    await queryRunner.query(`ALTER TABLE "service" ADD "serviceIcUsername" character varying`);
    await queryRunner.query(
      `ALTER TABLE "service" ADD CONSTRAINT "UQ_c8c0d566268ec73503932c133bd" UNIQUE ("serviceIcUsername")`,
    );
    await queryRunner.query(
      `ALTER TABLE "service" ADD CONSTRAINT "FK_c8c0d566268ec73503932c133bd" FOREIGN KEY ("serviceIcUsername") REFERENCES "user"("username") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "service" DROP CONSTRAINT "FK_c8c0d566268ec73503932c133bd"`,
    );
    await queryRunner.query(
      `ALTER TABLE "service" DROP CONSTRAINT "UQ_c8c0d566268ec73503932c133bd"`,
    );
    await queryRunner.query(`ALTER TABLE "service" DROP COLUMN "serviceIcUsername"`);
    await queryRunner.query(`ALTER TABLE "service" DROP COLUMN "service_ic_username"`);
    await queryRunner.query(
      `ALTER TABLE "service_session_user" RENAME COLUMN "is_ic" TO "is_admin"`,
    );
  }
}
