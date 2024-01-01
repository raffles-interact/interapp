'use client';
import APIClient from '@api/api_client';
import PillsInputWithSearch from '@components/PillsInputWithSearch/PillsInputWithSearch';
import SearchableSelect from '@components/SearchableSelect/SearchableSelect';
import { User } from '@providers/AuthProvider/types';
import { AxiosInstance } from 'axios';
import { useState, useEffect, useContext } from 'react';
import { Modal, Button, Text } from '@mantine/core';
import { AuthContext } from '@providers/AuthProvider/AuthProvider';

import './styles.css';
import { Permissions } from '@/app/route_permissions';

const handleGetUsers = async (service_id: number, apiClient: AxiosInstance) => {
  const get_users_by_service = await apiClient.get(
    `/service/get_users_by_service?service_id=${service_id}`,
  );
  if (get_users_by_service.status !== 200) throw new Error('Could not get users by service');
  const users: Omit<User, 'permissions'>[] = get_users_by_service.data.users;
  const serviceUsers = users !== undefined ? users.map((user) => user.username) : [];

  const get_all_users = await apiClient.get(`/user`);
  if (get_all_users.status !== 200) throw new Error('Could not get all users');
  const all_users: Omit<User, 'permissions'>[] = get_all_users.data;
  const allUsernames = all_users !== undefined ? all_users.map((user) => user.username) : [];

  return [serviceUsers, allUsernames];
};

interface ServiceBoxUsersProps {
  service_id: number;
  service_ic: string;
  handleChangeServiceIc: (service_ic: string) => void;
  handleChangeServiceUsers: (old_service_users: string[], service_users: string[]) => void;
}

const ServiceBoxUsers = ({
  service_id,
  service_ic,
  handleChangeServiceIc,
  handleChangeServiceUsers,
}: ServiceBoxUsersProps) => {
  const apiClient = new APIClient().instance;
  const { user } = useContext(AuthContext);

  const [serviceUsers, setServiceUsers] = useState<string[]>([]);
  const [allUsernames, setAllUsernames] = useState<string[]>([]);

  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const [newServiceIc, setNewServiceIc] = useState(service_ic);
  const [newServiceUsers, setNewServiceUsers] = useState<string[]>(serviceUsers);

  useEffect(() => {
    if (!open) return;
    handleGetUsers(service_id, apiClient).then(([serviceUsers, allUsernames]) => {
      setServiceUsers(serviceUsers);
      setAllUsernames(allUsernames);
    });
  }, [open]);

  if (!user) return null;
  if (!user.permissions.includes(Permissions.EXCO)) return null;

  const handleSave = () => {
    setLoading(true);
    if (newServiceIc !== service_ic) handleChangeServiceIc(newServiceIc);
    if (newServiceUsers !== serviceUsers) handleChangeServiceUsers(serviceUsers, newServiceUsers);
    setOpen(false);
    setLoading(false);
  };

  return (
    <>
      <Modal opened={open} onClose={() => setOpen(false)} title='Manage Users'>
        <div className='service-box-users'>
          <Text>
            Edit assigned services for Interact's members. You must assign 1 service IC to every
            service which cannot be managing another service. Please ensure that the regular
            participating users includes the service IC.
          </Text>

          <SearchableSelect
            defaultValue={newServiceIc}
            allValues={allUsernames}
            onChange={(newServiceIc) => setNewServiceIc(newServiceIc)}
            label='Service IC'
          />

          <PillsInputWithSearch
            defaultValues={serviceUsers}
            allValues={allUsernames}
            onChange={(newServiceUsers) => setNewServiceUsers(newServiceUsers)}
            label='Regular service participants'
          />

          <div className='service-box-users-actions'>
            <Button onClick={() => setOpen(false)} variant='outline' color='red'>
              Close
            </Button>
            <Button onClick={handleSave} variant='outline' color='green' loading={loading}>
              Save
            </Button>
          </div>
        </div>
      </Modal>

      <Button onClick={() => setOpen(true)} variant='outline'>
        Manage Users
      </Button>
    </>
  );
};

export default ServiceBoxUsers;
