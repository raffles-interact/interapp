import { AppDataSourceOptions } from '@db/data-source';
import { DataSource } from 'typeorm';

const appDataSource = new DataSource(AppDataSourceOptions);
await appDataSource.initialize(); // thank god for top-level await with Bun
export default appDataSource;
