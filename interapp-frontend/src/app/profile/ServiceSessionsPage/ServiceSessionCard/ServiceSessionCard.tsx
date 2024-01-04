
import { Card, Text, Badge, Button, Group } from '@mantine/core';
import { memo, useEffect, useState } from 'react';

interface ServiceSessionCardProps {
  start_time: string;
  end_time: string;
  name: string;
  promotional_image?: string | null;
  service_session_id: number;

  ad_hoc: boolean;
  attended: string;
  is_ic: boolean;
}

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
      <Text>{name}</Text>
      <Text>{start_time}</Text>
      <Text>{end_time}</Text>
      <Text>{attended}</Text>
      <Text>{is_ic}</Text>
      <Text>{ad_hoc}</Text>
      <Text>{service_session_id}</Text>
      <Text>{promotional_image}</Text>

      
    </Card>
  );
};

export default memo(ServiceSessionCard);