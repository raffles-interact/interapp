'use client';
import { ActionIcon, Group, Modal, NumberInput, TextInput, Textarea, Button } from '@mantine/core';
import { TimeInput } from '@mantine/dates';
import { IconPlus } from '@tabler/icons-react';
import { useForm } from '@mantine/form';
import { useEffect, useContext, useState } from 'react';
import { AuthContext } from '@/providers/AuthProvider/AuthProvider';
import { Service } from '../page';
import { notifications } from '@mantine/notifications';
import { daysOfWeek } from '../ServiceBox/ServiceBox';
import APIClient from '@/api/api_client';

import SearchableSelect from '@/components/SearchableSelect/SearchableSelect';
import UploadImage, { convertToBase64 } from '@/components/UploadImage/UploadImage';
import './styles.css';
import { Permissions } from '@/app/route_permissions';
import { User } from '@/providers/AuthProvider/types';
import PillsInputWithSearch from '@/components/PillsInputWithSearch/PillsInputWithSearch';
import { useRouter } from 'next/navigation';

export type ServiceWithUsers = Service & { usernames: string[] };
export type CreateServiceWithUsers = Omit<ServiceWithUsers, 'service_id'>;

const allowedFormats = ['image/png', 'image/jpeg', 'image/gif', 'image/webp'];

const getAllUsers = async () => {
  const apiClient = new APIClient().instance;

  const get_all_users = await apiClient.get(`/user`);
  const all_users: Omit<User, 'permissions'>[] = get_all_users.data;
  const allUsersNames = all_users !== undefined ? all_users.map((user) => user.username) : [];
  return allUsersNames;
};

const AddService = () => {
  const { user } = useContext(AuthContext);
  const [opened, setOpened] = useState(false);
  const [allUsersNames, setAllUsersNames] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const apiClient = new APIClient().instance;
  const router = useRouter();
  

  useEffect(() => {
    getAllUsers().then((allUsersNames) => setAllUsersNames(allUsersNames));
  }, []);
  const form = useForm<CreateServiceWithUsers>({
    initialValues: {
      name: '',
      description: '',
      contact_email: '',
      contact_number: null,
      website: '',
      day_of_week: 0,
      start_time: '',
      end_time: '',
      promotional_image: '',
      service_ic_username: '',
      usernames: [],
    },
    validate: {
      name: (value) => value.trim().length <= 2 && 'Name must be longer than 2 characters',
      contact_email: (value) => !value.includes('@') && 'Invalid email',
      contact_number: (value) => {
        if (!value) return false;
        return value.toString().length !== 8 && 'Invalid phone number';
      },
      website: (value) => {
        if (!value) return false;
        return !value.includes('http') && 'Invalid website';
      },
      end_time: (value, values) =>
        value <= values.start_time && 'End time must be after start time',
    },
  });

  const handleSubmit = async (data: CreateServiceWithUsers) => {
    setLoading(true);
    const serviceUsers = data.usernames;

    // nullify empty fields
    const nulledData = {
      ...data,
      description: data.description ? data.description : null,
      contact_number: data.contact_number ? data.contact_number : null,
      website: data.website ? data.website : null,
      promotional_image: data.promotional_image ? data.promotional_image : null,
    };
    const res = await apiClient.post('/service', nulledData);

    switch (res.status) {
      case 200:
        break;
      case 409:
        notifications.show({
          title: 'Service already exists',
          message: 'Service already exists, or service IC already is assigned to another service',
          color: 'red',
        });
        setLoading(false);
        return;

      case 400:
        notifications.show({
          title: 'Error',
          message: 'Invalid data',
          color: 'red',
        });
        setLoading(false);
        return;
      default:
        notifications.show({
          title: 'Error',
          message: 'Service could not be created',
          color: 'red',
        });
        setLoading(false);
        return;
    }
    const service_id = res.data.service_id;
    const body = {
      service_id: service_id,
      data: serviceUsers.map((username) => ({
        action: 'add',
        username: username,
      })),
    };

    const res2 = await apiClient.patch('/user/userservices', body);
    switch (res2.status) {
      case 204:
        notifications.show({
          title: 'Success',
          message: 'Service created',
          color: 'green',
        });
        break;
      default:
        notifications.show({
          title: 'Partial success',
          message: 'Service created, but users could not be added. Edit the service to add users',
          color: 'blue',
        });
        break;
    }
    setLoading(false);
    router.refresh();
    form.reset();
    setOpened(false);
  };

  if (!user) return null;
  if (!user.permissions.includes(Permissions.EXCO)) return null;
  return (
    <>
      <Modal opened={opened} onClose={() => setOpened(false)} title='Add Service'>
        <form onSubmit={form.onSubmit(handleSubmit)}>
          <div className='add-service'>
            <UploadImage
              onChange={async (_, file) =>
                form.setFieldValue('promotional_image', await convertToBase64(file))
              }
              accept={allowedFormats}
              className='add-service-file-display'
            />
            <TextInput label='Service Name' required {...form.getInputProps('name')} />
            <Textarea label='Description' {...form.getInputProps('description')} />
            <TextInput label='Contact Email' required {...form.getInputProps('contact_email')} />
            <NumberInput label='Contact Number' {...form.getInputProps('contact_number')} />
            <TextInput label='Website' {...form.getInputProps('website')} />
            <SearchableSelect
              defaultValue={'Sun'}
              allValues={daysOfWeek}
              onChange={(day_of_week) =>
                form.setFieldValue(
                  'day_of_week',
                  daysOfWeek.indexOf(day_of_week) as 0 | 1 | 2 | 3 | 4 | 5 | 6,
                )
              }
              label='Day of Week'
              required
            />
            <Group>
              <TimeInput label='Start Time' required {...form.getInputProps('start_time')} />
              <TimeInput label='End Time' required {...form.getInputProps('end_time')} />
            </Group>

            <SearchableSelect
              defaultValue={''}
              allValues={allUsersNames}
              onChange={(newServiceIc) => form.setFieldValue('service_ic_username', newServiceIc)}
              label='Service IC'
              required
            />
            <PillsInputWithSearch
              label='Service Users'
              allValues={allUsersNames}
              onChange={(newServiceUsers) => form.setFieldValue('usernames', newServiceUsers)}
              required
            />
            <Group gap={3} justify='center'>
              <Button onClick={() => setOpened(false)} variant='outline' color='red'>
                Cancel
              </Button>
              <Button type='submit' variant='outline' color='green' loading={loading}>
                Submit
              </Button>
            </Group>
          </div>
        </form>
      </Modal>
      <ActionIcon size={36} color='blue' onClick={() => setOpened(true)} className='action-icon'>
        <IconPlus />
      </ActionIcon>
    </>
  );
};

export default AddService;
