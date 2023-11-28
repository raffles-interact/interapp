import { MigrationInterface, QueryRunner } from 'typeorm';

export class AllowAnnouncementCascade1701164484665 implements MigrationInterface {
  name = 'AllowAnnouncementCascade1701164484665';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "announcement_completion" DROP CONSTRAINT "FK_7c54b4b763b8c6149dee230ee14"`,
    );
    await queryRunner.query(
      `ALTER TABLE "announcement_completion" ADD CONSTRAINT "FK_7c54b4b763b8c6149dee230ee14" FOREIGN KEY ("announcementAnnouncementId") REFERENCES "announcement"("announcement_id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "announcement_completion" DROP CONSTRAINT "FK_7c54b4b763b8c6149dee230ee14"`,
    );
    await queryRunner.query(
      `ALTER TABLE "announcement_completion" ADD CONSTRAINT "FK_7c54b4b763b8c6149dee230ee14" FOREIGN KEY ("announcementAnnouncementId") REFERENCES "announcement"("announcement_id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }
}
