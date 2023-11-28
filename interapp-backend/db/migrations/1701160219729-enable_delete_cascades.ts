import { MigrationInterface, QueryRunner } from 'typeorm';

export class EnableDeleteCascades1701160219729 implements MigrationInterface {
  name = 'EnableDeleteCascades1701160219729';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "service_session_user" DROP CONSTRAINT "FK_9731d8f5e9512262ff4f4ad34aa"`,
    );
    await queryRunner.query(
      `ALTER TABLE "service_session" DROP CONSTRAINT "FK_10d1cb8d1fca84c0587a748b2d5"`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_service" DROP CONSTRAINT "FK_c7fb0fc77efa4dfcd8e999e0ae1"`,
    );
    await queryRunner.query(
      `ALTER TABLE "service_session_user" ADD CONSTRAINT "FK_9731d8f5e9512262ff4f4ad34aa" FOREIGN KEY ("serviceSessionServiceSessionId") REFERENCES "service_session"("service_session_id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "service_session" ADD CONSTRAINT "FK_10d1cb8d1fca84c0587a748b2d5" FOREIGN KEY ("serviceServiceId") REFERENCES "service"("service_id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_service" ADD CONSTRAINT "FK_c7fb0fc77efa4dfcd8e999e0ae1" FOREIGN KEY ("serviceServiceId") REFERENCES "service"("service_id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "user_service" DROP CONSTRAINT "FK_c7fb0fc77efa4dfcd8e999e0ae1"`,
    );
    await queryRunner.query(
      `ALTER TABLE "service_session" DROP CONSTRAINT "FK_10d1cb8d1fca84c0587a748b2d5"`,
    );
    await queryRunner.query(
      `ALTER TABLE "service_session_user" DROP CONSTRAINT "FK_9731d8f5e9512262ff4f4ad34aa"`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_service" ADD CONSTRAINT "FK_c7fb0fc77efa4dfcd8e999e0ae1" FOREIGN KEY ("serviceServiceId") REFERENCES "service"("service_id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "service_session" ADD CONSTRAINT "FK_10d1cb8d1fca84c0587a748b2d5" FOREIGN KEY ("serviceServiceId") REFERENCES "service"("service_id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "service_session_user" ADD CONSTRAINT "FK_9731d8f5e9512262ff4f4ad34aa" FOREIGN KEY ("serviceSessionServiceSessionId") REFERENCES "service_session"("service_session_id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }
}
