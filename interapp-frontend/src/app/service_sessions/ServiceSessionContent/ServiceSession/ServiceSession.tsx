import { memo } from 'react';
import { Table, Pill, Text, Group } from '@mantine/core';
import { ServiceSession } from '../../types';
import EditAction from '../EditAction/EditAction';
import './styles.css';
import DeleteAction from '../DeleteAction/DeleteAction';

// convert start_time and end_time to date and time (in 24 hour format)
const parseDateAndTime = (startTime: string, endTime: string): readonly [string, string] => {
  const startDate = new Date(startTime);
  const endDate = new Date(endTime);

  const isSameDay =
    startDate.getDate() === endDate.getDate() &&
    startDate.getMonth() === endDate.getMonth() &&
    startDate.getFullYear() === endDate.getFullYear();

  return [
    `${startDate.getHours()}:${startDate.getMinutes()} - ${endDate.getHours()}:${endDate.getMinutes()}`,
    isSameDay
      ? `${startDate.getDate()}/${startDate.getMonth() + 1}/${startDate.getFullYear()}`
      : `${startDate.getDate()}/${
          startDate.getMonth() + 1
        }/${startDate.getFullYear()} - ${endDate.getDate()}/${
          endDate.getMonth() + 1
        }/${endDate.getFullYear()}`,
  ];
};

const ServiceSession = ({
  service_session_id,
  service_promotional_image,
  service_name,
  start_time,
  end_time,
  ad_hoc_enabled,
  service_session_users,
  isDesktop,
  refreshData,
}: Omit<ServiceSession, 'service_id'> & {
  service_promotional_image?: string | null;
  isDesktop: boolean;
  refreshData: () => void;
}) => {
  const [timeInterval, date] = parseDateAndTime(start_time, end_time);
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

      <Table.Td>{date}</Table.Td>
      <Table.Td>{timeInterval}</Table.Td>
      <Table.Td>{ad_hoc_enabled ? <Text c='green'>Yes</Text> : <Text c='red'>No</Text>}</Table.Td>
      <Table.Td>
        <div className='service-session-users'>
          {service_session_users.map((user) => (
            <Pill key={user.username}>{user.username}</Pill>
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
            refreshData={refreshData}
          />
          <DeleteAction id={service_session_id} refreshData={refreshData} />
        </Group>
      </Table.Td>
    </Table.Tr>
  );
};

export default memo(ServiceSession);
