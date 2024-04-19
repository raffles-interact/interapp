import { MigrationInterface, QueryRunner } from 'typeorm';

export class AllowManyTo1Ic1711719410050 implements MigrationInterface {
  name = 'AllowManyTo1Ic1711719410050';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "service" DROP CONSTRAINT "FK_c8c0d566268ec73503932c133bd"`,
    );
    await queryRunner.query(`ALTER TABLE "service" ALTER COLUMN "enable_scheduled" DROP DEFAULT`);
    await queryRunner.query(
      `ALTER TABLE "service" DROP CONSTRAINT "REL_c8c0d566268ec73503932c133b"`,
    );
    await queryRunner.query(
      `ALTER TABLE "service" ADD CONSTRAINT "FK_c8c0d566268ec73503932c133bd" FOREIGN KEY ("serviceIcUsername") REFERENCES "user"("username") ON DELETE CASCADE ON UPDATE CASCADE`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "service" DROP CONSTRAINT "FK_c8c0d566268ec73503932c133bd"`,
    );
    await queryRunner.query(
      `ALTER TABLE "service" ADD CONSTRAINT "REL_c8c0d566268ec73503932c133b" UNIQUE ("serviceIcUsername")`,
    );
    await queryRunner.query(
      `ALTER TABLE "service" ALTER COLUMN "enable_scheduled" SET DEFAULT true`,
    );
    await queryRunner.query(
      `ALTER TABLE "service" ADD CONSTRAINT "FK_c8c0d566268ec73503932c133bd" FOREIGN KEY ("serviceIcUsername") REFERENCES "user"("username") ON DELETE CASCADE ON UPDATE CASCADE`,
    );
  }
}
