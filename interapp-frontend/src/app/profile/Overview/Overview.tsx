'use client';
import APIClient from '@api/api_client';
import { useState, useEffect } from 'react';
import { User, UserWithProfilePicture, validateUserType } from '@providers/AuthProvider/types';
import { Permissions } from '../../route_permissions';
import { remapAssetUrl } from '@api/utils';
import { Skeleton, Text, Title, Group, Stack, Badge, ActionIcon, Paper, Button } from '@mantine/core';
import './styles.css';
import { permissionsMap } from '@/app/admin/AdminTable/PermissionsInput/PermissionsInput';
import { IconEdit } from '@tabler/icons-react';
import { notifications } from '@mantine/notifications';
import { useRouter } from 'next/navigation';

const fetchUserDetails = async (username: string) => {
  const apiClient = new APIClient().instance;
  const response = await apiClient.get('/user?username=' + username);

  if (response.status !== 200) throw new Error('Failed to fetch user info');

  const data: UserWithProfilePicture = response.data;

  if (data.profile_picture) data.profile_picture = remapAssetUrl(data.profile_picture);

  const response2 = await apiClient.get('/user/permissions?username=' + username);
  if (response2.status !== 200) throw new Error('Failed to fetch user permissions');

  data.permissions = response2.data[username] satisfies Permissions[];

  if (!validateUserType(data)) throw new Error('Invalid user data');
  return data;
};

interface OverviewProps {
  username: string;
  updateUser: (newUser: User) => void;
}

const Overview = ({ username, updateUser }: OverviewProps) => {
  const router = useRouter();
  const [user, setUser] = useState<UserWithProfilePicture | null>(null);

  useEffect(() => {
    fetchUserDetails(username).then((data) => {
      setUser(data);
    });
  }, []);

  const sync = () => {
    if (!user) return;
    fetchUserDetails(username).then((data) => {
      setUser(data);
      const { profile_picture, ...rest } = data;
      updateUser(rest);
      notifications.show({
        title: 'Profile updated',
        message: 'Your profile has been updated successfully.',
        color: 'green',
      });
    });
  };

  if (!user) return <Skeleton width='100%' height={30} />;

  return (
    <Paper shadow='xs' withBorder p='xl' className='profile-container-outer'>
      <Group m={20} gap={50} className='profile-container'>
        <div className='profile-picture-container'>
          <img
            src={user.profile_picture ?? '/placeholder-avatar.webp'}
            alt='Profile picture'
            className='profile-picture'
          />
          <ActionIcon variant='filled' className='profile-editbutton' onClick={() => router.push('/settings')}>
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
            <Text>Service hours: </Text>
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
