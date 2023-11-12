import { DataSource } from 'typeorm';
import { DataSourceOptions } from 'typeorm';

export const AppDataSourceOptions: DataSourceOptions = {
  type: 'postgres',
  host: process.env.POSTGRES_HOST,
  port: Number(process.env.POSTGRES_PORT),
  username: process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASSWORD,
  database: process.env.POSTGRES_DB,
  synchronize: process.env.NODE_ENV === 'development',
  logging: true,
  entities: [`${__dirname}/entities/*.ts`],
  subscribers: [],
  migrations: [`${__dirname}/migrations/*.ts`],
};

// for migrations only
// override host to localhost to avoid docker networking issues in CLI
const migrationDataSource = new DataSource({
  ...AppDataSourceOptions,
  host: 'localhost',
});
export default migrationDataSource;
