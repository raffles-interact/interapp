'use client';
import { useForm } from '@mantine/form';
import { TagsInput, Checkbox, Button } from '@mantine/core';
import { DatePickerInput } from '@mantine/dates';
import { notifications } from '@mantine/notifications';
import { APIClient } from '@api/api_client';
import { Service } from '@/app/services/types';
import { use, useMemo, useState } from 'react';
import { parseServerError } from '@utils/.';
import { ExportsCard, downloadFile, type DownloadFileHeaders } from '../ExportsCard/ExportsCard';

type AttendanceExportsProps = {
  names: string[];
  range: [Date | null, Date | null];
};

interface AttendanceExportsFormProps {
  allServices: Promise<Pick<Service, 'name' | 'service_id'>[]>;
}

export function AttendanceExportsForm({ allServices }: AttendanceExportsFormProps) {
  const [enabledDateSelection, setEnabledDateSelection] = useState(false);
  const [loading, setLoading] = useState(false);
  const services = use(allServices);

  const serviceData = useMemo(
    () =>
      services.reduce(
        (acc, service) => {
          acc[service.name] = service.service_id;
          return acc;
        },
        {} as Record<string, number>,
      ),
    [services],
  );

  const form = useForm<AttendanceExportsProps>({
    initialValues: {
      names: [],
      range: [null, null],
    },
    validate: {
      names: (value) => {
        if (value.length === 0) {
          return 'At least one service should be selected';
        }

        return null;
      },
      range: (value) => {
        if (enabledDateSelection && value[0] === null && value[1] === null) {
          return 'Date range is required';
        }

        if (enabledDateSelection && value[0] === null) {
          return 'Start date is required';
        }

        if (enabledDateSelection && value[1] === null) {
          return 'End date is required';
        }

        if (enabledDateSelection && value[0] && value[1] && value[0] > value[1]) {
          return 'Start date should be before end date';
        }

        return null;
      },
    },
  });

  const handleSubmit = async (values: AttendanceExportsProps) => {
    const transformedValues = {
      id: values.names.map((name) => serviceData[name]),
      start_date: values.range[0]?.toISOString(),
      end_date: values.range[1]?.toISOString(),
    };

    const apiClient = new APIClient().instance;
    setLoading(true);
    const response = await apiClient.get('/exports', {
      params: transformedValues,
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
    <ExportsCard>
      <form onSubmit={form.onSubmit(handleSubmit)} className='exports-form'>
        <TagsInput
          label='Services'
          placeholder='Select services to export'
          data={Object.keys(serviceData)}
          {...form.getInputProps('names')}
        />

        <Checkbox
          label='Select date range'
          checked={enabledDateSelection}
          onChange={() => {
            form.setValues({ range: [null, null] });
            setEnabledDateSelection(!enabledDateSelection);
          }}
        />
        {enabledDateSelection && (
          <DatePickerInput
            type='range'
            placeholder='Choose a date range...'
            {...form.getInputProps('range')}
          />
        )}

        <Button type='submit' variant='outline' color='green' loading={loading}>
          Export Data
        </Button>
      </form>
    </ExportsCard>
  );
}
