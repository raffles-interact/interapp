import { MigrationInterface, QueryRunner } from 'typeorm';

export class SquashAndInitialise1701332375896 implements MigrationInterface {
  name = 'SquashAndInitialise1701332375896';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "hello_world" ("id" SERIAL NOT NULL, "name" character varying NOT NULL, CONSTRAINT "PK_853ed50332c17f7199418bb18d3" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "user_permission" ("username" character varying NOT NULL, "permission_id" integer NOT NULL, "userUsername" character varying, CONSTRAINT "PK_8e08d51f763ac375937a5b5faea" PRIMARY KEY ("username", "permission_id"))`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."service_session_user_attended_enum" AS ENUM('Attended', 'Absent', 'Valid Reason')`,
    );
    await queryRunner.query(
      `CREATE TABLE "service_session_user" ("service_session_id" integer NOT NULL, "username" character varying NOT NULL, "ad_hoc" boolean NOT NULL, "attended" "public"."service_session_user_attended_enum" NOT NULL, "is_ic" boolean NOT NULL, "serviceSessionServiceSessionId" integer, "userUsername" character varying, CONSTRAINT "PK_0a02c2eeffde68aace483ed73f4" PRIMARY KEY ("service_session_id", "username"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "service_session" ("service_session_id" SERIAL NOT NULL, "service_id" integer NOT NULL, "start_time" TIMESTAMP NOT NULL, "end_time" TIMESTAMP NOT NULL, "ad_hoc_enabled" boolean NOT NULL, "serviceServiceId" integer, CONSTRAINT "PK_ed26e437f101abddada6df7627b" PRIMARY KEY ("service_session_id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "service" ("service_id" SERIAL NOT NULL, "name" character varying NOT NULL, "description" character varying, "contact_email" character varying NOT NULL, "contact_number" integer, "website" character varying, "promotional_image" bytea, "day_of_week" smallint NOT NULL, "start_time" TIME NOT NULL, "end_time" TIME NOT NULL, "service_ic_username" character varying NOT NULL, "serviceIcUsername" character varying, CONSTRAINT "UQ_7806a14d42c3244064b4a1706ca" UNIQUE ("name"), CONSTRAINT "REL_c8c0d566268ec73503932c133b" UNIQUE ("serviceIcUsername"), CONSTRAINT "PK_48c5a0e13da2b2948fb7f3a0c4a" PRIMARY KEY ("service_id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "user_service" ("username" character varying NOT NULL, "service_id" integer NOT NULL, "userUsername" character varying, "serviceServiceId" integer, CONSTRAINT "PK_898710654fe03a9105f2702c35b" PRIMARY KEY ("username", "service_id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "user" ("username" character varying NOT NULL, "user_id" integer NOT NULL, "email" character varying NOT NULL, "password_hash" character varying NOT NULL, "verified" boolean NOT NULL, "refresh_token" character varying, "service_hours" integer NOT NULL, CONSTRAINT "UQ_758b8ce7c18b9d347461b30228d" UNIQUE ("user_id"), CONSTRAINT "UQ_a2deb244eda661a007db72f0dbf" UNIQUE ("refresh_token"), CONSTRAINT "PK_78a916df40e02a9deb1c4b75edb" PRIMARY KEY ("username"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "announcement_completion" ("announcement_id" integer NOT NULL, "username" character varying NOT NULL, "completed" boolean NOT NULL, "announcementAnnouncementId" integer, "userUsername" character varying, CONSTRAINT "PK_041502532446daaed1befacc4cb" PRIMARY KEY ("announcement_id", "username"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "announcement" ("announcement_id" SERIAL NOT NULL, "creation_date" TIMESTAMP NOT NULL, "title" character varying NOT NULL, "description" character varying NOT NULL, "attachment" bytea, "username" character varying NOT NULL, "userUsername" character varying, CONSTRAINT "PK_017bde9e7611c5a6151ac081f6c" PRIMARY KEY ("announcement_id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_permission" ADD CONSTRAINT "FK_de6aaa3986b9ebee69cdaef2467" FOREIGN KEY ("userUsername") REFERENCES "user"("username") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "service_session_user" ADD CONSTRAINT "FK_9731d8f5e9512262ff4f4ad34aa" FOREIGN KEY ("serviceSessionServiceSessionId") REFERENCES "service_session"("service_session_id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "service_session_user" ADD CONSTRAINT "FK_93c5a4bd8f54d4f25734d405445" FOREIGN KEY ("userUsername") REFERENCES "user"("username") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "service_session" ADD CONSTRAINT "FK_10d1cb8d1fca84c0587a748b2d5" FOREIGN KEY ("serviceServiceId") REFERENCES "service"("service_id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "service" ADD CONSTRAINT "FK_c8c0d566268ec73503932c133bd" FOREIGN KEY ("serviceIcUsername") REFERENCES "user"("username") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_service" ADD CONSTRAINT "FK_118cbde2116c9becff2b3216947" FOREIGN KEY ("userUsername") REFERENCES "user"("username") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_service" ADD CONSTRAINT "FK_c7fb0fc77efa4dfcd8e999e0ae1" FOREIGN KEY ("serviceServiceId") REFERENCES "service"("service_id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "announcement_completion" ADD CONSTRAINT "FK_7c54b4b763b8c6149dee230ee14" FOREIGN KEY ("announcementAnnouncementId") REFERENCES "announcement"("announcement_id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "announcement_completion" ADD CONSTRAINT "FK_eb873ba543dd0c052efb8d9df72" FOREIGN KEY ("userUsername") REFERENCES "user"("username") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "announcement" ADD CONSTRAINT "FK_661b425a5356c3d120353fc97fc" FOREIGN KEY ("userUsername") REFERENCES "user"("username") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "announcement" DROP CONSTRAINT "FK_661b425a5356c3d120353fc97fc"`,
    );
    await queryRunner.query(
      `ALTER TABLE "announcement_completion" DROP CONSTRAINT "FK_eb873ba543dd0c052efb8d9df72"`,
    );
    await queryRunner.query(
      `ALTER TABLE "announcement_completion" DROP CONSTRAINT "FK_7c54b4b763b8c6149dee230ee14"`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_service" DROP CONSTRAINT "FK_c7fb0fc77efa4dfcd8e999e0ae1"`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_service" DROP CONSTRAINT "FK_118cbde2116c9becff2b3216947"`,
    );
    await queryRunner.query(
      `ALTER TABLE "service" DROP CONSTRAINT "FK_c8c0d566268ec73503932c133bd"`,
    );
    await queryRunner.query(
      `ALTER TABLE "service_session" DROP CONSTRAINT "FK_10d1cb8d1fca84c0587a748b2d5"`,
    );
    await queryRunner.query(
      `ALTER TABLE "service_session_user" DROP CONSTRAINT "FK_93c5a4bd8f54d4f25734d405445"`,
    );
    await queryRunner.query(
      `ALTER TABLE "service_session_user" DROP CONSTRAINT "FK_9731d8f5e9512262ff4f4ad34aa"`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_permission" DROP CONSTRAINT "FK_de6aaa3986b9ebee69cdaef2467"`,
    );
    await queryRunner.query(`DROP TABLE "announcement"`);
    await queryRunner.query(`DROP TABLE "announcement_completion"`);
    await queryRunner.query(`DROP TABLE "user"`);
    await queryRunner.query(`DROP TABLE "user_service"`);
    await queryRunner.query(`DROP TABLE "service"`);
    await queryRunner.query(`DROP TABLE "service_session"`);
    await queryRunner.query(`DROP TABLE "service_session_user"`);
    await queryRunner.query(`DROP TYPE "public"."service_session_user_attended_enum"`);
    await queryRunner.query(`DROP TABLE "user_permission"`);
    await queryRunner.query(`DROP TABLE "hello_world"`);
  }
}
