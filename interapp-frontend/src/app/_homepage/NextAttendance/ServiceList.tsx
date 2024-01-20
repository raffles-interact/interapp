import { Text, Title } from '@mantine/core';
import './styles.css';

export default function ServiceList(props: any) {
  const temp_services = ['Service 1: Information', 'Service 2: A lot of information'];
  return (
    <div className='service-list-container'>
      <Title>Service(s):</Title>
      {temp_services.map((service) => (
        <Text key={service} className='service'>
          {service}
        </Text>
      ))}
    </div>
  );
}
