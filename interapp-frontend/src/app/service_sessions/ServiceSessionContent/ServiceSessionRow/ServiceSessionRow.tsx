import { memo } from 'react';
import { Table, Badge, Text, Group } from '@mantine/core';
import { ServiceSession } from '../../types';
import EditAction from '../EditAction/EditAction';
import './styles.css';
import DeleteAction from '../DeleteAction/DeleteAction';

type ServiceSessionRowProps = Omit<ServiceSession, 'service_id'> & {
  service_promotional_image?: string | null;
  isDesktop: boolean;
  refreshData: () => void;
};

const ServiceSessionRow = ({
  service_session_id,
  service_promotional_image,
  service_name,
  start_time,
  end_time,
  ad_hoc_enabled,
  service_session_users,
  service_hours,
  isDesktop,
  refreshData,
}: ServiceSessionRowProps) => {
  return (
    <Table.Tr>
      {isDesktop && (
        <Table.Td>
          <img
            src={service_promotional_image ?? '/placeholder-image.jpg'}
            alt={service_name}
            className='service-session-img'
          />
        </Table.Td>
      )}
      <Table.Td>{service_session_id}</Table.Td>
      <Table.Td>{service_name}</Table.Td>

      <Table.Td>
        {new Date(start_time).toLocaleString()} - {new Date(end_time).toLocaleString()}{' '}
      </Table.Td>

      <Table.Td>{ad_hoc_enabled ? <Text c='green'>Yes</Text> : <Text c='red'>No</Text>}</Table.Td>
      <Table.Td>
        <div className='service-session-users'>
          {service_session_users.map((user) => (
            <Badge
              color={
                {
                  Absent: 'red',
                  Attended: 'green',
                  'Valid Reason': 'yellow',
                }[user.attended]
              }
              key={user.username}
            >
              {user.username}
            </Badge>
          ))}
        </div>
      </Table.Td>
      <Table.Td>
        <Group gap={2} justify='center'>
          <EditAction
            service_session_id={service_session_id}
            start_time={start_time}
            end_time={end_time}
            ad_hoc_enabled={ad_hoc_enabled}
            attendees={service_session_users}
            service_hours={service_hours}
            refreshData={refreshData}
          />
          <DeleteAction id={service_session_id} refreshData={refreshData} />
        </Group>
      </Table.Td>
    </Table.Tr>
  );
};

export default memo(ServiceSessionRow);
