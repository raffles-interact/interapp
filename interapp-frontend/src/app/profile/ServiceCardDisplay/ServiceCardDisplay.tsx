'use client';
import APIClient from '@api/api_client';
import { Service } from '@/app/services/types';
import { ServiceSession } from '@/app/service_sessions/types';
import { remapAssetUrl } from '@api/utils';
import ServiceCard from './ServiceCard/ServiceCard';
import { useState, useEffect } from 'react';
import { Title } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import AdHocSignUp from './AdHocSignUp/AdHocSignUp';
import './styles.css';
import PageSkeleton from '@/components/PageSkeleton/PageSkeleton';

const fetchServices = async (username: string) => {
  const apiClient = new APIClient().instance;
  const res = await apiClient.get('/service/all');

  if (res.status !== 200) throw new Error('Could not fetch services');

  const res2 = await apiClient.get('/service/ad_hoc_sessions');

  if (res2.status !== 200) throw new Error('Could not fetch ad hoc sessions');

  const res3 = await apiClient.get('/user/userservices?username=' + username);

  if (res3.status !== 200) throw new Error('Could not fetch user services');

  const services: Service[] = res.data;
  const adHocSessions: Omit<ServiceSession, 'service_session_users' | 'service_name'>[] = res2.data;
  const userServices: Service[] = res3.data;

  const serviceWithAdHocSessions = services.map((service) => {
    const adHocSessionsForService = adHocSessions.filter(
      (session) => session.service_id === service.service_id,
    );
    const userInService = !!userServices.find((user) => user.service_id === service.service_id);

    return {
      ...service,
      promotional_image: service.promotional_image
        ? remapAssetUrl(service.promotional_image)
        : null,
      ad_hoc_sessions: adHocSessionsForService,
      user_in_service: userInService,
    };
  });

  return serviceWithAdHocSessions;
};

export type FetchServicesResponse = Awaited<ReturnType<typeof fetchServices>>;

const sortServices = (services: FetchServicesResponse) => {
  let userServices: FetchServicesResponse = [];
  let otherServices: FetchServicesResponse = [];
  services.forEach((service) => {
    if (service.user_in_service) {
      userServices.push(service);
    } else {
      otherServices.push(service);
    }
  });

  return {
    userServices,
    otherServices,
  } as const;
};

const handleJoinAdHocSession = async (serviceSessionId: number, username: string) => {
  const apiClient = new APIClient().instance;

  const check = await apiClient.get('/service/session_user', {
    params: {
      service_session_id: serviceSessionId,
      username,
    },
  });

  // if the user has already joined the session, throw an error (404 means they haven't joined)
  if (check.status !== 404) throw new Error('You have already joined this session');

  const res = await apiClient.post('/service/session_user', {
    service_session_id: serviceSessionId,
    username,
    ad_hoc: true,
    attended: 'Absent',
    is_ic: false,
  });

  if (res.status !== 201) throw new Error('Could not join ad hoc session');
};

const generateSessionsInFuture = (service: FetchServicesResponse[number]) => {
  if (service.ad_hoc_sessions.length === 0) return [];

  const now = new Date();

  const sessionsInFuture = service.ad_hoc_sessions.filter((session) => {
    return new Date(session.end_time) > now;
  });

  return sessionsInFuture;
};

interface ServicesPageProps {
  username: string;
}

const ServiceCardDisplay = ({ username }: ServicesPageProps) => {
  const [loading, setLoading] = useState(true);
  const [userServices, setUserServices] = useState<FetchServicesResponse>([]);
  const [otherServices, setOtherServices] = useState<FetchServicesResponse>([]);

  useEffect(() => {
    setLoading(true);
    fetchServices(username).then((data) => {
      const { userServices, otherServices } = sortServices(data);
      setUserServices(userServices);
      setOtherServices(otherServices);
    });
    setLoading(false);
  }, []);

  const handleJoin = (id: number) => {
    handleJoinAdHocSession(id, username)
      .then(() => {
        notifications.show({
          title: 'Joined Ad Hoc Session',
          message: 'You have joined session ' + id,
          color: 'blue',
        });
      })
      .catch((e) => {
        notifications.show({
          title: 'Error',
          message: e.message,
          color: 'red',
        });
      });
  };

  if (loading) return <PageSkeleton />;

  return (
    <div className='service-cards-container'>
      <Title order={3}>Services you are in</Title>
      <div className='service-cards'>
        {userServices.map((service) => (
          <ServiceCard
            key={service.service_id}
            participantType={username === service.service_ic_username ? 'IC' : 'Participant'}
            service={service}
          >
            <AdHocSignUp show={false} />
          </ServiceCard>
        ))}
      </div>

      <Title order={3}>Other services</Title>
      <div className='service-cards'>
        {otherServices.map((service) => (
          <ServiceCard key={service.service_id} participantType={null} service={service}>
            <AdHocSignUp
              show={generateSessionsInFuture(service).length > 0}
              adHocSessions={generateSessionsInFuture(service)}
              serviceName={service.name}
              handleSignUp={handleJoin}
            />
          </ServiceCard>
        ))}
      </div>
    </div>
  );
};

export default ServiceCardDisplay;
