import { MigrationInterface, QueryRunner } from 'typeorm';

export class FixUsernamePK1700727237872 implements MigrationInterface {
  name = 'FixUsernamePK1700727237872';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "user_permission" RENAME COLUMN "user_id" TO "username"`);
    await queryRunner.query(
      `ALTER TABLE "user_permission" RENAME CONSTRAINT "PK_e55fe6295b438912cb42bce1baa" TO "PK_8e08d51f763ac375937a5b5faea"`,
    );
    await queryRunner.query(
      `ALTER TABLE "service_session_user" RENAME COLUMN "user_id" TO "username"`,
    );
    await queryRunner.query(
      `ALTER TABLE "service_session_user" RENAME CONSTRAINT "PK_cec02fed574edba231ff2191a46" TO "PK_0a02c2eeffde68aace483ed73f4"`,
    );
    await queryRunner.query(`ALTER TABLE "user_service" RENAME COLUMN "user_id" TO "username"`);
    await queryRunner.query(
      `ALTER TABLE "user_service" RENAME CONSTRAINT "PK_4159abfc0b72a5cd6e8081aa211" TO "PK_898710654fe03a9105f2702c35b"`,
    );
    await queryRunner.query(`ALTER TABLE "announcement" RENAME COLUMN "user_id" TO "username"`);
    await queryRunner.query(
      `ALTER TABLE "announcement_completion" RENAME COLUMN "user_id" TO "username"`,
    );
    await queryRunner.query(
      `ALTER TABLE "announcement_completion" RENAME CONSTRAINT "PK_b6dd4eff75205f510f17a9b3a6d" TO "PK_041502532446daaed1befacc4cb"`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_permission" DROP CONSTRAINT "PK_8e08d51f763ac375937a5b5faea"`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_permission" ADD CONSTRAINT "PK_8a4d5521c1ced158c13438df3df" PRIMARY KEY ("permission_id")`,
    );
    await queryRunner.query(`ALTER TABLE "user_permission" DROP COLUMN "username"`);
    await queryRunner.query(
      `ALTER TABLE "user_permission" ADD "username" character varying NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_permission" DROP CONSTRAINT "PK_8a4d5521c1ced158c13438df3df"`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_permission" ADD CONSTRAINT "PK_8e08d51f763ac375937a5b5faea" PRIMARY KEY ("permission_id", "username")`,
    );
    await queryRunner.query(
      `ALTER TABLE "service_session_user" DROP CONSTRAINT "PK_0a02c2eeffde68aace483ed73f4"`,
    );
    await queryRunner.query(
      `ALTER TABLE "service_session_user" ADD CONSTRAINT "PK_10524b694ff35e685871fa51dc8" PRIMARY KEY ("service_session_id")`,
    );
    await queryRunner.query(`ALTER TABLE "service_session_user" DROP COLUMN "username"`);
    await queryRunner.query(
      `ALTER TABLE "service_session_user" ADD "username" character varying NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "service_session_user" DROP CONSTRAINT "PK_10524b694ff35e685871fa51dc8"`,
    );
    await queryRunner.query(
      `ALTER TABLE "service_session_user" ADD CONSTRAINT "PK_0a02c2eeffde68aace483ed73f4" PRIMARY KEY ("service_session_id", "username")`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_service" DROP CONSTRAINT "PK_898710654fe03a9105f2702c35b"`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_service" ADD CONSTRAINT "PK_20861d1559a79e691cf889264b8" PRIMARY KEY ("service_id")`,
    );
    await queryRunner.query(`ALTER TABLE "user_service" DROP COLUMN "username"`);
    await queryRunner.query(`ALTER TABLE "user_service" ADD "username" character varying NOT NULL`);
    await queryRunner.query(
      `ALTER TABLE "user_service" DROP CONSTRAINT "PK_20861d1559a79e691cf889264b8"`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_service" ADD CONSTRAINT "PK_898710654fe03a9105f2702c35b" PRIMARY KEY ("service_id", "username")`,
    );
    await queryRunner.query(`ALTER TABLE "announcement" DROP COLUMN "username"`);
    await queryRunner.query(`ALTER TABLE "announcement" ADD "username" character varying NOT NULL`);
    await queryRunner.query(
      `ALTER TABLE "announcement_completion" DROP CONSTRAINT "PK_041502532446daaed1befacc4cb"`,
    );
    await queryRunner.query(
      `ALTER TABLE "announcement_completion" ADD CONSTRAINT "PK_ed60479973c85efbfe8a13ea01b" PRIMARY KEY ("announcement_id")`,
    );
    await queryRunner.query(`ALTER TABLE "announcement_completion" DROP COLUMN "username"`);
    await queryRunner.query(
      `ALTER TABLE "announcement_completion" ADD "username" character varying NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "announcement_completion" DROP CONSTRAINT "PK_ed60479973c85efbfe8a13ea01b"`,
    );
    await queryRunner.query(
      `ALTER TABLE "announcement_completion" ADD CONSTRAINT "PK_041502532446daaed1befacc4cb" PRIMARY KEY ("announcement_id", "username")`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "announcement_completion" DROP CONSTRAINT "PK_041502532446daaed1befacc4cb"`,
    );
    await queryRunner.query(
      `ALTER TABLE "announcement_completion" ADD CONSTRAINT "PK_ed60479973c85efbfe8a13ea01b" PRIMARY KEY ("announcement_id")`,
    );
    await queryRunner.query(`ALTER TABLE "announcement_completion" DROP COLUMN "username"`);
    await queryRunner.query(
      `ALTER TABLE "announcement_completion" ADD "username" integer NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "announcement_completion" DROP CONSTRAINT "PK_ed60479973c85efbfe8a13ea01b"`,
    );
    await queryRunner.query(
      `ALTER TABLE "announcement_completion" ADD CONSTRAINT "PK_041502532446daaed1befacc4cb" PRIMARY KEY ("announcement_id", "username")`,
    );
    await queryRunner.query(`ALTER TABLE "announcement" DROP COLUMN "username"`);
    await queryRunner.query(`ALTER TABLE "announcement" ADD "username" integer NOT NULL`);
    await queryRunner.query(
      `ALTER TABLE "user_service" DROP CONSTRAINT "PK_898710654fe03a9105f2702c35b"`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_service" ADD CONSTRAINT "PK_20861d1559a79e691cf889264b8" PRIMARY KEY ("service_id")`,
    );
    await queryRunner.query(`ALTER TABLE "user_service" DROP COLUMN "username"`);
    await queryRunner.query(`ALTER TABLE "user_service" ADD "username" integer NOT NULL`);
    await queryRunner.query(
      `ALTER TABLE "user_service" DROP CONSTRAINT "PK_20861d1559a79e691cf889264b8"`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_service" ADD CONSTRAINT "PK_898710654fe03a9105f2702c35b" PRIMARY KEY ("username", "service_id")`,
    );
    await queryRunner.query(
      `ALTER TABLE "service_session_user" DROP CONSTRAINT "PK_0a02c2eeffde68aace483ed73f4"`,
    );
    await queryRunner.query(
      `ALTER TABLE "service_session_user" ADD CONSTRAINT "PK_10524b694ff35e685871fa51dc8" PRIMARY KEY ("service_session_id")`,
    );
    await queryRunner.query(`ALTER TABLE "service_session_user" DROP COLUMN "username"`);
    await queryRunner.query(`ALTER TABLE "service_session_user" ADD "username" integer NOT NULL`);
    await queryRunner.query(
      `ALTER TABLE "service_session_user" DROP CONSTRAINT "PK_10524b694ff35e685871fa51dc8"`,
    );
    await queryRunner.query(
      `ALTER TABLE "service_session_user" ADD CONSTRAINT "PK_0a02c2eeffde68aace483ed73f4" PRIMARY KEY ("service_session_id", "username")`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_permission" DROP CONSTRAINT "PK_8e08d51f763ac375937a5b5faea"`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_permission" ADD CONSTRAINT "PK_8a4d5521c1ced158c13438df3df" PRIMARY KEY ("permission_id")`,
    );
    await queryRunner.query(`ALTER TABLE "user_permission" DROP COLUMN "username"`);
    await queryRunner.query(`ALTER TABLE "user_permission" ADD "username" integer NOT NULL`);
    await queryRunner.query(
      `ALTER TABLE "user_permission" DROP CONSTRAINT "PK_8a4d5521c1ced158c13438df3df"`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_permission" ADD CONSTRAINT "PK_8e08d51f763ac375937a5b5faea" PRIMARY KEY ("username", "permission_id")`,
    );
    await queryRunner.query(
      `ALTER TABLE "announcement_completion" RENAME CONSTRAINT "PK_041502532446daaed1befacc4cb" TO "PK_b6dd4eff75205f510f17a9b3a6d"`,
    );
    await queryRunner.query(
      `ALTER TABLE "announcement_completion" RENAME COLUMN "username" TO "user_id"`,
    );
    await queryRunner.query(`ALTER TABLE "announcement" RENAME COLUMN "username" TO "user_id"`);
    await queryRunner.query(
      `ALTER TABLE "user_service" RENAME CONSTRAINT "PK_898710654fe03a9105f2702c35b" TO "PK_4159abfc0b72a5cd6e8081aa211"`,
    );
    await queryRunner.query(`ALTER TABLE "user_service" RENAME COLUMN "username" TO "user_id"`);
    await queryRunner.query(
      `ALTER TABLE "service_session_user" RENAME CONSTRAINT "PK_0a02c2eeffde68aace483ed73f4" TO "PK_cec02fed574edba231ff2191a46"`,
    );
    await queryRunner.query(
      `ALTER TABLE "service_session_user" RENAME COLUMN "username" TO "user_id"`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_permission" RENAME CONSTRAINT "PK_8e08d51f763ac375937a5b5faea" TO "PK_e55fe6295b438912cb42bce1baa"`,
    );
    await queryRunner.query(`ALTER TABLE "user_permission" RENAME COLUMN "username" TO "user_id"`);
  }
}
