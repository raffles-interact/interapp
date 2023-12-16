'use client';
import { useDisclosure } from '@mantine/hooks';
import { Modal, ActionIcon, Text, Button } from '@mantine/core';
import { IconTrash } from '@tabler/icons-react';
import { memo, useState } from 'react';
import APIClient from '@/api/api_client';
import './styles.css';

function DeleteAction({ username, refreshData }: { username: string; refreshData: () => void }) {
  const apiClient = new APIClient().instance;
  const [opened, { open, close }] = useDisclosure(false);
  const [loading, setLoading] = useState(false);

  const handleConfirm = async () => {
    setLoading(true);

    await apiClient.delete('/user', {
      data: { username },
    });

    refreshData();
    close();
    setLoading(false);
  };

  return (
    <>
      <Modal
        opened={opened}
        onClose={close}
        title='Delete User Data'
        closeOnClickOutside={false}
        closeOnEscape={false}
        withCloseButton={false}
        zIndex={999}
      >
        <div className='delete-modal'>
          <Text>
            Are you sure you want to delete this user:{' '}
            <span className='delete-modal-username'>{username}</span>? All data related to the user
            will be lost, including announcements, services, service sessions and more! This action
            cannot be undone.
          </Text>
          <div className='delete-modal-buttons'>
            <Button onClick={close} variant='outline' color='gray' disabled={loading}>
              Cancel
            </Button>
            <Button onClick={handleConfirm} variant='outline' color='red' loading={loading}>
              Delete
            </Button>
          </div>
        </div>
      </Modal>

      <ActionIcon size={36} onClick={open} color='red' className='action-icon'>
        <IconTrash />
      </ActionIcon>
    </>
  );
}

export default memo(DeleteAction);
