'use client';
import APIClient from '@api/api_client';
import SearchableSelect from '@components/SearchableSelect/SearchableSelect';
import { UserWithProfilePicture } from '@providers/AuthProvider/types';
import { useDisclosure } from '@mantine/hooks';
import { useForm } from '@mantine/form';
import { useState, useEffect, useContext } from 'react';
import { Modal, Button, Text, TagsInput } from '@mantine/core';
import { AuthContext } from '@providers/AuthProvider/AuthProvider';

import './styles.css';
import { Permissions } from '@/app/route_permissions';

const handleGetUsers = async (service_id: number) => {
  const apiClient = new APIClient().instance;

  const get_users_by_service = await apiClient.get(
    `/service/get_users_by_service?service_id=${service_id}`,
  );
  const users: Omit<UserWithProfilePicture, 'permissions'>[] = get_users_by_service.data;
  let serviceUsers: string[] = [];
  if (get_users_by_service.status === 404) {
    serviceUsers = [];
  } else if (get_users_by_service.status === 200) {
    serviceUsers = users.map((user) => user.username);
  } else throw new Error('Could not get users by service');

  const get_all_users = await apiClient.get('/user');
  if (get_all_users.status !== 200) throw new Error('Could not get all users');
  const all_users: Omit<UserWithProfilePicture, 'permissions'>[] = get_all_users.data;
  const allUsernames = all_users !== undefined ? all_users.map((user) => user.username) : [];

  return [serviceUsers, allUsernames] as const;
};

interface ServiceBoxUsersProps {
  service_id: number;
  service_ic: string;
  alreadyServiceICUsernames: string[];
  handleChangeServiceIc: (service_ic: string) => void;
  handleChangeServiceUsers: (old_service_users: string[], service_users: string[]) => void;
}

const ServiceBoxUsers = ({
  service_id,
  service_ic,
  alreadyServiceICUsernames,
  handleChangeServiceIc,
  handleChangeServiceUsers,
}: ServiceBoxUsersProps) => {
  const { user } = useContext(AuthContext);

  const [allUsernames, setAllUsernames] = useState<string[]>([]);
  const [allValidServiceICUsernames, setAllValidServiceICUsernames] = useState<string[]>([]);

  const [opened, { open, close }] = useDisclosure();
  const [loading, setLoading] = useState(false);

  // used to check for equality when saving changes
  const [initialValues, setInitialValues] = useState({
    service_ic: service_ic,
    service_users: [] as string[],
  });

  const form = useForm({
    initialValues: {
      service_ic: service_ic,
      service_users: [] as string[],
    },
  });

  useEffect(() => {
    if (!opened) return;
    handleGetUsers(service_id).then(([serviceUsers, allUsernames]) => {
      form.setFieldValue('service_users', serviceUsers);
      setInitialValues({
        service_ic: service_ic,
        service_users: serviceUsers,
      });
      setAllUsernames(allUsernames);
      setAllValidServiceICUsernames([
        ...allUsernames.filter((username) => !alreadyServiceICUsernames.includes(username)),
        service_ic,
      ]);
    });
  }, [opened]);

  useEffect(() => {
    if (!form.values.service_ic) return;
    if (!form.values.service_users.includes(form.values.service_ic)) {
      form.setFieldValue('service_users', [...form.values.service_users, form.values.service_ic]);
    }
  }, [form.values.service_ic]);

  if (!user) return null;
  if (!user.permissions.includes(Permissions.EXCO)) return null;

  const handleSave = () => {
    setLoading(true);

    if (initialValues.service_ic !== form.values.service_ic)
      handleChangeServiceIc(form.values.service_ic);

    const eqSet = (as: string[], bs: string[]) =>
      as.length === bs.length && as.every((a) => bs.includes(a));
    if (!eqSet(initialValues.service_users, form.values.service_users))
      handleChangeServiceUsers(initialValues.service_users, form.values.service_users);
    close();
    setLoading(false);
  };

  return (
    <>
      <Modal opened={opened} onClose={close} title='Manage Users'>
        <div className='service-box-users'>
          <Text>
            Edit assigned services for Interact's members. You must assign 1 service IC to every
            service which cannot be managing another service. Please ensure that the regular
            participating users includes the service IC.
          </Text>

          <SearchableSelect
            defaultValue={service_ic}
            allValues={allValidServiceICUsernames}
            label='Service IC'
            {...form.getInputProps('service_ic')}
          />

          <TagsInput
            label='Service Users'
            placeholder='Users that participate in this service regularly'
            required
            data={allUsernames}
            {...form.getInputProps('service_users')}
          />

          <div className='service-box-users-actions'>
            <Button onClick={close} variant='outline' color='red'>
              Close
            </Button>
            <Button onClick={handleSave} variant='outline' color='green' loading={loading}>
              Save
            </Button>
          </div>
        </div>
      </Modal>

      <Button onClick={open} variant='outline'>
        Manage Users
      </Button>
    </>
  );
};

export default ServiceBoxUsers;
