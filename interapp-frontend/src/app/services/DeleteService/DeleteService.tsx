'use client';
import { useDisclosure } from '@mantine/hooks';
import { Text, Button } from '@mantine/core';
import CRUDModal from '@/components/CRUDModal/CRUDModal';
import { IconTrash } from '@tabler/icons-react';
import { memo, useState, useContext } from 'react';
import APIClient from '@api/api_client';
import { useRouter } from 'next/navigation';
import { AuthContext } from '@providers/AuthProvider/AuthProvider';
import { Permissions } from '@/app/route_permissions';
import { notifications } from '@mantine/notifications';
import './styles.css';

function DeleteService({
  service_id,
  service_name,
  className,
}: Readonly<{ service_id: number; service_name: string; className?: string }>) {
  const { user } = useContext(AuthContext);
  const apiClient = new APIClient().instance;
  const [opened, { open, close }] = useDisclosure(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleConfirm = async () => {
    setLoading(true);

    await apiClient.delete('/service', {
      data: { service_id },
    });
    router.refresh();
    close();
    notifications.show({
      title: 'Success',
      message: 'Service deleted',
      color: 'green',
    });
    setLoading(false);
  };
  if (!user) return null;
  if (!user.permissions.includes(Permissions.EXCO)) return null;
  return (
    <CRUDModal
      opened={opened}
      open={open}
      close={close}
      Icon={IconTrash}
      iconColor='red'
      title='Delete Service'
      show={() => !!user && user.permissions.includes(Permissions.EXCO)}
      className={className}
    >
      <div className='delete-modal'>
        <Text>
          Are you sure you want to delete this service:{' '}
          <span className='delete-modal-name'>{service_name}</span>? This action cannot be undone.
          Users will lose all their data related to this service.
        </Text>
        <div className='delete-modal-buttons'>
          <Button onClick={close} variant='outline' color='blue' disabled={loading}>
            Cancel
          </Button>
          <Button onClick={handleConfirm} variant='outline' color='red' loading={loading}>
            Delete
          </Button>
        </div>
      </div>
    </CRUDModal>
  );
}

export default memo(DeleteService);
