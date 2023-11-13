import { MigrationInterface, QueryRunner } from 'typeorm';

export class RenameToSingular1699847729168 implements MigrationInterface {
  name = 'RenameToSingular1699847729168';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "announcement" DROP CONSTRAINT "FK_7f0ff060458708e595c5762ef5c"`,
    );
    await queryRunner.query(
      `ALTER TABLE "announcement_completion" DROP CONSTRAINT "FK_2f049542ec7013cdcf61683debb"`,
    );
    await queryRunner.query(
      `CREATE TABLE "user_permission" ("user_id" integer NOT NULL, "permission_id" integer NOT NULL, "userUserId" integer, CONSTRAINT "PK_e55fe6295b438912cb42bce1baa" PRIMARY KEY ("user_id", "permission_id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "service_session_user" ("service_session_id" integer NOT NULL, "user_id" integer NOT NULL, "ad_hoc" boolean NOT NULL, "serviceSessionsServiceSessionId" integer, "userUserId" integer, CONSTRAINT "PK_cec02fed574edba231ff2191a46" PRIMARY KEY ("service_session_id", "user_id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "service_session" ("service_session_id" SERIAL NOT NULL, "service_id" integer NOT NULL, "start_time" TIMESTAMP NOT NULL, "end_time" TIMESTAMP NOT NULL, "ad_hoc_enabled" boolean NOT NULL, "servicesServiceId" integer, CONSTRAINT "PK_ed26e437f101abddada6df7627b" PRIMARY KEY ("service_session_id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "service" ("service_id" SERIAL NOT NULL, "name" character varying NOT NULL, "description" character varying, "contact_email" character varying NOT NULL, "contact_number" integer, "website" character varying, "promotional_image" bytea, CONSTRAINT "PK_48c5a0e13da2b2948fb7f3a0c4a" PRIMARY KEY ("service_id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "user_service" ("user_id" integer NOT NULL, "service_id" integer NOT NULL, "userUserId" integer, "servicesServiceId" integer, CONSTRAINT "PK_4159abfc0b72a5cd6e8081aa211" PRIMARY KEY ("user_id", "service_id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "user" ("user_id" SERIAL NOT NULL, "name" character varying NOT NULL, "email" character varying NOT NULL, "service_hours" integer NOT NULL, CONSTRAINT "PK_758b8ce7c18b9d347461b30228d" PRIMARY KEY ("user_id"))`,
    );
    await queryRunner.query(`ALTER TABLE "announcement" DROP COLUMN "userIdUserId"`);
    await queryRunner.query(`ALTER TABLE "announcement" ADD "user_id" integer NOT NULL`);
    await queryRunner.query(`ALTER TABLE "announcement" ADD "userUserId" integer`);
    await queryRunner.query(
      `ALTER TABLE "user_permission" ADD CONSTRAINT "FK_37884f6cf1228bd818db712e443" FOREIGN KEY ("userUserId") REFERENCES "user"("user_id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "service_session_user" ADD CONSTRAINT "FK_58f413a03070489351d18bc377c" FOREIGN KEY ("serviceSessionsServiceSessionId") REFERENCES "service_session"("service_session_id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "service_session_user" ADD CONSTRAINT "FK_c7bf6667d0869d0f9ad3bc1d023" FOREIGN KEY ("userUserId") REFERENCES "user"("user_id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "service_session" ADD CONSTRAINT "FK_6a2b8cb0d5bf492a9119b5ba5dd" FOREIGN KEY ("servicesServiceId") REFERENCES "service"("service_id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_service" ADD CONSTRAINT "FK_7629ede0daaadca41f6ffe152b2" FOREIGN KEY ("userUserId") REFERENCES "user"("user_id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_service" ADD CONSTRAINT "FK_80e6159e1c00c03ff5feb02d6c4" FOREIGN KEY ("servicesServiceId") REFERENCES "service"("service_id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "announcement" ADD CONSTRAINT "FK_b5289f6eb4f4ef3b388f9f33956" FOREIGN KEY ("userUserId") REFERENCES "user"("user_id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "announcement_completion" ADD CONSTRAINT "FK_2f049542ec7013cdcf61683debb" FOREIGN KEY ("userUserId") REFERENCES "user"("user_id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(`DROP TABLE "user_services"`);
    await queryRunner.query(`DROP TABLE "service_session_users"`);
    await queryRunner.query(`DROP TABLE "user_permissions"`);
    await queryRunner.query(`DROP TABLE "service_sessions"`);
    await queryRunner.query(`DROP TABLE "services"`);
    await queryRunner.query(`DROP TABLE "users"`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
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
      `ALTER TABLE "announcement_completion" DROP CONSTRAINT "FK_2f049542ec7013cdcf61683debb"`,
    );
    await queryRunner.query(
      `ALTER TABLE "announcement" DROP CONSTRAINT "FK_b5289f6eb4f4ef3b388f9f33956"`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_service" DROP CONSTRAINT "FK_80e6159e1c00c03ff5feb02d6c4"`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_service" DROP CONSTRAINT "FK_7629ede0daaadca41f6ffe152b2"`,
    );
    await queryRunner.query(
      `ALTER TABLE "service_session" DROP CONSTRAINT "FK_6a2b8cb0d5bf492a9119b5ba5dd"`,
    );
    await queryRunner.query(
      `ALTER TABLE "service_session_user" DROP CONSTRAINT "FK_c7bf6667d0869d0f9ad3bc1d023"`,
    );
    await queryRunner.query(
      `ALTER TABLE "service_session_user" DROP CONSTRAINT "FK_58f413a03070489351d18bc377c"`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_permission" DROP CONSTRAINT "FK_37884f6cf1228bd818db712e443"`,
    );
    await queryRunner.query(`ALTER TABLE "announcement" DROP COLUMN "userUserId"`);
    await queryRunner.query(`ALTER TABLE "announcement" DROP COLUMN "user_id"`);
    await queryRunner.query(`ALTER TABLE "announcement" ADD "userIdUserId" integer`);
    await queryRunner.query(`DROP TABLE "user"`);
    await queryRunner.query(`DROP TABLE "user_service"`);
    await queryRunner.query(`DROP TABLE "service"`);
    await queryRunner.query(`DROP TABLE "service_session"`);
    await queryRunner.query(`DROP TABLE "service_session_user"`);
    await queryRunner.query(`DROP TABLE "user_permission"`);
    await queryRunner.query(
      `ALTER TABLE "announcement_completion" ADD CONSTRAINT "FK_2f049542ec7013cdcf61683debb" FOREIGN KEY ("userUserId") REFERENCES "users"("user_id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "announcement" ADD CONSTRAINT "FK_7f0ff060458708e595c5762ef5c" FOREIGN KEY ("userIdUserId") REFERENCES "users"("user_id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }
}
