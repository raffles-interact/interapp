import { MigrationInterface, QueryRunner } from 'typeorm';

export class ImplPassword1700134399562 implements MigrationInterface {
  name = 'ImplPassword1700134399562';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "name"`);
    await queryRunner.query(`ALTER TABLE "user" ADD "username" character varying NOT NULL`);
    await queryRunner.query(`ALTER TABLE "user" ADD "password_hash" character varying NOT NULL`);
    await queryRunner.query(
      `ALTER TABLE "announcement_completion" DROP CONSTRAINT "FK_2f049542ec7013cdcf61683debb"`,
    );
    await queryRunner.query(
      `ALTER TABLE "announcement" DROP CONSTRAINT "FK_b5289f6eb4f4ef3b388f9f33956"`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_permission" DROP CONSTRAINT "FK_37884f6cf1228bd818db712e443"`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_service" DROP CONSTRAINT "FK_7629ede0daaadca41f6ffe152b2"`,
    );
    await queryRunner.query(
      `ALTER TABLE "service_session_user" DROP CONSTRAINT "FK_c7bf6667d0869d0f9ad3bc1d023"`,
    );
    await queryRunner.query(`ALTER TABLE "user" ALTER COLUMN "user_id" DROP DEFAULT`);
    await queryRunner.query(`DROP SEQUENCE "user_user_id_seq"`);
    await queryRunner.query(
      `ALTER TABLE "user_permission" ADD CONSTRAINT "FK_37884f6cf1228bd818db712e443" FOREIGN KEY ("userUserId") REFERENCES "user"("user_id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "service_session_user" ADD CONSTRAINT "FK_c7bf6667d0869d0f9ad3bc1d023" FOREIGN KEY ("userUserId") REFERENCES "user"("user_id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_service" ADD CONSTRAINT "FK_7629ede0daaadca41f6ffe152b2" FOREIGN KEY ("userUserId") REFERENCES "user"("user_id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "announcement" ADD CONSTRAINT "FK_b5289f6eb4f4ef3b388f9f33956" FOREIGN KEY ("userUserId") REFERENCES "user"("user_id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "announcement_completion" ADD CONSTRAINT "FK_2f049542ec7013cdcf61683debb" FOREIGN KEY ("userUserId") REFERENCES "user"("user_id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "announcement_completion" DROP CONSTRAINT "FK_2f049542ec7013cdcf61683debb"`,
    );
    await queryRunner.query(
      `ALTER TABLE "announcement" DROP CONSTRAINT "FK_b5289f6eb4f4ef3b388f9f33956"`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_service" DROP CONSTRAINT "FK_7629ede0daaadca41f6ffe152b2"`,
    );
    await queryRunner.query(
      `ALTER TABLE "service_session_user" DROP CONSTRAINT "FK_c7bf6667d0869d0f9ad3bc1d023"`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_permission" DROP CONSTRAINT "FK_37884f6cf1228bd818db712e443"`,
    );
    await queryRunner.query(
      `CREATE SEQUENCE IF NOT EXISTS "user_user_id_seq" OWNED BY "user"."user_id"`,
    );
    await queryRunner.query(
      `ALTER TABLE "user" ALTER COLUMN "user_id" SET DEFAULT nextval('"user_user_id_seq"')`,
    );
    await queryRunner.query(
      `ALTER TABLE "service_session_user" ADD CONSTRAINT "FK_c7bf6667d0869d0f9ad3bc1d023" FOREIGN KEY ("userUserId") REFERENCES "user"("user_id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_service" ADD CONSTRAINT "FK_7629ede0daaadca41f6ffe152b2" FOREIGN KEY ("userUserId") REFERENCES "user"("user_id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_permission" ADD CONSTRAINT "FK_37884f6cf1228bd818db712e443" FOREIGN KEY ("userUserId") REFERENCES "user"("user_id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "announcement" ADD CONSTRAINT "FK_b5289f6eb4f4ef3b388f9f33956" FOREIGN KEY ("userUserId") REFERENCES "user"("user_id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "announcement_completion" ADD CONSTRAINT "FK_2f049542ec7013cdcf61683debb" FOREIGN KEY ("userUserId") REFERENCES "user"("user_id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "password_hash"`);
    await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "username"`);
    await queryRunner.query(`ALTER TABLE "user" ADD "name" character varying NOT NULL`);
  }
}
