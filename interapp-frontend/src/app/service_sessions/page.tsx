export const dynamic = 'force-dynamic'; // nextjs needs this to build properly

import APIClient from '@api/api_client';
import { Service } from '../services/types';
import ServiceSessionContent from './ServiceSessionContent/ServiceSessionContent';
import { remapAssetUrl } from '@api/utils';
import { ServiceSessionsWithMeta, ServiceMeta } from './types';
import { Title, Text } from '@mantine/core';
import './styles.css';

const handleFetchServiceSessionsData = async (
  page: number,
  perPage: number,
  service_id?: number,
) => {
  const apiClient = new APIClient({ useClient: false }).instance;

  // we first get the service sessions
  const params = service_id
    ? { service_id, page, page_size: perPage }
    : { page, page_size: perPage };

  const res = await apiClient.get('/service/session/all', {
    params: params,
  });
  if (res.status !== 200) return null;
  // then we get the services for searching
  const res2 = await apiClient.get('/service/all');
  if (res2.status !== 200) return null;
  // we return the data and map the services to the format that the select component expects
  const parsed = [
    res.data as ServiceSessionsWithMeta,
    (res2.data as Service[]).map((service) => ({
      name: service.name,
      service_id: service.service_id,
      promotional_image: service.promotional_image
        ? remapAssetUrl(service.promotional_image)
        : null,
    })) as ServiceMeta[],
  ] as const;

  return parsed;
};
export default async function ServiceSessionPage() {
  const perPage = 5;

  const refreshServiceSessions = async (page: number, service_id?: number) => {
    'use server';
    const result = await handleFetchServiceSessionsData(page, perPage, service_id);
    if (result === null) throw new Error('Error fetching service sessions');
    return result;
  };

  const [initialData, serviceData] = await refreshServiceSessions(1);
  return (
    <div className='service-sessions-page'>
      <div>
        <Title order={1}>Service Sessions</Title>
        <Text>
          Here you can view all the service sessions! These are created automatically every Sunday
          with the regular users provided in the Services page.
        </Text>
      </div>

      <ServiceSessionContent
        totalPages={Math.ceil(initialData.total_entries / perPage)}
        perPage={perPage}
        serviceOptions={serviceData}
        serviceMetas={serviceData}
        serviceSessionsWithMeta={initialData}
        refreshData={refreshServiceSessions}
      />
    </div>
  );
}
