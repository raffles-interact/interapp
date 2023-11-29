import { schedule } from 'node-cron';

schedule('*/5 * * * * *', () => {
  console.log('running a task every 5 seconds');
});
