'use client';
import {
  fetchAttendanceDetails,
  type fetchAttendanceDetailsType,
} from '../AttendanceMenuEntry/AttendanceMenuEntry';
import APIClient from '@/api/api_client';
import { useState, useEffect, memo, useRef, Suspense } from 'react';
import { Title, Text, Badge, Skeleton, NavLink } from '@mantine/core';
import { useInterval } from '@mantine/hooks';
import QRCode from 'qrcode';
import { IconFlag, IconExternalLink } from '@tabler/icons-react';
import './styles.css';
import Link from 'next/link';

interface QRPageProps {
  id: number;
  hash: string;
}
const refreshAttendance = async (id: number) => {
  const apiClient = new APIClient({ useClient: false }).instance;
  const res = await apiClient.get('/service/session_user_bulk', {
    params: { service_session_id: id },
  });
  if (res.status !== 200) throw new Error('Failed to fetch user attendance details');

  const sessionUserDetails: {
    service_session_id: number;
    username: string;
    ad_hoc: boolean;
    attended: 'Absent' | 'Attended' | 'Valid Reason';
    is_ic: boolean;
  }[] = res.data;

  return sessionUserDetails;
};

const QRPage = ({ id, hash }: QRPageProps) => {
  const [detail, setDetail] = useState<fetchAttendanceDetailsType>(
    {} as fetchAttendanceDetailsType,
  );

  const redirectLink = useRef<string>(
    process.env.NEXT_PUBLIC_WEBSITE_URL + '/attendance/verify?hash=' + hash,
  );

  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [timer, setTimer] = useState(5);
  const timerInterval = useInterval(() => {
    setTimer((prev) => prev - 1);
  }, 1000);

  useEffect(() => {
    fetchAttendanceDetails(id).then((data) => {
      setDetail(data);
    });
  }, []);

  useEffect(() => {
    if (canvasRef.current) {
      QRCode.toCanvas(
        canvasRef.current,
        redirectLink.current,
        {
          width: 300,
        },
        function (error) {
          if (error) {
            canvasRef.current?.after(error.message);
            canvasRef.current?.remove();
          }
        },
      );
    }
  }, [canvasRef]);

  useEffect(() => {
    if (detail.service_session_id) {
      timerInterval.start();
    }
    return () => {
      timerInterval.stop();
    };
  }, [detail.service_session_id]);

  useEffect(() => {
    if (timer === 0) {
      timerInterval.stop();
      refreshAttendance(id).then((data) => {
        setDetail((prev) => {
          return { ...prev, user_details: data };
        });
        setTimer(5);
        timerInterval.start();
      });
    }
  }, [timer]);

  return (
    <div>
      <h1>QR Page</h1>
      <div className='QRCode-container'>
        <canvas className='QRCode' ref={canvasRef} />
        <div className='QRCode-redirect'>
          <IconExternalLink color='blue' />
          <Link href={redirectLink.current}>Verify Attendance</Link>
        </div>
      </div>
      <Suspense fallback={<Skeleton width='100%' height={30} />}>
        <div className='QRCode-details'>
          <Title order={2}>
            {detail.service_title} (id: {detail.service_session_id})
          </Title>
          <Text>
            {detail.start_time?.toLocaleString()} - {detail.end_time?.toLocaleString()}
          </Text>

          <Text>
            {detail.user_details?.filter((user) => user.attended === 'Attended').length} /{' '}
            {detail.user_details?.length} attended
          </Text>
          <div className='QRCode-users'>
            {detail.user_details?.map((user) => {
              return (
                <Badge
                  color={
                    {
                      Attended: 'green',
                      Absent: 'red',
                      'Valid Reason': 'yellow',
                    }[user.attended]
                  }
                  key={user.username}
                  rightSection={user.is_ic ? <IconFlag /> : null}
                >
                  {user.username}
                </Badge>
              );
            })}
          </div>
          <Text>Refreshes in {timer} seconds!</Text>
        </div>
      </Suspense>
    </div>
  );
};

export default memo(QRPage);
