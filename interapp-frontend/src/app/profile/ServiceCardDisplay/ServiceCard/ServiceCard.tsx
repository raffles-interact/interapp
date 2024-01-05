import { FetchServicesResponse } from '../ServiceCardDisplay';
import { Card, Text, Badge, Stack, Image, Grid, Group } from '@mantine/core';
import { memo } from 'react';
import { daysOfWeek, roundTimeToMinutes } from '@/app/services/ServiceBox/ServiceBox';
import { IconCalendar, IconClock } from '@tabler/icons-react';

export type ParticipantType = 'IC' | 'Participant' | null;

interface ServiceCardProps {
  participantType: ParticipantType;
  service: FetchServicesResponse[number];
  children: React.ReactNode;
}

const ServiceCard = ({ participantType, service, children }: ServiceCardProps) => {
  return (
    <Card shadow='sm' padding='md' radius='md'>
      <Card.Section withBorder>
        <Image
          src={service.promotional_image ?? '/placeholder-image.jpg'}
          height={160}
          alt='promotional image'
          fit='contain'
        />
      </Card.Section>
      <Stack align='center' justify='center' m={10} gap={20}>
        <Group justify='center'>
          <Text fw={500}>{service.name}</Text>
          {participantType === 'IC' ? (
            <Badge color='red'>IC</Badge>
          ) : participantType === 'Participant' ? (
            <Badge color='blue'>Participant</Badge>
          ) : null}
        </Group>
        <Text size='sm' c='dimmed'>
          {service.description ?? 'No description provided :('}
        </Text>
        <Grid w='100%'>
          <Grid.Col span={1}>
            <IconCalendar size={20} />
          </Grid.Col>
          <Grid.Col span={4}>
            <Text>{daysOfWeek[service.day_of_week]}</Text>
          </Grid.Col>
          <Grid.Col span={1}>
            <IconClock size={20} />
          </Grid.Col>
          <Grid.Col span={6}>
            <Text>
              {roundTimeToMinutes(service.start_time) +
                ' - ' +
                roundTimeToMinutes(service.end_time)}
            </Text>
          </Grid.Col>
        </Grid>
        {children}
      </Stack>
    </Card>
  );
};

export default memo(ServiceCard);
