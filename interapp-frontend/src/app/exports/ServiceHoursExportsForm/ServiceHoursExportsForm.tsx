'use client';
import { ExportsCard, downloadFile, type DownloadFileHeaders } from '../ExportsCard/ExportsCard';
import { Select, Button, Group } from '@mantine/core';
import { APIClient } from '@api/api_client';
import { parseServerError } from '@utils/parseServerError';
import { useForm } from '@mantine/form';
import { AxiosInstance } from 'axios';
import { notifications } from '@mantine/notifications';
import { useState } from 'react';

interface ServiceExportsProps {
  type: 'user_id' | 'username' | 'service_hours';
  order: 'ASC' | 'DESC';
}

interface UserFriendlyServiceExportsProps {
  type: (typeof types)[number];
  order: (typeof orders)[number];
}

const types = ['User ID', 'Username', 'CCA Hours'] as const;
const orders = ['Ascending', 'Descending'] as const;

const test = async (apiClient: AxiosInstance) => {
  const response = await apiClient.get('/exports/service_hours', {
    params: {
      type: 'username',
      order: 'ASC',
    },
    responseType: 'arraybuffer',
  });
  console.log(response.data);
  const responseData = response.data as ArrayBuffer;
  const blob = new Blob([responseData], { type: response.headers['content-type'] });

  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = response.headers['content-disposition'].split('=')[1];
  a.click();
  a.remove();

  URL.revokeObjectURL(url);
  console.log(a.href);
};

const normaliseServiceExportsProps = (
  props: UserFriendlyServiceExportsProps,
): ServiceExportsProps => {
  let type: ServiceExportsProps['type'];
  let order: ServiceExportsProps['order'];

  switch (props.type) {
    case 'User ID':
      type = 'user_id';
      break;
    case 'Username':
      type = 'username';
      break;
    case 'CCA Hours':
      type = 'service_hours';
      break;
  }

  switch (props.order) {
    case 'Ascending':
      order = 'ASC';
      break;
    case 'Descending':
      order = 'DESC';
      break;
  }

  return { type, order };
};

const initialType = types[0];
const initialOrder = orders[0];

export function ServiceHoursExportsForm() {
  const [loading, setLoading] = useState(false);
  const form = useForm<UserFriendlyServiceExportsProps>({
    initialValues: {
      type: initialType,
      order: initialOrder,
    },
  });

  const handleSubmit = async (values: UserFriendlyServiceExportsProps) => {
    const transformed = normaliseServiceExportsProps(values);
    const apiClient = new APIClient().instance;
    setLoading(true);
    const response = await apiClient.get('/exports/service_hours', {
      params: transformed,
      responseType: 'arraybuffer',
    });
    setLoading(false);

    switch (response.status) {
      case 200:
        break;
      case 400:
        notifications.show({
          title: 'Error',
          message: parseServerError(response.data),
          color: 'red',
        });
        return;
      case 401:
        notifications.show({
          title: 'Error',
          message: 'Unauthorized',
          color: 'red',
        });
        return;
      case 403:
        notifications.show({
          title: 'Error',
          message: 'Forbidden',
          color: 'red',
        });
        return;
      case 404:
        notifications.show({
          title: 'Error',
          message: 'Sessions between the selected dates are not found',
          color: 'red',
        });
        return;
      default:
        notifications.show({
          title: 'Error',
          message: 'Unknown error',
          color: 'red',
        });
        return;
    }

    downloadFile(response.data as ArrayBuffer, response.headers as DownloadFileHeaders);

    notifications.show({
      title: 'Success',
      message: 'Export has been created',
      color: 'green',
    });
  };

  return (
    <ExportsCard title='Export Service Hours' description='Export a list of service hours of each user, sorted by the filters below.'>
      <form onSubmit={form.onSubmit(handleSubmit)} className='exports-form'>
        
        <Group justify='center' grow>
          <Select
            label='Type'
            defaultValue={initialType}
            data={types}
            allowDeselect={false}
            placeholder='Select type'
            {...form.getInputProps('type')}
          />
          <Select
            label='Order'
            defaultValue={initialOrder}
            data={orders}
            allowDeselect={false}
            placeholder='Select order'
            {...form.getInputProps('order')}
          />
        </Group>
        <Button type='submit' variant='outline' color='green' loading={loading}>
          Export
        </Button>
      </form>
    </ExportsCard>
  );
}
