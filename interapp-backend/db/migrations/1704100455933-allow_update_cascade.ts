import { MigrationInterface, QueryRunner } from 'typeorm';

export class AllowUpdateCascade1704100455933 implements MigrationInterface {
  name = 'AllowUpdateCascade1704100455933';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "user_permission" DROP CONSTRAINT "FK_de6aaa3986b9ebee69cdaef2467"`,
    );
    await queryRunner.query(
      `ALTER TABLE "service_session_user" DROP CONSTRAINT "FK_9731d8f5e9512262ff4f4ad34aa"`,
    );
    await queryRunner.query(
      `ALTER TABLE "service_session_user" DROP CONSTRAINT "FK_93c5a4bd8f54d4f25734d405445"`,
    );
    await queryRunner.query(
      `ALTER TABLE "service_session" DROP CONSTRAINT "FK_10d1cb8d1fca84c0587a748b2d5"`,
    );
    await queryRunner.query(
      `ALTER TABLE "service" DROP CONSTRAINT "FK_c8c0d566268ec73503932c133bd"`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_service" DROP CONSTRAINT "FK_c7fb0fc77efa4dfcd8e999e0ae1"`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_service" DROP CONSTRAINT "FK_118cbde2116c9becff2b3216947"`,
    );
    await queryRunner.query(
      `ALTER TABLE "announcement_completion" DROP CONSTRAINT "FK_7c54b4b763b8c6149dee230ee14"`,
    );
    await queryRunner.query(
      `ALTER TABLE "announcement_completion" DROP CONSTRAINT "FK_eb873ba543dd0c052efb8d9df72"`,
    );
    await queryRunner.query(
      `ALTER TABLE "announcement" DROP CONSTRAINT "FK_661b425a5356c3d120353fc97fc"`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_permission" ADD CONSTRAINT "FK_de6aaa3986b9ebee69cdaef2467" FOREIGN KEY ("userUsername") REFERENCES "user"("username") ON DELETE CASCADE ON UPDATE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE "service_session_user" ADD CONSTRAINT "FK_9731d8f5e9512262ff4f4ad34aa" FOREIGN KEY ("serviceSessionServiceSessionId") REFERENCES "service_session"("service_session_id") ON DELETE CASCADE ON UPDATE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE "service_session_user" ADD CONSTRAINT "FK_93c5a4bd8f54d4f25734d405445" FOREIGN KEY ("userUsername") REFERENCES "user"("username") ON DELETE CASCADE ON UPDATE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE "service_session" ADD CONSTRAINT "FK_10d1cb8d1fca84c0587a748b2d5" FOREIGN KEY ("serviceServiceId") REFERENCES "service"("service_id") ON DELETE CASCADE ON UPDATE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE "service" ADD CONSTRAINT "FK_c8c0d566268ec73503932c133bd" FOREIGN KEY ("serviceIcUsername") REFERENCES "user"("username") ON DELETE CASCADE ON UPDATE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_service" ADD CONSTRAINT "FK_118cbde2116c9becff2b3216947" FOREIGN KEY ("userUsername") REFERENCES "user"("username") ON DELETE CASCADE ON UPDATE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_service" ADD CONSTRAINT "FK_c7fb0fc77efa4dfcd8e999e0ae1" FOREIGN KEY ("serviceServiceId") REFERENCES "service"("service_id") ON DELETE CASCADE ON UPDATE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE "announcement_completion" ADD CONSTRAINT "FK_7c54b4b763b8c6149dee230ee14" FOREIGN KEY ("announcementAnnouncementId") REFERENCES "announcement"("announcement_id") ON DELETE CASCADE ON UPDATE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE "announcement_completion" ADD CONSTRAINT "FK_eb873ba543dd0c052efb8d9df72" FOREIGN KEY ("userUsername") REFERENCES "user"("username") ON DELETE CASCADE ON UPDATE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE "announcement" ADD CONSTRAINT "FK_661b425a5356c3d120353fc97fc" FOREIGN KEY ("userUsername") REFERENCES "user"("username") ON DELETE CASCADE ON UPDATE CASCADE`,
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
    await queryRunner.query(
      `ALTER TABLE "announcement" ADD CONSTRAINT "FK_661b425a5356c3d120353fc97fc" FOREIGN KEY ("userUsername") REFERENCES "user"("username") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "announcement_completion" ADD CONSTRAINT "FK_eb873ba543dd0c052efb8d9df72" FOREIGN KEY ("userUsername") REFERENCES "user"("username") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "announcement_completion" ADD CONSTRAINT "FK_7c54b4b763b8c6149dee230ee14" FOREIGN KEY ("announcementAnnouncementId") REFERENCES "announcement"("announcement_id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_service" ADD CONSTRAINT "FK_118cbde2116c9becff2b3216947" FOREIGN KEY ("userUsername") REFERENCES "user"("username") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_service" ADD CONSTRAINT "FK_c7fb0fc77efa4dfcd8e999e0ae1" FOREIGN KEY ("serviceServiceId") REFERENCES "service"("service_id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "service" ADD CONSTRAINT "FK_c8c0d566268ec73503932c133bd" FOREIGN KEY ("serviceIcUsername") REFERENCES "user"("username") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "service_session" ADD CONSTRAINT "FK_10d1cb8d1fca84c0587a748b2d5" FOREIGN KEY ("serviceServiceId") REFERENCES "service"("service_id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "service_session_user" ADD CONSTRAINT "FK_93c5a4bd8f54d4f25734d405445" FOREIGN KEY ("userUsername") REFERENCES "user"("username") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "service_session_user" ADD CONSTRAINT "FK_9731d8f5e9512262ff4f4ad34aa" FOREIGN KEY ("serviceSessionServiceSessionId") REFERENCES "service_session"("service_session_id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_permission" ADD CONSTRAINT "FK_de6aaa3986b9ebee69cdaef2467" FOREIGN KEY ("userUsername") REFERENCES "user"("username") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }
}
