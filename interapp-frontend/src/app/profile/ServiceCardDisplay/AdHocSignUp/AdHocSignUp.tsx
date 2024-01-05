'use client';
import { Button, Modal, Table } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { ServiceSession } from '@/app/service_sessions/types';

type AdHocSignUpProps =
  | {
      show: true;
      adHocSessions: Omit<ServiceSession, 'service_session_users' | 'service_name'>[];
      serviceName: string;
      handleSignUp: (service_session_id: number) => void;
    }
  | { show: false };

const generateTimeInfo = (start_time: string, end_time: string) => {
  const startTime = new Date(start_time);
  const endTime = new Date(end_time);
  return `${startTime.toLocaleString()} - ${endTime.toLocaleString()}`;
};

const AdHocSignUp = (props: AdHocSignUpProps) => {
  const { show } = props;
  const adHocSessions = show ? props.adHocSessions : [];
  const serviceName = show ? props.serviceName : '';
  const handleSignUp = show ? props.handleSignUp : () => {};

  const [opened, { open, close }] = useDisclosure();

  if (!show) return null;
  return (
    <>
      <Button onClick={open} variant='outline'>
        Ad Hoc Available
      </Button>
      <Modal opened={opened} onClose={close} title={serviceName}>
        <Table>
          <Table.Thead>
            <Table.Tr>
              <Table.Th>Service Date</Table.Th>
              <Table.Th>Sign Up?</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {adHocSessions.map((session) => (
              <Table.Tr key={session.service_session_id}>
                <Table.Td>{generateTimeInfo(session.start_time, session.end_time)}</Table.Td>
                <Table.Td>
                  <Button
                    onClick={() => handleSignUp(session.service_session_id)}
                    variant='outline'
                  >
                    Sign Up
                  </Button>
                </Table.Td>
              </Table.Tr>
            ))}
          </Table.Tbody>
        </Table>
      </Modal>
    </>
  );
};

export default AdHocSignUp;
