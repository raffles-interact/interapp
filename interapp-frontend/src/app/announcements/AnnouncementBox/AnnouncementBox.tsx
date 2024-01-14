import { Card, Text, Badge, Image, Group } from '@mantine/core';
import { useRef } from 'react';
import Link from 'next/link';
import './styles.css';

interface AnnouncementBoxProps {
  id: number;
  title: string;
  description: string;
  date: Date;
  imageURL?: string | null;
  completed: boolean;
}

const AnnouncementBox = ({
  id,
  title,
  description,
  date,
  imageURL,
  completed,
}: AnnouncementBoxProps) => {
  const linkRef = useRef<HTMLAnchorElement>(null);
  return (
    <Card
      shadow='sm'
      padding='md'
      radius='md'
      onClick={() => linkRef.current?.click()}
      className='announcement-box'
    >
      <Card.Section>
        <Image src={imageURL ?? '/placeholder-image.jpg'} height={160} alt='promotional image' />
      </Card.Section>
      <Group justify='space-between' mt='md' mb='xs'>
        <Text fw={500}>{title}</Text>
        {completed ? <Badge color='green'>Completed</Badge> : <Badge color='red'>Unread</Badge>}
      </Group>
      <Text size='sm' c='dimmed' lineClamp={3} dangerouslySetInnerHTML={{ __html: description }} />

      <Group mt='sm' mb='xs' justify='center' gap={3}>
        <Text size='xs' mt='sm'>
          Posted on:
        </Text>
        <Text size='xs' mt='sm'>
          {date.toLocaleString()}
        </Text>
      </Group>
      <Link href={`/announcements/${id}`} hidden ref={linkRef} />
    </Card>
  );
};

export default AnnouncementBox;
