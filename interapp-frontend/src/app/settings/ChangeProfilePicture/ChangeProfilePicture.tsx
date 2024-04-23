'use client';
import './styles.css';
import UploadImage, { convertToBase64, allowedFormats } from '@components/UploadImage/UploadImage';
import APIClient from '@api/api_client';
import { remapAssetUrl } from '@utils/.';
import { useContext, useState, useEffect, memo } from 'react';
import { AuthContext } from '@providers/AuthProvider/AuthProvider';
import { User } from '@providers/AuthProvider/types';
import { notifications } from '@mantine/notifications';
import { Group, Title, Text } from '@mantine/core';

const fetchUserProfilePicture = async (username: string) => {
  const apiClient = new APIClient().instance;
  const response = await apiClient.get('/user?username=' + username);
  if (response.status !== 200) throw new Error('Failed to fetch profile picture');

  const data: User = response.data;
  if (data.profile_picture) data.profile_picture = remapAssetUrl(data.profile_picture);
  return data.profile_picture;
};

const ChangeProfilePicture = () => {
  const apiClient = new APIClient().instance;
  const { user, loading, updateUser } = useContext(AuthContext);
  const username = user?.username ?? '';
  const [imageURL, setImageURL] = useState<string | null>(null);

  useEffect(() => {
    if (loading) return;
    fetchUserProfilePicture(username).then((data) => {
      setImageURL(data);
    });
  }, [loading]);

  if (loading || !user) return null;

  const handleUpdate = (imageURL: string, file: File | null) => {
    if (file === null) {
      apiClient.delete('/user/profile_picture').then((response) => {
        if (response.status !== 204) {
          notifications.show({
            title: 'Failed to delete profile picture',
            message: 'Please try again later.',
            color: 'red',
          });
        } else {
          updateUser({ ...user, profile_picture: null });
          notifications.show({
            title: 'Profile picture deleted',
            message: 'Your profile picture has been deleted.',
            color: 'green',
          });
          setImageURL(null);
        }
      });
    } else {
      convertToBase64(file)
        .then((base64) => {
          apiClient.patch('/user/profile_picture', { profile_picture: base64 }).then((response) => {
            const url = (response.data as { url: string }).url;
            const mappedURL = url ? remapAssetUrl(url) : null;

            if (response.status !== 200) {
              notifications.show({
                title: 'Failed to update profile picture',
                message: 'Please try again later.',
                color: 'red',
              });
            } else {
              updateUser({ ...user, profile_picture: mappedURL });
              notifications.show({
                title: 'Profile picture updated',
                message: 'Your profile picture has been updated.',
                color: 'green',
              });
              setImageURL(imageURL ?? null);
            }
          });
        })
        .catch((error) => {
          notifications.show({
            title: 'Failed to update profile picture',
            message: 'Please try again later. Error: ' + error.message,
            color: 'red',
          });
        });
    }
  };

  return (
    <Group gap={20}>
      <UploadImage
        onChange={handleUpdate}
        accept={allowedFormats}
        defaultImageURL={imageURL}
        className='change-profile-picture'
      />
      <div>
        <Title order={3}>{user?.username}</Title>
        <Text>{user?.email}</Text>
      </div>
    </Group>
  );
};

export default memo(ChangeProfilePicture);
