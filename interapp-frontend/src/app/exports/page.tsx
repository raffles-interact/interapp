import APIClient from '@api/api_client';
import { useMemo } from 'react';
import { Title, Text } from '@mantine/core';

import { type Service } from '@/app/services/types';
import { AxiosInstance } from 'axios';
import './styles.css';
import { ExportsForm } from './ExportsForm/ExportsForm';

const fetchServices = async (apiClient: AxiosInstance) => {
  const res = await apiClient.get('/service/all');

  const data = (res.data as Service[]).map((service) => ({
    name: service.name,
    service_id: service.service_id,
  })) as Pick<Service, 'name' | 'service_id'>[];

  if (res.status !== 200) throw new Error('Could not fetch services');

  return data;
};

export default function Exports() {
  const apiClient = useMemo(() => new APIClient().instance, []);
  const services = fetchServices(apiClient);

  return (
    <div className='exports-page'>
      <Title order={1}>Exports</Title>
      <Text>Export data as an Excel sheet here.</Text>
      <ExportsForm allServices={services} />
    </div>
  );
}
