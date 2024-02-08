'use client';

import CRUDModal from '@components/CRUDModal/CRUDModal';
import APIClient from '@api/api_client';
import { Service } from '../types';
import { useDisclosure } from '@mantine/hooks';
import { useForm } from '@mantine/form';
import { TextInput, Textarea, NumberInput, Button, Group, Checkbox } from '@mantine/core';
import SearchableSelect from '@components/SearchableSelect/SearchableSelect';
import { daysOfWeek } from '../ServiceBox/ServiceBox';
import { type Nullable } from '@api/utils';
import { TimeInput } from '@mantine/dates';
import { useState, useContext, memo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import UploadImage, { convertToBase64, allowedFormats } from '@components/UploadImage/UploadImage';
import { IconPencil } from '@tabler/icons-react';
import { Permissions } from '@/app/route_permissions';
import { AuthContext } from '@providers/AuthProvider/AuthProvider';
import './styles.css';
import { notifications } from '@mantine/notifications';

const parsePromotionalImage = async (promotional_image: string | null | undefined) => {
  if (!promotional_image) return '';
  if (promotional_image.startsWith('http'))
    return await convertToBase64(new URL(promotional_image));
  return promotional_image;
};

const calculateInterval = (start: string, end: string) => {
  if (!start || !end) return 0;
  const [startHours, startMinutes] = start.split(':').map((x) => parseInt(x));
  const [endHours, endMinutes] = end.split(':').map((x) => parseInt(x));

  const diff =
    new Date().setHours(endHours, endMinutes).valueOf() -
    new Date().setHours(startHours, startMinutes).valueOf();
  const diffToHours = Math.round(diff / 1000 / 60 / 60);

  return diffToHours < 0 ? 0 : diffToHours;
};

const EditService = ({
  service_id,
  name,
  description,
  promotional_image,
  contact_email,
  contact_number,
  website,
  start_time,
  end_time,
  day_of_week,
  enable_scheduled,
  service_hours,
}: Omit<Service, 'service_ic_username'>) => {
  const apiClient = new APIClient().instance;
  const { user } = useContext(AuthContext);
  const [opened, { open, close }] = useDisclosure();
  const [loading, setLoading] = useState(false);

  const [promotionalImgBase64, setPromotionalImgBase64] = useState<string>();
  useEffect(() => {
    if (!opened) return;
    parsePromotionalImage(promotional_image).then((base64) => {
      setPromotionalImgBase64(base64);
      form.setFieldValue('promotional_image', base64);
    });
  }, [opened]);

  const router = useRouter();

  const initial = {
    name,
    description: description ?? '',
    promotional_image: promotionalImgBase64 ?? '',
    contact_email,
    contact_number: contact_number ?? undefined,
    website: website ?? '',
    start_time,
    end_time,
    day_of_week,
    enable_scheduled,
    service_hours,
  };

  const form = useForm({
    initialValues: initial,
    validate: {
      name: (value) => value.trim().length <= 2 && 'Name must be longer than 2 characters',
      contact_email: (value) => !value.includes('@') && 'Invalid email',
      contact_number: (value) => {
        if (!value) return false;
        return value.toString().length !== 8 && 'Invalid phone number';
      },
      end_time: (value, values) =>
        value <= values.start_time && 'End time must be after start time',
    },
  });

  const handleSubmit = async (data: Omit<Service, 'service_ic_username' | 'service_id'>) => {
    setLoading(true);

    const optionalFields: (keyof typeof data)[] = [
      'description',
      'contact_number',
      'website',
      'promotional_image',
    ];

    for (const field of optionalFields) {
      if (!data[field]) delete data[field];
    }
    const res = await apiClient.patch('/service', { ...data, service_id });
    if (res.status !== 200) {
      notifications.show({
        title: 'Error',
        message: JSON.stringify(res.data),
        color: 'red',
      });
      setLoading(false);
      return;
    }
    notifications.show({
      title: 'Success',
      message: 'Service updated successfully',
      color: 'green',
    });

    setLoading(false);
    router.refresh();
    close();
  };

  return (
    <CRUDModal
      opened={opened}
      open={open}
      close={close}
      title='Edit Service'
      Icon={IconPencil}
      show={() => !!user && user.permissions.includes(Permissions.EXCO)}
    >
      <form onSubmit={form.onSubmit(handleSubmit)}>
        <div className='edit-service'>
          <UploadImage
            onChange={async (_, file) => {
              if (file) form.setFieldValue('promotional_image', await convertToBase64(file));
              else form.setFieldValue('promotional_image', '');
            }}
            accept={allowedFormats}
            className='edit-service-file-display'
            defaultImageURL={promotional_image}
          />
          <TextInput label='Service Name' required {...form.getInputProps('name')} />
          <Textarea label='Description' {...form.getInputProps('description')} />
          <TextInput label='Contact Email' required {...form.getInputProps('contact_email')} />
          <NumberInput label='Contact Number' {...form.getInputProps('contact_number')} />
          <TextInput label='Website' {...form.getInputProps('website')} />
          <SearchableSelect
            defaultValue={'Sun'}
            allValues={daysOfWeek}
            onChange={(day_of_week) =>
              form.setFieldValue(
                'day_of_week',
                daysOfWeek.indexOf(day_of_week) as 0 | 1 | 2 | 3 | 4 | 5 | 6,
              )
            }
            label='Day of Week'
            required
          />
          <div className='edit-service-times'>
            <TimeInput label='Start Time' required {...form.getInputProps('start_time')} />
            <TimeInput label='End Time' required {...form.getInputProps('end_time')} />
          </div>
          <Group className='add-service-service-hours'>
            <NumberInput
              label='Service Hours'
              {...form.getInputProps('service_hours')}
              required
              min={0}
              step={1}
            />
            <Button
              onClick={() =>
                form.setFieldValue(
                  'service_hours',
                  calculateInterval(form.values.start_time, form.values.end_time),
                )
              }
              variant='outline'
            >
              Calculate Hours
            </Button>
          </Group>
          <Group w='100%' justify='center'>
            <Checkbox
              {...form.getInputProps('enable_scheduled', { type: 'checkbox' })}
              label='Enable Scheduled'
            />
          </Group>

          <Group gap={3} justify='center'>
            <Button onClick={close} variant='outline' color='red'>
              Cancel
            </Button>
            <Button type='submit' variant='outline' color='green' loading={loading}>
              Submit
            </Button>
          </Group>
        </div>
      </form>
    </CRUDModal>
  );
};

export default memo(EditService);
