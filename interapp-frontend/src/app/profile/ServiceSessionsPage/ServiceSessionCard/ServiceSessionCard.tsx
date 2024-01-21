import { Card, Text, Badge, Button, Group, Image, Grid } from '@mantine/core';
import Link from 'next/link';
import { memo } from 'react';

interface ServiceSessionCardProps {
  start_time: string;
  end_time: string;
  name: string;
  promotional_image?: string | null;
  service_session_id: number;

  ad_hoc: boolean;
  attended: 'Absent' | 'Attended' | 'Valid Reason';
  is_ic: boolean;
}

const generateAttendedBadge = (attended: 'Absent' | 'Attended' | 'Valid Reason') => {
  switch (attended) {
    case 'Absent':
      return <Badge color='red'>Absent</Badge>;
    case 'Attended':
      return <Badge color='green'>Attended</Badge>;
    case 'Valid Reason':
      return <Badge color='yellow'>Valid Reason</Badge>;
  }
};

const generateTimeInterval = (start_time: string, end_time: string) => {
  const start = new Date(start_time);
  const end = new Date(end_time);
  return `${start.toLocaleString('en-GB')} - ${end.toLocaleString('en-GB')}`;
};

const generateBoolean = (value: boolean) => {
  return value ? <Text color='green'>Yes</Text> : <Text color='red'>No</Text>;
};

const ServiceSessionCard = ({
  start_time,
  end_time,
  name,
  promotional_image,
  service_session_id,
  ad_hoc,
  attended,
  is_ic,
}: ServiceSessionCardProps) => {
  return (
    <Card shadow='sm' padding='md' radius='md'>
      <Card.Section>
        <Image
          src={promotional_image ?? '/placeholder-image.jpg'}
          height={160}
          alt='promotional image'
          fit='contain'
        />
      </Card.Section>
      <Group justify='space-between' mt='md' mb='xs'>
        <Text fw={500}>{name}</Text>
        {generateAttendedBadge(attended)}
      </Group>

      <Text size='sm' c='dimmed' mb={10}>
        {generateTimeInterval(start_time, end_time)}
      </Text>
      <Grid>
        <Grid.Col span={6}>Session ID</Grid.Col>
        <Grid.Col span={6}>{service_session_id}</Grid.Col>
        <Grid.Col span={6}>In charge?</Grid.Col>
        <Grid.Col span={6}>{generateBoolean(is_ic)}</Grid.Col>
        <Grid.Col span={6}>Ad hoc?</Grid.Col>
        <Grid.Col span={6}>{generateBoolean(ad_hoc)}</Grid.Col>
      </Grid>
      <Link
        href={{
          pathname: '/attendance/absence',
          query: { id: service_session_id },
        }}
        style={{ textDecoration: 'none' }}
      >
        <Button color='blue' fullWidth mt='md' radius='md' variant='outline'>
          Request for absence
        </Button>
      </Link>
    </Card>
  );
};

export default memo(ServiceSessionCard);
