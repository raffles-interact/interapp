import { Card, Group, Text } from '@mantine/core';
import { type AnnouncementAttachment } from '@/app/announcements/types';
import { mediaTypes } from '@/app/announcements/utils';
import { IconFile } from '@tabler/icons-react';

const generateIcon = (mime: string) => {
  const type = mediaTypes.find((type) => type.format === mime);
  if (!type) return <IconFile />;
  return type.icon;
};

export default function AnnouncementAttachment({
  attachment,
}: {
  attachment: Readonly<Omit<AnnouncementAttachment, 'announcement_id'>>;
}) {
  return (
    <Card
      padding='md'
      radius='md'
      withBorder
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
}
