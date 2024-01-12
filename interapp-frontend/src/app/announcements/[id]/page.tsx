'use client';
import APIClient from '@api/api_client';
import { AnnouncementWithMeta } from './../types';
import { useState, useEffect } from 'react';
import GoBackButton from '@components/GoBackButton/GoBackButton';
import { remapAssetUrl } from '@api/utils';
import { Skeleton, Title, Text, Group, Card } from '@mantine/core';
import Link from 'next/link';
import { mediaTypes } from '../utils';
import { IconFile } from '@tabler/icons-react';
import './styles.css';

const generateIcon = (mime: string) => {
  const type = mediaTypes.find((type) => type.format === mime);
  if (!type) return <IconFile />;
  return type.icon;
};

const handleFetch = async (id: number) => {
  const apiClient = new APIClient().instance;
  const res = await apiClient.get('/announcement', { params: { announcement_id: id } });

  if (res.status === 200) {
    const data: AnnouncementWithMeta = res.data;
    data.announcement_attachments = data.announcement_attachments.map((attachment) => {
      attachment.attachment_loc = remapAssetUrl(attachment.attachment_loc);
      return attachment;
    });
    return res.data as AnnouncementWithMeta;
  } else if (res.status === 404) {
    return null;
  } else {
    throw new Error('Failed to fetch announcements');
  }
};
export default function AnnouncementPage({ params }: { params: { id: string } }) {
  const [data, setData] = useState<AnnouncementWithMeta | null>(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    setLoading(true);
    handleFetch(parseInt(params.id)).then((res) => setData(res));
    setLoading(false);
  }, [params.id]);

  if (loading) return <Skeleton width='100%' height={30} />;

  return (
    <div>
      <GoBackButton href='/announcements' />
      {data ? (
        <>
          <Title order={1}>{data.title}</Title>
          <Text>{data.description}</Text>
          {data.announcement_attachments.map((attachment, idx) => {
            return (
              <Card
                padding='md'
                radius='md'
                withBorder
                key={idx}
                component='a'
                href={attachment.attachment_loc}
                target='_blank'
              >
                <Group align='center' className='announcement-attachment-link'>
                  {generateIcon(attachment.attachment_mime)}
                  <Text>{attachment.attachment_name}</Text>
                </Group>
              </Card>
            );
          })}
        </>
      ) : (
        <div>Announcement not found</div>
      )}
    </div>
  );
}
