import { schedule } from 'node-cron';
import { ServiceModel } from '@models/service';

function constructDate(day_of_week: number, time: string) {
  const d = new Date();
  d.setDate(d.getDate() + ((day_of_week + 7 - d.getDay()) % 7));
  const [hours, minutes] = time.split(':');
  d.setHours(Number(hours), Number(minutes), 0, 0);
  return d;
}

async function getCurrentServices() {
  // get current date and time
  // get service days of week and start and end time
  const services = await ServiceModel.getAllServices();
  return services.map((service) => {
    return {
      service_id: service.service_id,
      day_of_week: service.day_of_week,
      start_time: service.start_time,
      end_time: service.end_time,
    };
  });
}

schedule(
  '* * * * * Sunday',
  async () => {
    const to_be_scheduled = await getCurrentServices();
    if (to_be_scheduled.length === 0) return;

    // schedule services for the week
    let created_services: { [id: number]: Record<string, string | number | boolean> }[] = [];
    for (const service of to_be_scheduled) {
      // create service session
      // add service session id to created_ids
      const detail = {
        service_id: service.service_id,
        start_time: constructDate(service.day_of_week, service.start_time).toISOString(),
        end_time: constructDate(service.day_of_week, service.end_time).toISOString(),
        ad_hoc_enabled: false,
      };
      const service_session_id = await ServiceModel.createServiceSession(detail);
      created_services.push({ [service_session_id]: detail });
    }

    console.log('created service sessions: ', created_services);
  },
  {
    timezone: 'Asia/Singapore',
  },
);
