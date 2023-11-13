import { AppDataSource } from '@db/data-source';

const appDataSource = await AppDataSource.initialize(); // thank god for top-level await with Bun
export default appDataSource;
