import { AppDataSource } from '@db/data-source';

AppDataSource.initialize()
  .then(() => {
    console.log('Database initialized');
    process.exit(0);
  })
  .catch((err) => {
    console.error('Error initializing database', err);
    process.exit(1);
  });
