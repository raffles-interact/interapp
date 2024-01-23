'use client';
import APIClient from '@api/api_client';
import { remapAssetUrl } from '@/api/utils';
import { useEffect, useState } from 'react';
import ServiceSessionCard from './ServiceSessionCard/ServiceSessionCard';
import { Text } from '@mantine/core';
import './styles.css';
import PageSkeleton from '@/components/PageSkeleton/PageSkeleton';

const fetchUserServiceSessions = async (username: string) => {
  const apiClient = new APIClient().instance;
  const response = await apiClient.get('/service/session_user_bulk?username=' + username);
  if (response.status !== 200) throw new Error('Failed to fetch service sessions');

  const data: {
    service_id: number;
    start_time: string;
    end_time: string;
    name: string;
    promotional_image?: string | null;
    service_session_id: number;
    username: string;
    ad_hoc: boolean;
    attended: 'Absent' | 'Attended' | 'Valid Reason';
    is_ic: boolean;
  }[] = response.data;

  data.forEach((serviceSession) => {
    if (serviceSession.promotional_image)
      serviceSession.promotional_image = remapAssetUrl(serviceSession.promotional_image);
  });

  return data;
};

type FetchUserServiceSessionsResponse = Awaited<ReturnType<typeof fetchUserServiceSessions>>;

interface ServiceSessionsPageProps {
  username: string;
}

const ServiceSessionsPage = ({ username }: ServiceSessionsPageProps) => {
  const [serviceSessions, setServiceSessions] = useState<FetchUserServiceSessionsResponse>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUserServiceSessions(username).then((data) => {
      setServiceSessions(data);
      setLoading(false);
    });
  }, []);

  if (loading) return <PageSkeleton />;
  if (serviceSessions.length === 0)
    return (
      <div className='service-session-content'>
        <Text>No service sessions found :(</Text>
      </div>
    );
  return (
    <div className='service-session-content'>
      {serviceSessions.map((serviceSession) => (
        <ServiceSessionCard
          key={serviceSession.service_session_id}
          start_time={serviceSession.start_time}
          end_time={serviceSession.end_time}
          name={serviceSession.name}
          promotional_image={serviceSession.promotional_image}
          service_session_id={serviceSession.service_session_id}
          ad_hoc={serviceSession.ad_hoc}
          attended={serviceSession.attended}
          is_ic={serviceSession.is_ic}
        />
      ))}
    </div>
  );
};

export default ServiceSessionsPage;
