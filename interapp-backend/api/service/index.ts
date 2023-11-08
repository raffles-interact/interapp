import { AppDataSource } from '@db/data-source';

const appDataSource = AppDataSource.getInstance();
await appDataSource.initialize(); // thank god for top-level await with Bun
export default appDataSource;
