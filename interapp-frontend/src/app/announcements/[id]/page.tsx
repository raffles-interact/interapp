'use client';
import APIClient from '@api/api_client';
import { AnnouncementWithMeta } from './../types';
import { useState, useEffect, useContext } from 'react';
import { AuthContext } from '@providers/AuthProvider/AuthProvider';
import GoBackButton from '@components/GoBackButton/GoBackButton';
import { remapAssetUrl } from '@api/utils';
import { Skeleton, Title, Text, Group } from '@mantine/core';
import { IconClock } from '@tabler/icons-react';
import AnnouncementAttachment from '@components/AnnouncementAttachment/AnnouncementAttachment';
import './styles.css';

const handleFetch = async (id: number) => {
  const apiClient = new APIClient().instance;
  const res = await apiClient.get('/announcement', { params: { announcement_id: id } });

  if (res.status === 200) {
    const data: AnnouncementWithMeta = res.data;
    data.announcement_attachments = data.announcement_attachments.map((attachment) => {
      attachment.attachment_loc = remapAssetUrl(attachment.attachment_loc);
      return attachment;
    });
    return data as AnnouncementWithMeta;
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

  if (res.status !== 200) throw new Error('Failed to update announcement completion status');
};

export default function AnnouncementPage({ params }: { params: { id: string } }) {
  const { user } = useContext(AuthContext);

  const [data, setData] = useState<AnnouncementWithMeta | null>(null);
  const [loading, setLoading] = useState(true);
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
              <Group align='center' gap={5}>
                <IconClock className='announcement-clock-icon' />
                <Text>{new Date(data.creation_date).toLocaleString()}</Text>
              </Group>
            </Group>
            <Text dangerouslySetInnerHTML={{ __html: data.description }} />
            <div className='announcement-attachments'>
              {data.announcement_attachments.map((attachment, idx) => (
                <AnnouncementAttachment key={idx} attachment={attachment} />
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
