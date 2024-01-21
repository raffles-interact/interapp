import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddAttachmentMime1705067423579 implements MigrationInterface {
  name = 'AddAttachmentMime1705067423579';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "announcement_attachment" RENAME COLUMN "attachment_id" TO "attachment_loc"`,
    );
    await queryRunner.query(
      `ALTER TABLE "announcement_attachment" ADD "attachment_mime" character varying NOT NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "announcement_attachment" DROP COLUMN "attachment_mime"`);
    await queryRunner.query(
      `ALTER TABLE "announcement_attachment" RENAME COLUMN "attachment_loc" TO "attachment_id"`,
    );
  }
}
