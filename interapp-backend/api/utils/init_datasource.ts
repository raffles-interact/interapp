import { AppDataSourceOptions } from '@db/data-source';
import { DataSource } from 'typeorm';

const appDataSource = new DataSource(AppDataSourceOptions);
try {
  await appDataSource.initialize();
} catch (err) {
  console.log('Error initializing appDataSource', err);
  process.exit(1);
}
export default appDataSource;
