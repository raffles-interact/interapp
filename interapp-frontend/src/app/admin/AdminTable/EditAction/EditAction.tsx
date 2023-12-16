'use client';
import { useDisclosure } from '@mantine/hooks';
import { useForm } from '@mantine/form';
import { Modal, ActionIcon, Text, Button, TextInput, NumberInput, Checkbox } from '@mantine/core';
import { IconPencil } from '@tabler/icons-react';
import { User } from '@/providers/AuthProvider/types';
import { memo, useState } from 'react';
import PermissionsInput from '../PermissionsInput/PermissionsInput';
import APIClient from '@/api/api_client';
import './styles.css';

function EditAction({ user, refreshData }: { user: User; refreshData: () => void }) {
  const apiClient = new APIClient().instance;
  const [opened, { open, close }] = useDisclosure(false);
  const [loading, setLoading] = useState(false);
  const form = useForm({
    initialValues: {
      email: user.email,
      permissions: user.permissions,
      service_hours: user.service_hours,
    },
  });

  const handleSubmit = async (values: Pick<User, 'email' | 'permissions' | 'service_hours'>) => {
    setLoading(true);
    if (values.email !== user.email)
      await apiClient.patch('/user/change_email', {
        username: user.username,
        new_email: values.email,
      });

    if (values.permissions !== user.permissions)
      await apiClient.patch('/user/permissions', {
        username: user.username,
        permissions: values.permissions,
      });

    if (values.service_hours !== user.service_hours)
      await apiClient.patch('/user/service_hours', {
        username: user.username,
        hours: values.service_hours,
      });

    refreshData();
    form.setInitialValues(values);
    close();
    setLoading(false);
  };

  return (
    <>
      <Modal
        opened={opened}
        onClose={close}
        title='Edit User Data'
        className='edit-modal'
        closeOnClickOutside={false}
        closeOnEscape={false}
        withCloseButton={false}
      >
        <Text>Warning: Do not misuse this feature.</Text>
        <form onSubmit={form.onSubmit(handleSubmit)} className='edit-modal-form'>
          <TextInput label='Email' {...form.getInputProps('email')} />
          <PermissionsInput
            defaultValues={form.values.permissions}
            onChange={(newValues) => form.setFieldValue('permissions', newValues)}
          />

          <NumberInput
            allowNegative={false}
            allowLeadingZeros={false}
            label='Service Hours'
            {...form.getInputProps('service_hours')}
          />
          <div className='edit-modal-form-buttons'>
            <Button
              onClick={() => {
                close();
                form.reset();
              }}
              variant='outline'
              color='red'
            >
              Close
            </Button>
            <Button type='submit' variant='outline' color='green' loading={loading}>
              Save and close
            </Button>
          </div>
        </form>
      </Modal>

      <ActionIcon size={36} onClick={open} className='action-icon'>
        <IconPencil />
      </ActionIcon>
    </>
  );
}

export default memo(EditAction);
