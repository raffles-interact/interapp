import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddAnnouncementAttachments1704561016649 implements MigrationInterface {
  name = 'AddAnnouncementAttachments1704561016649';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "announcement_attachment" ("attachment_id" character varying NOT NULL, "attachment_name" character varying NOT NULL, "announcement_id" integer NOT NULL, "announcementAnnouncementId" integer, CONSTRAINT "PK_6f10db88dbebdbfc54c10bc6bae" PRIMARY KEY ("attachment_id"))`,
    );
    await queryRunner.query(`ALTER TABLE "announcement" DROP COLUMN "attachment"`);
    await queryRunner.query(`ALTER TABLE "announcement" ADD "image" character varying`);
    await queryRunner.query(
      `ALTER TABLE "announcement" ADD CONSTRAINT "UQ_e02da6a28440ff009cd1f625116" UNIQUE ("title")`,
    );
    await queryRunner.query(
      `ALTER TABLE "announcement_attachment" ADD CONSTRAINT "FK_ac101325d5c90df1325193d43bb" FOREIGN KEY ("announcementAnnouncementId") REFERENCES "announcement"("announcement_id") ON DELETE CASCADE ON UPDATE CASCADE`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "announcement_attachment" DROP CONSTRAINT "FK_ac101325d5c90df1325193d43bb"`,
    );
    await queryRunner.query(
      `ALTER TABLE "announcement" DROP CONSTRAINT "UQ_e02da6a28440ff009cd1f625116"`,
    );
    await queryRunner.query(`ALTER TABLE "announcement" DROP COLUMN "image"`);
    await queryRunner.query(`ALTER TABLE "announcement" ADD "attachment" character varying`);
    await queryRunner.query(`DROP TABLE "announcement_attachment"`);
  }
}
