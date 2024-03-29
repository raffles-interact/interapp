export const dynamic = 'force-dynamic'; // nextjs needs this to build properly

import { Suspense, lazy } from 'react';
import APIClient from '@api/api_client';
const ServiceBox = lazy(() => import('./ServiceBox/ServiceBox'));
import AddService from './AddService/AddService';
import { Title, Skeleton, Text } from '@mantine/core';
import { remapAssetUrl } from '@api/utils';
import { Service } from './types';
import './styles.css';

const fetchAllServices = async () => {
  const apiClient = new APIClient().instance;
  try {
    const res = await apiClient.get('/service/all');

    if (res.status !== 200) throw new Error(res.data);

    const allServices: Service[] = res.data;
    // promotional image url will look like this:
    // http://interapp-minio:9000/interapp-minio/service/yes677?X-Amz-Algorithm=...
    // we need to remove the bit before the 'service' part
    // and remap it to localhost:3000/assets/service/yes677?....

    allServices.forEach((service) => {
      if (service.promotional_image) {
        service.promotional_image = remapAssetUrl(service.promotional_image);
      }
    });

    return allServices;
  } catch (e) {
    console.error(e);
    return [];
  }
};

export default async function ServicesPage() {
  const allServices: Service[] = await fetchAllServices();

  return (
    <div className='service-page'>
      <div className='service-headers-container'>
        <div className='service-headers'>
          <Title order={1}>Services</Title>

          <AddService
            alreadyServiceICUsernames={allServices.map((service) => service.service_ic_username)}
          />
        </div>
        <Text>View the list of Interact Club's services here!</Text>
      </div>

      <div className='service-boxes'>
        <Suspense fallback={<Skeleton className='service-skeleton' />}>
          {allServices.map((service) => (
            <ServiceBox
              key={service.service_id}
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
              service_id={service.service_id}
              service_hours={service.service_hours}
              enable_scheduled={service.enable_scheduled}
              alreadyServiceICUsernames={allServices.map((service) => service.service_ic_username)}
            />
          ))}
        </Suspense>
      </div>
    </div>
  );
}
