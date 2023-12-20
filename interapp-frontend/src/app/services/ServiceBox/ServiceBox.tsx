'use client';
import dynamic from 'next/dynamic';
import { Service } from '../page';
import { Suspense, memo, useState } from 'react';
import { Text, Title, Skeleton } from '@mantine/core';
import { IconMail, IconPhoneCall, IconNetwork, IconCalendar, IconClock } from '@tabler/icons-react';
import APIClient from '@/api/api_client';

const ServiceBoxUsers = dynamic(() => import('../ServiceBoxUsers/ServiceBoxUsers'));
import './styles.css';
import { notifications } from '@mantine/notifications';
const DeleteService = dynamic(() => import('../DeleteService/DeleteService'));

export const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
export const roundTimeToMinutes = (time: string) => {
  const [hours, minutes, _] = time.split(':');
  return `${hours}:${minutes}`;
};

const ServiceBox = (service: Service) => {
  const apiClient = new APIClient().instance;

  const [serviceInfo, setServiceInfo] = useState<Service>(service);
  const handleChangeServiceIc = async (service_ic: string) => {
    const res = await apiClient.patch('/service', {
      service_id: service.service_id,
      service_ic_username: service_ic,
    });

    switch (res.status) {
      case 200:
        setServiceInfo(res.data);
        notifications.show({
          title: 'Success',
          message: 'Service IC updated',
          color: 'green',
        });
        break;
      case 400:
        notifications.show({
          title: 'Error',
          message: 'Service IC must be unique -- they cannot manage multiple services',
          color: 'red',
        });
        break;
      default:
        notifications.show({
          title: 'Error',
          message: 'Service IC could not be updated',
          color: 'red',
        });
        break;
    }
  };
  const handleChangeServiceUsers = async (old_service_users: string[], service_users: string[]) => {
    const added_users = service_users.filter((user) => !old_service_users.includes(user));
    const removed_users = old_service_users.filter((user) => !service_users.includes(user));

    // sigh... this endpoint was originally not implemented at all, and i just thought to send multiple requests at once
    // then i have to remind myself that this is not a hackathon and i can't just rush silly things like this
    // i'm so tired

    const actions = [
      ...added_users.map((user) => {
        return { action: 'add', username: user };
      }),
      ...removed_users.map((user) => {
        return { action: 'remove', username: user };
      }),
    ];
    const res = await apiClient.patch('/user/userservices', {
      service_id: service.service_id,
      data: actions,
    });

    switch (res.status) {
      case 204:
        notifications.show({
          title: 'Success',
          message: 'Service users updated',
          color: 'green',
        });
        break;
      default:
        notifications.show({
          title: 'Error',
          message: 'Service users could not be updated',
          color: 'red',
        });
        break;
    }
  };

  const parsedPromotionalImage = () => {
    if (typeof serviceInfo.promotional_image === 'string') {
      return serviceInfo.promotional_image;
    } else if (serviceInfo.promotional_image !== null) {
      return Buffer.from(serviceInfo.promotional_image.data).toString();
    } else {
      return '/placeholder-image.jpg';
    }
  };

  return (
    <div className='service-box'>
      <div className='service-box-image-container'>
        <Suspense fallback={<Skeleton className='service-box-image-skeleton' />}>
          <img
            src={parsedPromotionalImage()}
            alt={serviceInfo.name}
            className='service-box-image'
          />
        </Suspense>

        <DeleteService
          service_id={serviceInfo.service_id}
          service_name={serviceInfo.name}
          className='service-box-delete'
        />
      </div>

      <div className='service-box-info'>
        <div className='service-box-info-headers'>
          <Title order={3} className='service-box-info-title'>
            {serviceInfo.name}
          </Title>
          <Text>{serviceInfo.description ?? 'No description provided :('}</Text>
        </div>

        <div className='service-box-info-content'>
          <div>
            <Text className='service-box-info-title'>Contact Info:</Text>
            <div className='service-box-info-content-inner'>
              <IconMail size={20} />
              <Text>{serviceInfo.contact_email}</Text>

              {serviceInfo.contact_number && (
                <>
                  <IconPhoneCall size={20} />
                  <Text>{serviceInfo.contact_number}</Text>
                </>
              )}
              {serviceInfo.website && (
                <>
                  <IconNetwork size={20} />
                  <Text>{serviceInfo.website}</Text>
                </>
              )}
            </div>
          </div>
          <div>
            <Text className='service-box-info-title'>Service Info:</Text>
            <div className='service-box-info-content-inner'>
              <IconCalendar size={20} />
              <Text>{daysOfWeek[serviceInfo.day_of_week]}</Text>
              <IconClock size={20} />
              <Text>
                {roundTimeToMinutes(serviceInfo.start_time) +
                  ' - ' +
                  roundTimeToMinutes(serviceInfo.end_time)}
              </Text>
            </div>
          </div>
        </div>
        <ServiceBoxUsers
          service_id={serviceInfo.service_id}
          service_ic={serviceInfo.service_ic_username}
          handleChangeServiceIc={handleChangeServiceIc}
          handleChangeServiceUsers={handleChangeServiceUsers}
        />
      </div>
    </div>
  );
};

export default memo(ServiceBox);
