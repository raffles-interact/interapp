export const dynamic = 'force-dynamic'; // nextjs needs this to build properly

import { Suspense, lazy } from 'react';
import APIClient from '@api/api_client';
const ServiceBox = lazy(() => import('./ServiceBox/ServiceBox'));
import AddService from './AddService/AddService';
import { Title, Skeleton, Text } from '@mantine/core';
import { ClientError, remapAssetUrl } from '@utils/.';
import { Service } from './types';
import './styles.css';

const fetchAllServices = async () => {
  const apiClient = new APIClient().instance;
  try {
    const res = await apiClient.get('/service/all');

    if (res.status !== 200)
      throw new ClientError({
        message: 'Failed to fetch services',
        responseStatus: res.status,
        responseBody: res.data,
      });

    const allServices: Service[] = res.data;

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

  // sort by name, then day of week
  allServices.sort((a, b) => {
    if (a.name < b.name) return -1;
    if (a.name > b.name) return 1;
    return a.day_of_week - b.day_of_week;
  });

  return (
    <div className='service-page'>
      <div className='service-headers-container'>
        <div className='service-headers'>
          <Title order={1}>Services</Title>

          <AddService />
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
            />
          ))}
        </Suspense>
      </div>
    </div>
  );
}
