export const dynamic = 'force-dynamic'; // nextjs needs this to build properly

import APIClient from '@api/api_client';
import { useMemo } from 'react';
import { Title, Text, Group } from '@mantine/core';

import { type Service } from '@/app/services/types';
import { AxiosInstance } from 'axios';
import './styles.css';
import { AttendanceExportsForm } from './AttendanceExportsForm/AttendanceExportsForm';
import { ServiceHoursExportsForm } from './ServiceHoursExportsForm/ServiceHoursExportsForm';
import { ClientError } from '@utils/.';

const fetchServices = async (apiClient: AxiosInstance) => {
  const res = await apiClient.get('/service/all');

  const data = (res.data as Service[]).map((service) => ({
    name: service.name,
    service_id: service.service_id,
  })) as Pick<Service, 'name' | 'service_id'>[];

  if (res.status !== 200)
    throw new ClientError({
      message: 'Failed to fetch services',
      responseStatus: res.status,
      responseBody: res.data,
    });
  return data;
};

export default function Exports() {
  const apiClient = useMemo(() => new APIClient().instance, []);
  const services = fetchServices(apiClient);

  return (
    <div className='exports-page'>
      <Title order={1}>Exports</Title>
      <Text>Export data as an Excel sheet here.</Text>
      <Group justify='center'>
        <AttendanceExportsForm allServices={services} />
        <ServiceHoursExportsForm />
      </Group>
    </div>
  );
}
