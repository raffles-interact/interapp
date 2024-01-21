'use client';
import './styles.css';
import APIClient from '@api/api_client';
import { remapAssetUrl } from '@api/utils';
import { AnnouncementWithMeta } from '@/app/announcements/types';
import { Card, ActionIcon, Text, Title, Image, Skeleton, Stack, SimpleGrid } from '@mantine/core';
import { IconExternalLink, IconClock, IconUser } from '@tabler/icons-react';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';

const handleFetch = async () => {
  const apiClient = new APIClient().instance;
  const res = await apiClient.get('/announcement/all', { params: { page: 1, page_size: 1 } }); // get the very latest announcement

  if (res.status !== 200) throw new Error('Failed to fetch announcements');

  // size is 1 because we only want the latest announcement
  const resData: {
    data: [AnnouncementWithMeta];
    total_entries: 1;
    length_of_page: 1;
  } = res.data;

  const announcement = resData.data[0];
  announcement.announcement_attachments = announcement.announcement_attachments.map(
    (attachment) => {
      attachment.attachment_loc = remapAssetUrl(attachment.attachment_loc);
      return attachment;
    },
  );
  if (announcement.image) announcement.image = remapAssetUrl(announcement.image);
  return announcement;
};

export default function LatestAnnouncement() {
  const router = useRouter();

  const [announcement, setAnnouncement] = useState<AnnouncementWithMeta | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    handleFetch().then((res) => {
      setAnnouncement(res);
      setIsLoading(false);
    });
  }, []);

  if (isLoading || !announcement) {
    return (
      <Card shadow='sm' padding='md' radius='md'>
        <Card.Section>
          <Skeleton height={160} />
        </Card.Section>
        <Card.Section>
          <Skeleton height={40} />
        </Card.Section>
        <Card.Section>
          <Skeleton height={40} />
        </Card.Section>
      </Card>
    );
  }
  return (
    <Card shadow='sm' padding='md' radius='md' className='announcement'>
      <Card.Section>
        <Image
          src={announcement.image ?? '/placeholder-image.jpg'}
          height={160}
          alt='promotional image'
        />
      </Card.Section>
      <Card.Section>
        <Stack gap={5} m='md'>
          <Title order={2} fw={500}>
            {announcement.title}
          </Title>
          <div className='announcement-meta'>
            <IconClock size={20} />
            <Text size='xs' c='dimmed'>
              {new Date(announcement.creation_date).toLocaleString('en-GB')}
            </Text>
            <IconUser size={20} />
            <Text size='xs' c='dimmed'>
              {announcement.username}
            </Text>
          </div>

          <Text
            size='sm'
            lineClamp={4}
            dangerouslySetInnerHTML={{ __html: announcement.description }}
          />
        </Stack>
      </Card.Section>
      <ActionIcon
        color='blue'
        size={36}
        variant='outline'
        onClick={() => router.push(`/announcements/${announcement.announcement_id}`)}
        className='announcement-link'
      >
        <IconExternalLink />
      </ActionIcon>
    </Card>
  );
}
