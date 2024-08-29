'use client';
import { useState, useContext, memo } from 'react';
import { Button, Group } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { notifications } from '@mantine/notifications';
import APIClient from '@api/api_client';
import CRUDModal from '@components/CRUDModal/CRUDModal';
import { AuthContext } from '@providers/AuthProvider/AuthProvider';
import { Permissions } from '@/app/routePermissions';
import { IconTrash } from '@tabler/icons-react';

interface DeleteActionProps {
  id: number;
  refreshData: () => void;
}

const DeleteAction = ({ id, refreshData }: DeleteActionProps) => {
  const apiClient = new APIClient().instance;
  const [opened, { open, close }] = useDisclosure();
  const [loading, setLoading] = useState(false);
  const { user } = useContext(AuthContext);

  const handleDelete = async () => {
    setLoading(true);
    const response = await apiClient.delete('/service/session', {
      data: { service_session_id: id },
    });
    if (response.status !== 204) {
      notifications.show({
        title: 'Error',
        message: 'Could not delete service session',
        color: 'red',
      });

      setLoading(false);
      return;
    }
    notifications.show({
      title: 'Success',
      message: 'Service session deleted',
      color: 'green',
    });
    setLoading(false);
    refreshData();
    close();
  };

  return (
    <CRUDModal
      opened={opened}
      open={open}
      close={close}
      Icon={IconTrash}
      iconColor='red'
      title='Delete Service Session'
      show={() =>
        !!user &&
        (user.permissions.includes(Permissions.SERVICE_IC) ||
          user.permissions.includes(Permissions.MENTORSHIP_IC))
      }
    >
      Are you sure you want to delete the service session with id {id}?
      <Group gap={5} justify='center' m={5}>
        <Button onClick={close} variant='outline'>
          Cancel
        </Button>
        <Button color='red' onClick={handleDelete} loading={loading} variant='outline'>
          Delete
        </Button>
      </Group>
    </CRUDModal>
  );
};

export default memo(DeleteAction);
