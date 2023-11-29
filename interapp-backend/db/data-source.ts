import { DataSource } from 'typeorm';
import { DataSourceOptions } from 'typeorm';
import { LogLevel } from 'typeorm/browser';

function getLoggingLevel(): 'all' | LogLevel[] {
  switch (process.env.NODE_ENV) {
    case 'production':
      return ['error', 'warn'];
    case 'test':
      return [];
    case 'development':
      return 'all';
    default:
      return 'all';
  }
}

export const AppDataSourceOptions: DataSourceOptions = {
  type: 'postgres',
  host: process.env.POSTGRES_HOST,
  port: Number(process.env.POSTGRES_PORT),
  username: process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASSWORD,
  database: process.env.POSTGRES_DB,
  synchronize: false,
  logging: getLoggingLevel(),
  logger: 'advanced-console',
  maxQueryExecutionTime: 1000,
  entities: [`${__dirname}/entities/*.ts`],
  subscribers: [],
  migrations: [`${__dirname}/migrations/*.ts`],
  migrationsRun: true,
};

// for migrations only
// override host to localhost to avoid docker networking issues in CLI
const migrationDataSource = new DataSource({
  ...AppDataSourceOptions,
  host: 'localhost',
});
export default migrationDataSource;
