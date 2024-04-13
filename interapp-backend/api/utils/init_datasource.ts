import { AppDataSourceOptions } from '@db/data_source';
import { DataSource } from 'typeorm';

const appDataSource = new DataSource(AppDataSourceOptions);
try {
  await appDataSource.initialize();
} catch (err) {
  console.error('Error initializing appDataSource', err, AppDataSourceOptions);
  process.exit(1);
}
export default appDataSource;
