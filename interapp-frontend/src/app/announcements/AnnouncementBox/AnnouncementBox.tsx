import { Card, Text, Badge, Image, Group } from '@mantine/core';

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
  return (
    <Card shadow='sm' padding='md' radius='md' component='a' href='https://google.com'>
      <Card.Section>
        <Image src={imageURL ?? '/placeholder-image.jpg'} height={160} alt='promotional image' />
      </Card.Section>
      <Group justify='space-between' mt='md' mb='xs'>
        <Text fw={500}>{title}</Text>
        {completed ? <Badge color='green'>Completed</Badge> : <Badge color='red'>Unread</Badge>}
      </Group>
      <Text size='sm' c='dimmed' lineClamp={3}>
        {description}
      </Text>
      <Group mt='sm' mb='xs' justify='center' gap={3}>
        <Text size='xs' mt='sm'>
          Posted on:
        </Text>
        <Text size='xs' mt='sm'>
          {date.toLocaleString()}
        </Text>
      </Group>
    </Card>
  );
};

export default AnnouncementBox;
