export const dynamic = 'force-dynamic'; // nextjs needs this to build properly

import APIClient from '@/api/api_client';
import ServiceBox from './ServiceBox/ServiceBox';
import './styles.css';

export interface Service {
  service_id: number;
  name: string;
  description: string | null;
  contact_email: string;
  contact_number: number | null;
  website: string | null;
  promotional_image: string | null;
  day_of_week: 0 | 1 | 2 | 3 | 4 | 5 | 6;
  start_time: string;
  end_time: string;
  service_ic_username: string;
}

export interface ServiceWithUsers {
  service: Service;
  usernames: string[];
}

export default async function ServicesPage() {
  const apiClient = new APIClient({ useClient: false }).instance;
  const allServices: Service[] = (await apiClient.get('/service/get_all')).data.services;

  return (
    <div>
      <h1>Services</h1>
      <div className='service-boxes'>
        {allServices.map((service) => (
          <ServiceBox
            key={service.service_id}
            service_id={service.service_id}
            name={service.name}
            description={service.description}
            contact_email={service.contact_email}
            contact_number={service.contact_number}
            website={service.website}
            promotional_image={service.promotional_image}
            day_of_week={service.day_of_week}
            start_time={service.start_time}
            end_time={service.end_time}
            service_ic_username={service.service_ic_username}
          />
        ))}
      </div>
    </div>
  );
}
