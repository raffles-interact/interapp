import { Card, Stack, Title, Text } from '@mantine/core';
import { AxiosResponseHeaders, AxiosResponse } from 'axios';
import { parseServerError } from '@utils/parseServerError';
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

export const generateErrorFromResponse = (response: AxiosResponse) => {
  switch (response.status) {
    case 200:
      break;
    case 400:
      return {
        title: 'Error',
        message: parseServerError(response.data),
        color: 'red',
      };
    case 401:
      return {
        title: 'Error',
        message: 'Unauthorized',
        color: 'red',
      };
    case 403:
      return {
        title: 'Error',
        message: 'Forbidden',
        color: 'red',
      };
    case 404:
      return {
        title: 'Error',
        message: 'Sessions between the selected dates are not found',
        color: 'red',
      };
    default:
      return {
        title: 'Error',
        message: 'Unknown error',
        color: 'red',
      };
  }
};

interface ExportsCardProps {
  children: ReactNode;
  title: string;
  description: string;
}

export function ExportsCard({ children, title, description }: Readonly<ExportsCardProps>) {
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
