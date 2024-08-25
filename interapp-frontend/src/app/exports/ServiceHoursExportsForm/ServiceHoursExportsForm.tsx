'use client';
import {
  ExportsCard,
  downloadFile,
  generateErrorFromResponse,
  type DownloadFileHeaders,
} from '../ExportsCard/ExportsCard';
import { Select, Button, Group } from '@mantine/core';
import { APIClient } from '@api/api_client';
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

    const error = generateErrorFromResponse(response);
    if (error) {
      notifications.show(error);
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
    <ExportsCard
      title='Export Service Hours'
      description='Export a list of service hours of each user, sorted by the filters below.'
    >
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
