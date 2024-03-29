'use client';
import dynamic from 'next/dynamic';
import { Service } from '../types';
import { Suspense, memo } from 'react';
import { Text, Title, Skeleton, Card, Image } from '@mantine/core';
import { IconMail, IconPhoneCall, IconNetwork, IconClock } from '@tabler/icons-react';
import APIClient from '@api/api_client';

const ServiceBoxUsers = dynamic(() => import('../ServiceBoxUsers/ServiceBoxUsers'));
import './styles.css';
import { notifications } from '@mantine/notifications';
import { useRouter } from 'next/navigation';
const DeleteService = dynamic(() => import('../DeleteService/DeleteService'));
const EditService = dynamic(() => import('../EditService/EditService'));

export const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
export const roundTimeToMinutes = (time: string) => {
  const [hours, minutes, _] = time.split(':');
  return `${hours}:${minutes}`;
};

const ServiceBox = (service: Service) => {
  const apiClient = new APIClient().instance;
  const router = useRouter();

  const handleChangeServiceIc = async (service_ic: string) => {
    const res = await apiClient.patch('/service', {
      service_id: service.service_id,
      service_ic_username: service_ic,
    });

    switch (res.status) {
      case 200:
        router.refresh();

        notifications.show({
          title: 'Success',
          message: 'Service IC updated',
          color: 'green',
        });
        break;
      case 400:
        notifications.show({
          title: 'Error',
          message: res.data.message,
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

  return (
    <Card shadow='sm' padding='md' radius='md' className='service-box'>
      <button onClick={() => handleChangeServiceIc('admin')}>Change Service IC</button>
      <div className='service-box-image-container'>
        <Suspense fallback={<Skeleton className='service-box-image-skeleton' />}>
          <Image
            src={service.promotional_image ?? '/placeholder-image.jpg'}
            alt={service.name}
            className='service-box-image'
          />
        </Suspense>

        <div className='service-box-actions'>
          <DeleteService service_id={service.service_id} service_name={service.name} />
          <EditService
            service_id={service.service_id}
            name={service.name}
            description={service.description}
            promotional_image={service.promotional_image}
            contact_email={service.contact_email}
            contact_number={service.contact_number}
            website={service.website}
            start_time={service.start_time}
            end_time={service.end_time}
            day_of_week={service.day_of_week}
            enable_scheduled={service.enable_scheduled}
            service_hours={service.service_hours}
          />
        </div>
      </div>

      <div className='service-box-info'>
        <div className='service-box-info-headers'>
          <Title order={3} className='service-box-info-title'>
            {service.name}
          </Title>
          <Text size='sm' c='dimmed'>
            {service.description ?? 'No description provided :('}
          </Text>
        </div>

        <div className='service-box-info-content'>
          <IconClock className='service-box-icon' />
          <Text>
            {daysOfWeek[service.day_of_week]}{' '}
            {roundTimeToMinutes(service.start_time) + ' - ' + roundTimeToMinutes(service.end_time)}
          </Text>
          <IconMail className='service-box-icon' />
          <Text>{service.contact_email}</Text>

          {service.contact_number && (
            <>
              <IconPhoneCall className='service-box-icon' />
              <Text>{service.contact_number}</Text>
            </>
          )}
          {service.website && (
            <>
              <IconNetwork className='service-box-icon' />
              <Text>{service.website}</Text>
            </>
          )}
        </div>
        <ServiceBoxUsers
          service_id={service.service_id}
          service_ic={service.service_ic_username}
          handleChangeServiceIc={handleChangeServiceIc}
          handleChangeServiceUsers={handleChangeServiceUsers}
        />
      </div>
    </Card>
  );
};

export default memo(ServiceBox);
