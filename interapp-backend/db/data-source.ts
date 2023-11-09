import { DataSource } from 'typeorm';
import { HelloWorld } from './entities/hello_world';

export class AppDataSource {
  private static instance: DataSource | null = null;

  constructor() {}

  static getInstance() {
    if (!AppDataSource.instance) {
      AppDataSource.instance = new DataSource({
        type: 'postgres',
        host: process.env.POSTGRES_HOST,
        port: Number(process.env.POSTGRES_PORT),
        username: process.env.POSTGRES_USER,
        password: process.env.POSTGRES_PASSWORD,
        database: process.env.POSTGRES_DB,
        synchronize: process.env.NODE_ENV === 'development',
        logging: true,
        entities: [HelloWorld],
        subscribers: [],
        migrations: [],
      });
    }
    return AppDataSource.instance;
  }
}
