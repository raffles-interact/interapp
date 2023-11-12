import { MigrationInterface, QueryRunner } from 'typeorm';

export class Initialise1699783357999 implements MigrationInterface {
  name = 'Initialise1699783357999';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "hello_world" ("id" SERIAL NOT NULL, "name" character varying NOT NULL, CONSTRAINT "PK_853ed50332c17f7199418bb18d3" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "user_permissions" ("user_id" integer NOT NULL, "permission_id" integer NOT NULL, "usersUserId" integer, CONSTRAINT "PK_a537c48b1f80e8626a71cb56589" PRIMARY KEY ("user_id", "permission_id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "service_session_users" ("service_session_id" integer NOT NULL, "user_id" integer NOT NULL, "ad_hoc" boolean NOT NULL, "serviceSessionsServiceSessionId" integer, "usersUserId" integer, CONSTRAINT "PK_c5c58a92fcee1fececb1c6e689a" PRIMARY KEY ("service_session_id", "user_id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "service_sessions" ("service_session_id" SERIAL NOT NULL, "service_id" integer NOT NULL, "start_time" TIMESTAMP NOT NULL, "end_time" TIMESTAMP NOT NULL, "ad_hoc_enabled" boolean NOT NULL, "servicesServiceId" integer, CONSTRAINT "PK_f729d7f0dd2baab35200b52fad6" PRIMARY KEY ("service_session_id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "services" ("service_id" SERIAL NOT NULL, "name" character varying NOT NULL, "description" character varying, "contact_email" character varying NOT NULL, "contact_number" integer, "website" character varying, "promotional_image" bytea, CONSTRAINT "PK_ef0531b9789b488593690ab8d5d" PRIMARY KEY ("service_id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "user_services" ("user_id" integer NOT NULL, "service_id" integer NOT NULL, "usersUserId" integer, "servicesServiceId" integer, CONSTRAINT "PK_68ed409cb707ddff39f47691f68" PRIMARY KEY ("user_id", "service_id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "users" ("user_id" SERIAL NOT NULL, "name" character varying NOT NULL, "email" character varying NOT NULL, "service_hours" integer NOT NULL, CONSTRAINT "PK_96aac72f1574b88752e9fb00089" PRIMARY KEY ("user_id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "announcement" ("announcement_id" SERIAL NOT NULL, "creation_date" TIMESTAMP NOT NULL, "description" character varying NOT NULL, "attachment" bytea, "userIdUserId" integer, CONSTRAINT "PK_017bde9e7611c5a6151ac081f6c" PRIMARY KEY ("announcement_id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "announcement_completion" ("announcement_id" integer NOT NULL, "user_id" integer NOT NULL, "completed" boolean NOT NULL, "announcementAnnouncementId" integer, "userUserId" integer, CONSTRAINT "PK_b6dd4eff75205f510f17a9b3a6d" PRIMARY KEY ("announcement_id", "user_id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_permissions" ADD CONSTRAINT "FK_bd3280684382aaa7de0bfba7db9" FOREIGN KEY ("usersUserId") REFERENCES "users"("user_id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "service_session_users" ADD CONSTRAINT "FK_77e950fe3c5d865315847fb4a04" FOREIGN KEY ("serviceSessionsServiceSessionId") REFERENCES "service_sessions"("service_session_id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "service_session_users" ADD CONSTRAINT "FK_f2851137d364c3d03bc5cf9d5d0" FOREIGN KEY ("usersUserId") REFERENCES "users"("user_id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "service_sessions" ADD CONSTRAINT "FK_e875a175cab516dc96c9df9a02e" FOREIGN KEY ("servicesServiceId") REFERENCES "services"("service_id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_services" ADD CONSTRAINT "FK_f384cb802ab279e5204f5370c2e" FOREIGN KEY ("usersUserId") REFERENCES "users"("user_id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_services" ADD CONSTRAINT "FK_3d887addc74746c4baaea2bc6d6" FOREIGN KEY ("servicesServiceId") REFERENCES "services"("service_id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "announcement" ADD CONSTRAINT "FK_7f0ff060458708e595c5762ef5c" FOREIGN KEY ("userIdUserId") REFERENCES "users"("user_id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "announcement_completion" ADD CONSTRAINT "FK_7c54b4b763b8c6149dee230ee14" FOREIGN KEY ("announcementAnnouncementId") REFERENCES "announcement"("announcement_id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "announcement_completion" ADD CONSTRAINT "FK_2f049542ec7013cdcf61683debb" FOREIGN KEY ("userUserId") REFERENCES "users"("user_id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "announcement_completion" DROP CONSTRAINT "FK_2f049542ec7013cdcf61683debb"`,
    );
    await queryRunner.query(
      `ALTER TABLE "announcement_completion" DROP CONSTRAINT "FK_7c54b4b763b8c6149dee230ee14"`,
    );
    await queryRunner.query(
      `ALTER TABLE "announcement" DROP CONSTRAINT "FK_7f0ff060458708e595c5762ef5c"`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_services" DROP CONSTRAINT "FK_3d887addc74746c4baaea2bc6d6"`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_services" DROP CONSTRAINT "FK_f384cb802ab279e5204f5370c2e"`,
    );
    await queryRunner.query(
      `ALTER TABLE "service_sessions" DROP CONSTRAINT "FK_e875a175cab516dc96c9df9a02e"`,
    );
    await queryRunner.query(
      `ALTER TABLE "service_session_users" DROP CONSTRAINT "FK_f2851137d364c3d03bc5cf9d5d0"`,
    );
    await queryRunner.query(
      `ALTER TABLE "service_session_users" DROP CONSTRAINT "FK_77e950fe3c5d865315847fb4a04"`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_permissions" DROP CONSTRAINT "FK_bd3280684382aaa7de0bfba7db9"`,
    );
    await queryRunner.query(`DROP TABLE "announcement_completion"`);
    await queryRunner.query(`DROP TABLE "announcement"`);
    await queryRunner.query(`DROP TABLE "users"`);
    await queryRunner.query(`DROP TABLE "user_services"`);
    await queryRunner.query(`DROP TABLE "services"`);
    await queryRunner.query(`DROP TABLE "service_sessions"`);
    await queryRunner.query(`DROP TABLE "service_session_users"`);
    await queryRunner.query(`DROP TABLE "user_permissions"`);
    await queryRunner.query(`DROP TABLE "hello_world"`);
  }
}
