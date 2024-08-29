'use client';
import APIClient from '@api/api_client';
import { useState, useEffect } from 'react';
import { User, validateUserType } from '@providers/AuthProvider/types';
import { Permissions } from '../../routePermissions';
import { ClientError, remapAssetUrl } from '@utils/.';
import { Text, Title, Group, Stack, Badge, ActionIcon, Paper, Button } from '@mantine/core';
import './styles.css';
import { permissionsMap } from '@/app/admin/AdminTable/PermissionsInput/PermissionsInput';
import { IconEdit } from '@tabler/icons-react';
import { notifications } from '@mantine/notifications';
import { useRouter } from 'next/navigation';
import PageSkeleton from '@/components/PageSkeleton/PageSkeleton';

const fetchUserDetails = async (username: string) => {
  const apiClient = new APIClient().instance;
  const response = await apiClient.get('/user?username=' + username);

  if (response.status !== 200)
    throw new ClientError({
      message: 'Failed to fetch user details',
      responseStatus: response.status,
      responseBody: response.data,
    });

  const data: User = response.data;

  if (data.profile_picture) data.profile_picture = remapAssetUrl(data.profile_picture);

  const response2 = await apiClient.get('/user/permissions?username=' + username);
  if (response2.status !== 200)
    throw new ClientError({
      message: 'Failed to fetch user permissions',
      responseStatus: response2.status,
      responseBody: response2.data,
    });

  data.permissions = response2.data[username] satisfies Permissions[];

  if (!validateUserType(data))
    throw new ClientError({
      message: 'Invalid user data',
      responseStatus: response.status,
      responseBody: response.data,
    });
  return data;
};

interface OverviewProps {
  username: string;
  updateUser: (newUser: User) => void;
}

const Overview = ({ username, updateUser }: OverviewProps) => {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    fetchUserDetails(username).then((data) => {
      setUser(data);
    });
  }, []);

  const sync = () => {
    if (!user) return;
    fetchUserDetails(username).then((data) => {
      setUser(data);
      updateUser(data);
      notifications.show({
        title: 'Profile updated',
        message: 'Your profile has been updated successfully.',
        color: 'green',
      });
    });
  };

  if (!user) return <PageSkeleton />;

  return (
    <Paper shadow='xs' withBorder p='xl' className='profile-container-outer'>
      <Group m={20} gap={50} className='profile-container'>
        <div className='profile-picture-container'>
          <img
            src={user.profile_picture ?? '/placeholder-avatar.webp'}
            alt='Profile picture'
            className='profile-picture'
          />
          <ActionIcon
            variant='filled'
            className='profile-editbutton'
            onClick={() => router.push('/settings')}
          >
            <IconEdit />
          </ActionIcon>
        </div>

        <Stack gap={5}>
          <Title order={1} mb={5}>
            {user.username}
          </Title>

          <div className='profile-details'>
            <Text>User ID:</Text>
            <Text className='profile-bold'>{user.user_id}</Text>
            <Text>Email: </Text>
            <Text className='profile-bold'>{user.email}</Text>
            <Text>Verified: </Text>
            {user.verified ? (
              <Badge color='green'>Verified</Badge>
            ) : (
              <Badge color='red'>Not verified</Badge>
            )}
            <Text>Permissions:</Text>
            <div className='profile-permissions'>
              {user.permissions.map((permission) => (
                <Badge key={permission} color='grey'>
                  {permissionsMap[permission]}
                </Badge>
              ))}
            </div>
            <Text>CCA hours: </Text>
            <Text className='profile-bold'>{user.service_hours}</Text>
          </div>
        </Stack>
      </Group>
      <Button onClick={sync} color='blue' variant='outline'>
        Sync Data
      </Button>
    </Paper>
  );
};

export default Overview;
