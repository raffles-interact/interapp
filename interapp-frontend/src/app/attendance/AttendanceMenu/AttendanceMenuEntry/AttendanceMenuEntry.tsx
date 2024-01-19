'use client';

import APIClient from '@/api/api_client';
import { useState, useEffect, memo } from 'react';
import { Text, Skeleton, Paper, Title, Badge } from '@mantine/core';
import { AxiosResponse } from 'axios';
import { remapAssetUrl } from '@/api/utils';
import { IconFlag } from '@tabler/icons-react';
import { useRouter } from 'next/navigation';
import './styles.css';

interface AttendanceMenuEntryProps {
  service_session_id: number;
}

export const fetchAttendanceDetails = async (service_session_id: number) => {
  const apiClient = new APIClient().instance;
  const res = await apiClient.get('/service/session', {
    params: { service_session_id: service_session_id },
  });
  if (res.status !== 200) throw new Error('Failed to fetch attendance details');

  const res2 = await apiClient.get('/service/session_user_bulk', {
    params: { service_session_id: service_session_id },
  });
  if (res2.status !== 200) throw new Error('Failed to fetch user attendance details');

  let res3: AxiosResponse<any, any> | null = (await apiClient.get('/service', {
    params: { service_id: res.data.service_id },
  })) satisfies AxiosResponse<any, any>;
  if (res3.status !== 200) res3 = null;

  const promo: string | null = res3 ? res3.data.promotional_image : null;
  const serviceTitle: string | null = res3 ? res3.data.name : null;

  const sessionDetails: {
    service_id: number;
    start_time: string;
    end_time: string;
    ad_hoc_enabled: boolean;
    service_session_id: number;
  } = res.data;
  const sessionUserDetails: {
    service_session_id: number;
    username: string;
    ad_hoc: boolean;
    attended: 'Absent' | 'Attended' | 'Valid Reason';
    is_ic: boolean;
  }[] = res2.data;

  return {
    ...sessionDetails,
    start_time: new Date(sessionDetails.start_time),
    end_time: new Date(sessionDetails.end_time),
    user_details: sessionUserDetails,
    promotional_image: promo ? remapAssetUrl(promo) : null,
    service_title: serviceTitle,
  };
};

export type fetchAttendanceDetailsType = Awaited<ReturnType<typeof fetchAttendanceDetails>>;

const AttendanceMenuEntry = ({ service_session_id }: AttendanceMenuEntryProps) => {
  const router = useRouter();
  const [detail, setDetail] = useState<fetchAttendanceDetailsType>(
    {} as fetchAttendanceDetailsType,
  );

  useEffect(() => {
    fetchAttendanceDetails(service_session_id).then((data) => {
      setDetail(data);
    });
  }, []);

  if (Object.keys(detail).length === 0) {
    return <Skeleton className='entry-skeleton' />;
  }

  return (
    <Paper
      shadow='xs'
      withBorder
      component='button'
      w='100%'
      onClick={() => router.push('/attendance?id=' + detail.service_session_id)}
    >
      <div className='entry'>
        <div className='entry-image-container'>
          <img
            src={detail.promotional_image ?? '/placeholder-image.jpg'}
            className='entry-image'
            alt='promotional-img'
          />
        </div>

        <div className='entry-text'>
          <Title order={3}>
            {detail.service_title} (id: {detail.service_session_id})
          </Title>
          <Text>
            {detail.start_time.toLocaleString()} - {detail.end_time.toLocaleString()}
          </Text>
          <Text>
            {detail.user_details.filter((user) => user.attended === 'Attended').length} /{' '}
            {detail.user_details.length} attended
          </Text>
          <div className='entry-users'>
            {detail.user_details.map((user) => {
              return (
                <Badge
                  color={
                    {
                      Attended: 'green',
                      Absent: 'red',
                      'Valid Reason': 'yellow',
                    }[user.attended]
                  }
                  variant='light'
                  className='entry-pill'
                  rightSection={user.is_ic ? <IconFlag /> : null}
                  key={user.username}
                >
                  {user.username}
                </Badge>
              );
            })}
          </div>
        </div>
      </div>
    </Paper>
  );
};

export default memo(AttendanceMenuEntry);
