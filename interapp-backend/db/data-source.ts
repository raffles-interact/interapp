import { DataSource } from 'typeorm';
import { DataSourceOptions } from 'typeorm';
import { HelloWorld } from './entities/hello_world';

const options: DataSourceOptions = {
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
};

export const AppDataSource = new DataSource(options);

// for migrations only
// override host to localhost to avoid docker networking issues in CLI
export default new DataSource({
  ...options,
  host: 'localhost',
});
