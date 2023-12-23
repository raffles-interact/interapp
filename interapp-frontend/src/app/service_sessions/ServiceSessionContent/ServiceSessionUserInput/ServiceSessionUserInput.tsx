'use client';
import {
  Accordion,
  Select,
  Checkbox,
  Group,
  Stack,
  ActionIcon,
  Center,
  MultiSelect,
} from '@mantine/core';
import { ServiceSessionUser, AttendanceStatus } from '../../types';
import { IconTrash } from '@tabler/icons-react';
import { useState, useEffect } from 'react';
import './styles.css';

interface ServiceSessionUserInputProps {
  service_session_id: number;
  service_session_users: ServiceSessionUser[];
  all_users_names: string[];
  handle_update: (service_session_users: ServiceSessionUser[]) => void;
}

const ServiceSessionUserForm = ({
  user,
  submitCallback,
  handleOpen,
  handleDelete,
}: {
  user: ServiceSessionUser;
  submitCallback: (
    username: string,
    attended: (typeof user)['attended'],
    is_ic: boolean,
    ad_hoc: boolean,
  ) => void;
  handleOpen: (open: boolean) => void;
  handleDelete: (username: string) => void;
}) => {
  const [attended, setAttended] = useState(user.attended);
  const [isIC, setIsIC] = useState(user.is_ic);
  const [adHoc, setAdHoc] = useState(user.ad_hoc);

  const [opened, setOpened] = useState(false);

  useEffect(() => {
    submitCallback(user.username, attended, isIC, adHoc);
  }, [attended, isIC, adHoc]);

  useEffect(() => handleOpen(opened), [opened]);

  return (
    <Accordion.Item key={user.username} value={user.username}>
      <Center>
        <Accordion.Control onClick={() => setOpened(!opened)}>{user.username}</Accordion.Control>
        <ActionIcon
          variant='subtle'
          color='red'
          onClick={() => handleDelete(user.username)}
          size={36}
        >
          <IconTrash />
        </ActionIcon>
      </Center>

      <Accordion.Panel>
        <Stack>
          <Select
            data={AttendanceStatus as unknown as (typeof user)['attended'][]}
            value={attended}
            allowDeselect={false}
            onChange={(e) => setAttended(e as (typeof user)['attended'])}
          />
          <Group justify='center'>
            <Checkbox
              checked={isIC}
              onChange={(e) => setIsIC(e.currentTarget.checked)}
              label='Is IC'
            />
            <Checkbox
              checked={adHoc}
              onChange={(e) => setAdHoc(e.currentTarget.checked)}
              label='Is ad hoc volunteer'
            />
          </Group>
        </Stack>
      </Accordion.Panel>
    </Accordion.Item>
  );
};

const ServiceSessionUserInput = ({
  service_session_id,
  service_session_users,
  all_users_names,
  handle_update,
}: ServiceSessionUserInputProps) => {
  const [serviceSessionUsers, setServiceSessionUsers] = useState(service_session_users);
  const [opened, setOpened] = useState<string[]>([]);

  useEffect(() => handle_update(serviceSessionUsers), [serviceSessionUsers]);

  const handleChangeServiceSessionUserForm = (
    username: string,
    attended: ServiceSessionUser['attended'],
    is_ic: boolean,
    ad_hoc: boolean,
  ) => {
    setServiceSessionUsers(
      serviceSessionUsers.map((user) => {
        if (user.username === username) {
          return {
            ...user,
            attended,
            is_ic,
            ad_hoc,
          };
        }
        return user;
      }),
    );
  };

  const handleDeleteServiceSessionUserForm = (username: string) => {
    setServiceSessionUsers(serviceSessionUsers.filter((user) => user.username !== username));
  };

  const handleAddServiceSessionUserForm = (usernames: string[]) => {
    const newUsers = usernames.filter(
      (username) => !serviceSessionUsers.some((user) => user.username === username),
    );
    const removedUsers = serviceSessionUsers.filter(
      (user) => !usernames.some((username) => user.username === username),
    );

    if (newUsers.length > 0) {
      setServiceSessionUsers([
        ...serviceSessionUsers,
        ...newUsers.map((username) => ({
          username,
          attended: 'Absent' as const,
          is_ic: false,
          ad_hoc: false,
          service_session_id,
        })),
      ]);
    }
    if (removedUsers.length > 0) {
      setServiceSessionUsers(
        serviceSessionUsers.filter(
          (user) => !removedUsers.some((removedUser) => removedUser.username === user.username),
        ),
      );
    }
  };
  return (
    <div className='service-session-user-input'>
      <MultiSelect
        data={all_users_names}
        defaultValue={serviceSessionUsers.map((serviceUser) => serviceUser.username)}
        placeholder='Add Attendees'
        onChange={handleAddServiceSessionUserForm}
        label='Manage Attendees'
      />
      <Accordion multiple variant='contained' className='service-session-user-form' value={opened}>
        {serviceSessionUsers.map((user) => (
          <ServiceSessionUserForm
            key={user.username}
            user={user}
            submitCallback={handleChangeServiceSessionUserForm}
            handleOpen={(open) =>
              setOpened(
                open
                  ? [...opened, user.username]
                  : opened.filter((username) => username !== user.username),
              )
            }
            handleDelete={handleDeleteServiceSessionUserForm}
          />
        ))}
      </Accordion>
    </div>
  );
};

export default ServiceSessionUserInput;
