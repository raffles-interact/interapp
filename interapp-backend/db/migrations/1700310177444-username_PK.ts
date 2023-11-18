import { MigrationInterface, QueryRunner } from 'typeorm';

export class UsernamePK1700310177444 implements MigrationInterface {
  name = 'UsernamePK1700310177444';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "user_permission" DROP CONSTRAINT "FK_37884f6cf1228bd818db712e443"`,
    );
    await queryRunner.query(
      `ALTER TABLE "service_session_user" DROP CONSTRAINT "FK_c7bf6667d0869d0f9ad3bc1d023"`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_service" DROP CONSTRAINT "FK_7629ede0daaadca41f6ffe152b2"`,
    );
    await queryRunner.query(
      `ALTER TABLE "announcement" DROP CONSTRAINT "FK_b5289f6eb4f4ef3b388f9f33956"`,
    );
    await queryRunner.query(
      `ALTER TABLE "announcement_completion" DROP CONSTRAINT "FK_2f049542ec7013cdcf61683debb"`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_permission" RENAME COLUMN "userUserId" TO "userUsername"`,
    );
    await queryRunner.query(
      `ALTER TABLE "service_session_user" RENAME COLUMN "userUserId" TO "userUsername"`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_service" RENAME COLUMN "userUserId" TO "userUsername"`,
    );
    await queryRunner.query(
      `ALTER TABLE "announcement" RENAME COLUMN "userUserId" TO "userUsername"`,
    );
    await queryRunner.query(
      `ALTER TABLE "announcement_completion" RENAME COLUMN "userUserId" TO "userUsername"`,
    );
    await queryRunner.query(`ALTER TABLE "user_permission" DROP COLUMN "userUsername"`);
    await queryRunner.query(`ALTER TABLE "user_permission" ADD "userUsername" character varying`);
    await queryRunner.query(`ALTER TABLE "service_session_user" DROP COLUMN "userUsername"`);
    await queryRunner.query(
      `ALTER TABLE "service_session_user" ADD "userUsername" character varying`,
    );
    await queryRunner.query(`ALTER TABLE "user_service" DROP COLUMN "userUsername"`);
    await queryRunner.query(`ALTER TABLE "user_service" ADD "userUsername" character varying`);
    await queryRunner.query(`ALTER TABLE "user" DROP CONSTRAINT "PK_758b8ce7c18b9d347461b30228d"`);
    await queryRunner.query(
      `ALTER TABLE "user" ADD CONSTRAINT "PK_8e5a84becb39f1e68b269dc1ed4" PRIMARY KEY ("user_id", "username")`,
    );
    await queryRunner.query(`ALTER TABLE "user" DROP CONSTRAINT "UQ_78a916df40e02a9deb1c4b75edb"`);
    await queryRunner.query(`ALTER TABLE "user" DROP CONSTRAINT "PK_8e5a84becb39f1e68b269dc1ed4"`);
    await queryRunner.query(
      `ALTER TABLE "user" ADD CONSTRAINT "PK_78a916df40e02a9deb1c4b75edb" PRIMARY KEY ("username")`,
    );
    await queryRunner.query(
      `ALTER TABLE "user" ADD CONSTRAINT "UQ_758b8ce7c18b9d347461b30228d" UNIQUE ("user_id")`,
    );
    await queryRunner.query(`ALTER TABLE "announcement" DROP COLUMN "userUsername"`);
    await queryRunner.query(`ALTER TABLE "announcement" ADD "userUsername" character varying`);
    await queryRunner.query(`ALTER TABLE "announcement_completion" DROP COLUMN "userUsername"`);
    await queryRunner.query(
      `ALTER TABLE "announcement_completion" ADD "userUsername" character varying`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_permission" ADD CONSTRAINT "FK_de6aaa3986b9ebee69cdaef2467" FOREIGN KEY ("userUsername") REFERENCES "user"("username") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "service_session_user" ADD CONSTRAINT "FK_93c5a4bd8f54d4f25734d405445" FOREIGN KEY ("userUsername") REFERENCES "user"("username") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_service" ADD CONSTRAINT "FK_118cbde2116c9becff2b3216947" FOREIGN KEY ("userUsername") REFERENCES "user"("username") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "announcement" ADD CONSTRAINT "FK_661b425a5356c3d120353fc97fc" FOREIGN KEY ("userUsername") REFERENCES "user"("username") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "announcement_completion" ADD CONSTRAINT "FK_eb873ba543dd0c052efb8d9df72" FOREIGN KEY ("userUsername") REFERENCES "user"("username") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "announcement_completion" DROP CONSTRAINT "FK_eb873ba543dd0c052efb8d9df72"`,
    );
    await queryRunner.query(
      `ALTER TABLE "announcement" DROP CONSTRAINT "FK_661b425a5356c3d120353fc97fc"`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_service" DROP CONSTRAINT "FK_118cbde2116c9becff2b3216947"`,
    );
    await queryRunner.query(
      `ALTER TABLE "service_session_user" DROP CONSTRAINT "FK_93c5a4bd8f54d4f25734d405445"`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_permission" DROP CONSTRAINT "FK_de6aaa3986b9ebee69cdaef2467"`,
    );
    await queryRunner.query(`ALTER TABLE "announcement_completion" DROP COLUMN "userUsername"`);
    await queryRunner.query(`ALTER TABLE "announcement_completion" ADD "userUsername" integer`);
    await queryRunner.query(`ALTER TABLE "announcement" DROP COLUMN "userUsername"`);
    await queryRunner.query(`ALTER TABLE "announcement" ADD "userUsername" integer`);
    await queryRunner.query(`ALTER TABLE "user" DROP CONSTRAINT "UQ_758b8ce7c18b9d347461b30228d"`);
    await queryRunner.query(`ALTER TABLE "user" DROP CONSTRAINT "PK_78a916df40e02a9deb1c4b75edb"`);
    await queryRunner.query(
      `ALTER TABLE "user" ADD CONSTRAINT "PK_8e5a84becb39f1e68b269dc1ed4" PRIMARY KEY ("user_id", "username")`,
    );
    await queryRunner.query(
      `ALTER TABLE "user" ADD CONSTRAINT "UQ_78a916df40e02a9deb1c4b75edb" UNIQUE ("username")`,
    );
    await queryRunner.query(`ALTER TABLE "user" DROP CONSTRAINT "PK_8e5a84becb39f1e68b269dc1ed4"`);
    await queryRunner.query(
      `ALTER TABLE "user" ADD CONSTRAINT "PK_758b8ce7c18b9d347461b30228d" PRIMARY KEY ("user_id")`,
    );
    await queryRunner.query(`ALTER TABLE "user_service" DROP COLUMN "userUsername"`);
    await queryRunner.query(`ALTER TABLE "user_service" ADD "userUsername" integer`);
    await queryRunner.query(`ALTER TABLE "service_session_user" DROP COLUMN "userUsername"`);
    await queryRunner.query(`ALTER TABLE "service_session_user" ADD "userUsername" integer`);
    await queryRunner.query(`ALTER TABLE "user_permission" DROP COLUMN "userUsername"`);
    await queryRunner.query(`ALTER TABLE "user_permission" ADD "userUsername" integer`);
    await queryRunner.query(
      `ALTER TABLE "announcement_completion" RENAME COLUMN "userUsername" TO "userUserId"`,
    );
    await queryRunner.query(
      `ALTER TABLE "announcement" RENAME COLUMN "userUsername" TO "userUserId"`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_service" RENAME COLUMN "userUsername" TO "userUserId"`,
    );
    await queryRunner.query(
      `ALTER TABLE "service_session_user" RENAME COLUMN "userUsername" TO "userUserId"`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_permission" RENAME COLUMN "userUsername" TO "userUserId"`,
    );
    await queryRunner.query(
      `ALTER TABLE "announcement_completion" ADD CONSTRAINT "FK_2f049542ec7013cdcf61683debb" FOREIGN KEY ("userUserId") REFERENCES "user"("user_id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "announcement" ADD CONSTRAINT "FK_b5289f6eb4f4ef3b388f9f33956" FOREIGN KEY ("userUserId") REFERENCES "user"("user_id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_service" ADD CONSTRAINT "FK_7629ede0daaadca41f6ffe152b2" FOREIGN KEY ("userUserId") REFERENCES "user"("user_id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "service_session_user" ADD CONSTRAINT "FK_c7bf6667d0869d0f9ad3bc1d023" FOREIGN KEY ("userUserId") REFERENCES "user"("user_id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_permission" ADD CONSTRAINT "FK_37884f6cf1228bd818db712e443" FOREIGN KEY ("userUserId") REFERENCES "user"("user_id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }
}
