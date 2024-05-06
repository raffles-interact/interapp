import { Card, Stack } from '@mantine/core';
import { AxiosResponseHeaders } from 'axios';
import { type ReactNode } from 'react';

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

export function ExportsCard({ children }: { children: ReactNode }) {
  return (
    <Card shadow='sm' padding='lg' radius='md' withBorder>
      <Stack gap='sm'>{children}</Stack>
    </Card>
  );
}
