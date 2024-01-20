'use client';
import APIClient from '@api/api_client';
import { AnnouncementWithMeta } from './../types';
import { useState, useEffect, useContext } from 'react';
import { AuthContext } from '@providers/AuthProvider/AuthProvider';
import GoBackButton from '@components/GoBackButton/GoBackButton';
import { remapAssetUrl } from '@api/utils';
import { Skeleton, Title, Text, Group, Stack, ActionIcon, Button } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { IconClock, IconUser, IconPencil, IconTrash } from '@tabler/icons-react';
import CRUDModal from '@components/CRUDModal/CRUDModal';
import AnnouncementAttachment from '@components/AnnouncementAttachment/AnnouncementAttachment';
import { useRouter } from 'next/navigation';
import './styles.css';
import { notifications } from '@mantine/notifications';
import { Permissions } from '@/app/route_permissions';

const handleFetch = async (id: number) => {
  const apiClient = new APIClient().instance;
  const res = await apiClient.get('/announcement', { params: { announcement_id: id } });

  if (res.status === 200) {
    const data: AnnouncementWithMeta = res.data;
    data.announcement_attachments = data.announcement_attachments.map((attachment) => {
      attachment.attachment_loc = remapAssetUrl(attachment.attachment_loc);
      return attachment;
    });
    return data;
  } else if (res.status === 404) {
    return null;
  } else {
    throw new Error('Failed to fetch announcements');
  }
};

const handleRead = async (id: number) => {
  const apiClient = new APIClient().instance;
  const res = await apiClient.patch('/announcement/completion', {
    announcement_id: id,
    completed: true,
  });

  if (res.status !== 204) throw new Error('Failed to update announcement completion status');
};

const handleDelete = async (id: number, handleEnd: () => void) => {
  const apiClient = new APIClient().instance;
  const res = await apiClient.delete('/announcement', { data: { announcement_id: id } });

  if (res.status !== 204) {
    notifications.show({
      title: 'Error',
      message: 'Announcement could not be deleted',
      color: 'red',
    });
    throw new Error('Failed to delete announcement');
  } else
    notifications.show({
      title: 'Success',
      message: 'Announcement deleted',
      color: 'green',
    });
  handleEnd();
};

export default function AnnouncementPage({ params }: Readonly<{ params: { id: string } }>) {
  const { user } = useContext(AuthContext);

  const [data, setData] = useState<AnnouncementWithMeta | null>(null);
  const [loading, setLoading] = useState(true);
  const [opened, { open, close }] = useDisclosure();

  const router = useRouter();

  useEffect(() => {
    setLoading(true);
    handleFetch(parseInt(params.id)).then((res) => setData(res));
    setLoading(false);
  }, [params.id]);

  useEffect(() => {
    if (!data || !user) return;
    const completion = data.announcement_completions.find(
      (completion) => completion.username === user.username,
    );
    if (!completion) return;
    if (completion.completed) return;
    handleRead(data.announcement_id).catch((err) => console.error(err));
  }, [data, user]);

  if (loading) return <Skeleton width='100%' height={30} />;

  return (
    <>
      <GoBackButton href='/announcements' className='announcement-go-back-button' />
      <div className='announcement-page'>
        {data ? (
          <>
            <Group justify='space-between' mb='md' align='center'>
              <Title order={1}>{data.title}</Title>
              <Stack gap={5}>
                <Group align='center' gap={5}>
                  <IconClock className='announcement-meta-icon' />
                  <Text>{new Date(data.creation_date).toLocaleString('en-GB')}</Text>
                </Group>
                <Group align='center' gap={5}>
                  <IconUser className='announcement-meta-icon' />
                  <Text>{data.username}</Text>
                </Group>
                {user?.permissions.includes(Permissions.EXCO) && (
                  <div className='announcement-actions'>
                    <CRUDModal
                      title='Delete Announcement'
                      opened={opened}
                      close={close}
                      open={open}
                      Icon={IconTrash}
                      iconColor='red'
                    >
                      <Text>Are you sure you want to delete this announcement?</Text>
                      <Group justify='center' gap={5} mt='md'>
                        <Button onClick={close} variant='outline'>
                          Cancel
                        </Button>
                        <Button
                          onClick={() =>
                            handleDelete(data.announcement_id, () => {
                              close();
                              router.push('/announcements');
                            })
                          }
                          color='red'
                          variant='outline'
                        >
                          Delete
                        </Button>
                      </Group>
                    </CRUDModal>
                    <ActionIcon
                      color='blue'
                      size={36}
                      onClick={() => router.push(`/announcements/${data.announcement_id}/edit`)}
                    >
                      <IconPencil />
                    </ActionIcon>
                  </div>
                )}
              </Stack>
            </Group>
            <Text dangerouslySetInnerHTML={{ __html: data.description }} />
            <div className='announcement-attachments'>
              {data.announcement_attachments.map((attachment) => (
                <AnnouncementAttachment key={attachment.attachment_loc} attachment={attachment} />
              ))}
            </div>
          </>
        ) : (
          <div>Announcement not found</div>
        )}
      </div>
    </>
  );
}
