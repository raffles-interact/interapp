import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdateService1707138763473 implements MigrationInterface {
  name = 'UpdateService1707138763473';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "service" ADD "enable_scheduled" boolean NOT NULL DEFAULT true`,
    );

    await queryRunner.query(`ALTER TABLE "service" ADD "service_hours" integer`);
    // get start time and end time from service
    const services = await queryRunner.query(
      `SELECT service_id, start_time, end_time FROM service`,
    );
    for (const service of services) {
      const start = service.start_time.split(':').map((v: string) => Number(v)) as [number, number];
      const end = service.end_time.split(':').map((v: string) => Number(v)) as [number, number];

      const start_date = new Date(0, 0, 0, start[0], start[1]);
      const end_date = new Date(0, 0, 0, end[0], end[1]);

      const service_hours = Math.abs(
        (end_date.getTime() - start_date.getTime()) / 1000 / 60 / 60,
      ).toFixed(0);

      await queryRunner.query(`UPDATE service SET service_hours = $1 WHERE service_id = $2`, [
        service_hours,
        service.service_id,
      ]);
    }
    await queryRunner.query(`ALTER TABLE "service" ALTER COLUMN "service_hours" SET NOT NULL`);

    await queryRunner.query(`ALTER TABLE "service_session" ADD "service_hours" integer`);
    // get start time and end time from service session
    const service_sessions = await queryRunner.query(
      `SELECT service_session_id, start_time, end_time FROM service_session`,
    );
    for (const service_session of service_sessions) {
      const start_date = new Date(service_session.start_time);
      const end_date = new Date(service_session.end_time);

      const service_hours = Math.abs(
        (end_date.getTime() - start_date.getTime()) / 1000 / 60 / 60,
      ).toFixed(0);

      await queryRunner.query(
        `UPDATE service_session SET service_hours = $1 WHERE service_session_id = $2`,
        [service_hours, service_session.service_session_id],
      );
    }
    await queryRunner.query(
      `ALTER TABLE "service_session" ALTER COLUMN "service_hours" SET NOT NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "service" DROP COLUMN "service_hours"`);
    await queryRunner.query(`ALTER TABLE "service" DROP COLUMN "enable_scheduled"`);
    await queryRunner.query(`ALTER TABLE "service_session" DROP COLUMN "service_hours"`);
  }
}
