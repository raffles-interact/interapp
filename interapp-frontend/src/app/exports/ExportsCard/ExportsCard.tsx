import { Card, Stack, Title, Text } from '@mantine/core';
import { AxiosResponseHeaders } from 'axios';
import { type ReactNode } from 'react';
import './styles.css';

export interface DownloadFileHeaders extends AxiosResponseHeaders {
  'content-type': string;
  'content-disposition': string;
}

export function downloadFile(data: ArrayBuffer, headers: DownloadFileHeaders) {
  const blob = new Blob([data], { type: headers['content-type'] });

  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = headers['content-disposition'].split('=')[1];
  a.click();
  a.remove();

  URL.revokeObjectURL(url);
}

interface ExportsCardProps {
  children: ReactNode;
  title: string;
  description: string;
}

export function ExportsCard({ children, title, description }: ExportsCardProps) {
  return (
    <Card shadow='sm' padding='lg' radius='md' withBorder className='exports-card'>
      <Stack gap='sm'>
        <Title order={4}>{title}</Title>
        <Text size='sm'>{description}</Text>

        {children}
      </Stack>
    </Card>
  );
}
