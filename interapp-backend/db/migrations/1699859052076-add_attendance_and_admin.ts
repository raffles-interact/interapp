import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddAttendanceAndAdmin1699859052076 implements MigrationInterface {
  name = 'AddAttendanceAndAdmin1699859052076';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."service_session_user_attended_enum" AS ENUM('Attended', 'Absent', 'Valid Reason')`,
    );
    await queryRunner.query(
      `ALTER TABLE "service_session_user" ADD "attended" "public"."service_session_user_attended_enum" NOT NULL`,
    );
    await queryRunner.query(`ALTER TABLE "service_session_user" ADD "is_admin" boolean NOT NULL`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "service_session_user" DROP COLUMN "is_admin"`);
    await queryRunner.query(`ALTER TABLE "service_session_user" DROP COLUMN "attended"`);
    await queryRunner.query(`DROP TYPE "public"."service_session_user_attended_enum"`);
  }
}
