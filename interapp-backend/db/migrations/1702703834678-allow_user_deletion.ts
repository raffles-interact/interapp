import { MigrationInterface, QueryRunner } from 'typeorm';

export class AllowUserDeletion1702703834678 implements MigrationInterface {
  name = 'AllowUserDeletion1702703834678';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "user_permission" DROP CONSTRAINT "FK_de6aaa3986b9ebee69cdaef2467"`,
    );
    await queryRunner.query(
      `ALTER TABLE "service_session_user" DROP CONSTRAINT "FK_93c5a4bd8f54d4f25734d405445"`,
    );
    await queryRunner.query(
      `ALTER TABLE "service" DROP CONSTRAINT "FK_c8c0d566268ec73503932c133bd"`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_service" DROP CONSTRAINT "FK_118cbde2116c9becff2b3216947"`,
    );
    await queryRunner.query(
      `ALTER TABLE "announcement_completion" DROP CONSTRAINT "FK_eb873ba543dd0c052efb8d9df72"`,
    );
    await queryRunner.query(
      `ALTER TABLE "announcement" DROP CONSTRAINT "FK_661b425a5356c3d120353fc97fc"`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_permission" ADD CONSTRAINT "FK_de6aaa3986b9ebee69cdaef2467" FOREIGN KEY ("userUsername") REFERENCES "user"("username") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "service_session_user" ADD CONSTRAINT "FK_93c5a4bd8f54d4f25734d405445" FOREIGN KEY ("userUsername") REFERENCES "user"("username") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "service" ADD CONSTRAINT "FK_c8c0d566268ec73503932c133bd" FOREIGN KEY ("serviceIcUsername") REFERENCES "user"("username") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_service" ADD CONSTRAINT "FK_118cbde2116c9becff2b3216947" FOREIGN KEY ("userUsername") REFERENCES "user"("username") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "announcement_completion" ADD CONSTRAINT "FK_eb873ba543dd0c052efb8d9df72" FOREIGN KEY ("userUsername") REFERENCES "user"("username") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "announcement" ADD CONSTRAINT "FK_661b425a5356c3d120353fc97fc" FOREIGN KEY ("userUsername") REFERENCES "user"("username") ON DELETE CASCADE ON UPDATE NO ACTION`,
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
      `ALTER TABLE "user_service" DROP CONSTRAINT "FK_118cbde2116c9becff2b3216947"`,
    );
    await queryRunner.query(
      `ALTER TABLE "service" DROP CONSTRAINT "FK_c8c0d566268ec73503932c133bd"`,
    );
    await queryRunner.query(
      `ALTER TABLE "service_session_user" DROP CONSTRAINT "FK_93c5a4bd8f54d4f25734d405445"`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_permission" DROP CONSTRAINT "FK_de6aaa3986b9ebee69cdaef2467"`,
    );
    await queryRunner.query(
      `ALTER TABLE "announcement" ADD CONSTRAINT "FK_661b425a5356c3d120353fc97fc" FOREIGN KEY ("userUsername") REFERENCES "user"("username") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "announcement_completion" ADD CONSTRAINT "FK_eb873ba543dd0c052efb8d9df72" FOREIGN KEY ("userUsername") REFERENCES "user"("username") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_service" ADD CONSTRAINT "FK_118cbde2116c9becff2b3216947" FOREIGN KEY ("userUsername") REFERENCES "user"("username") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "service" ADD CONSTRAINT "FK_c8c0d566268ec73503932c133bd" FOREIGN KEY ("serviceIcUsername") REFERENCES "user"("username") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "service_session_user" ADD CONSTRAINT "FK_93c5a4bd8f54d4f25734d405445" FOREIGN KEY ("userUsername") REFERENCES "user"("username") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_permission" ADD CONSTRAINT "FK_de6aaa3986b9ebee69cdaef2467" FOREIGN KEY ("userUsername") REFERENCES "user"("username") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }
}
