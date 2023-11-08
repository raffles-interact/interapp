import { AppDataSource } from '@db/data-source';

AppDataSource.getInstance()
  .initialize()
  .then(() => {
    console.log('Database initialized');
  })
  .catch((err) => {
    console.log('Error initializing database', err);
  });
