'use client';
import APIClient from '@api/api_client';
import { useEffect, useContext, useRef } from 'react';
import { AuthContext } from '@providers/AuthProvider/AuthProvider';
import { Skeleton, Text, Button } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import Link from 'next/link';

const handleSetValidReason = async (id: number, username: string) => {
  const apiClient = new APIClient().instance;
  const res = await apiClient.patch('/service/session_user', {
    service_session_id: id,
    username: username,
    attended: 'Valid Reason',
  });

  if (res.status !== 200) throw new Error(res.data.message);
};

interface AbsenceFormProps {
  id: number;
}

const AbsenceForm = ({ id }: AbsenceFormProps) => {
  const { user, loading } = useContext(AuthContext);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const handleSubmit = () => {
    if (user === null) return;
    handleSetValidReason(id, user.username)
      .then(() => {
        notifications.show({
          title: 'Success',
          message: 'Attendance has been marked as valid reason',
          color: 'green',
        });
      })
      .catch((err) => {
        notifications.show({
          title: 'Error',
          message: err.message,
          color: 'red',
        });
      });
  };

  if (loading) return <Skeleton width='100%' height={30} />;

  return (
    <>
      <iframe
        id='iframe'
        src='https://form.gov.sg/6566aa8a01ba2500110fc943'
        style={{ width: '100%', height: '500px' }}
        ref={iframeRef}
      />

      <div
        style={{
          fontFamily: 'Sans-Serif',
          fontSize: '12px',
          color: '#999',
          opacity: 0.5,
          paddingTop: '5px',
          display: 'flex',
          justifyContent: 'center',
        }}
      >
        <Text size='xs'>
          Powered by{' '}
          <Link href='https://form.gov.sg' style={{ color: '#999' }}>
            Form
          </Link>
        </Text>
      </div>
      <Text>
        If the form is not loaded, you can also fill it in at{' '}
        <Link href='https://form.gov.sg/6566aa8a01ba2500110fc943' target='_blank'>
          here
        </Link>
        .
      </Text>
      <Button onClick={handleSubmit} variant='outline' color='blue'>
        Mark as Valid Reason
      </Button>
    </>
  );
};

export default AbsenceForm;
