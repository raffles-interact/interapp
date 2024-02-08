'use client';
import { useDisclosure } from '@mantine/hooks';
import { useForm } from '@mantine/form';
import { Button, Group, Checkbox, Select, NumberInput } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { DateTimePicker } from '@mantine/dates';
import ServiceSessionUserInput from '../ServiceSessionUserInput/ServiceSessionUserInput';
import { AuthContext } from '@providers/AuthProvider/AuthProvider';
import { memo, useContext, useEffect, useState } from 'react';
import APIClient from '@api/api_client';
import { Permissions } from '@/app/route_permissions';
import CRUDModal from '@components/CRUDModal/CRUDModal';
import { getAllUsernames, parseErrorMessage } from '@api/utils';
import { ServiceSessionUser } from '../../types';
import { IconPlus } from '@tabler/icons-react';
import { Service } from '@/app/services/types';
import './styles.css';

export interface AddActionProps {
  refreshData: () => void;
}

const getAllServices = async () => {
  const apiClient = new APIClient().instance;
  const response = await apiClient.get('/service/all');
  if (response.status !== 200) throw new Error('Could not fetch services');
  const services: Service[] = response.data;
  return services.map((service) => ({ service_id: service.service_id, name: service.name }));
};

const generateDefaultStartAndEndTimes = () => {
  const start = new Date();
  start.setHours(start.getHours() + 1);
  const end = new Date(start);
  end.setHours(end.getHours() + 1);
  return [start, end] as const;
};

const calculateInterval = (start: Date, end: Date) => {
  const diff = end.getTime() - start.getTime();
  const diffHours = diff / 1000 / 60 / 60;
  const rounded = Math.floor(diffHours);
  return rounded < 0 ? 0 : rounded;
};

function AddAction({ refreshData }: Readonly<AddActionProps>) {
  const apiClient = new APIClient().instance;
  const [opened, { open, close }] = useDisclosure(false);
  const [loading, setLoading] = useState(false);
  const [allUsernames, setAllUsernames] = useState<string[]>([]);
  const [allServices, setAllServices] = useState<{ service_id: number; name: string }[]>([]);

  const [disableSelectAdHoc, setDisableSelectAdHoc] = useState<boolean>(false);
  const { user } = useContext(AuthContext);

  const [defaultStartDate, defaultEndDate] = generateDefaultStartAndEndTimes();
  const form = useForm({
    initialValues: {
      service_name: undefined as string | undefined,
      start_time: defaultStartDate,
      end_time: defaultEndDate,
      ad_hoc_enabled: false,
      attendees: [] as ServiceSessionUser[],
      service_hours: 1,
    },
    validate: {
      end_time: (value, values) =>
        value < values.start_time ? 'End time must be after start time' : null,
      service_name: (value) => (!value ? 'Service must be selected' : null),
    },
  });

  const handleSubmit = async (values: typeof form.values) => {
    setLoading(true);

    const body = {
      service_id: allServices.find((service) => service.name === values.service_name)?.service_id,
      start_time: values.start_time.toISOString(),
      end_time: values.end_time.toISOString(),
      ad_hoc_enabled: values.ad_hoc_enabled,
      service_hours: values.service_hours,
    };

    const res = await apiClient.post('/service/session', body);
    if (res.status !== 200) {
      notifications.show({
        title: 'Error',
        message: parseErrorMessage(res.data),
        color: 'red',
      });
      setLoading(false);

      return;
    }
    const id: number = res.data.service_session_id;

    if (values.attendees.length > 0) {
      const body = {
        service_session_id: id,
        users: values.attendees.map((user) => ({
          username: user.username,
          attended: user.attended,
          is_ic: user.is_ic,
          ad_hoc: user.ad_hoc,
        })),
      };
      const res = await apiClient.post('/service/session_user_bulk', body);
      if (res.status !== 201) {
        notifications.show({
          title: 'Error',
          message: 'Could not add service session users',
          color: 'red',
        });
        refreshData();
        setLoading(false);

        return;
      }
    }

    notifications.show({
      title: 'Success',
      message: `Service session added successfully. (id: ${id})`,
      color: 'green',
    });

    refreshData();

    close();
    setLoading(false);
    form.reset();
  };

  useEffect(() => {
    const hasAdHocUser = form.values.attendees.some((user) => user.ad_hoc);

    setDisableSelectAdHoc(hasAdHocUser);
    if (hasAdHocUser && !form.values.ad_hoc_enabled) form.setFieldValue('ad_hoc_enabled', true);
  }, [form.values.attendees]);

  useEffect(() => {
    if (opened) getAllUsernames().then((allUsersNames) => setAllUsernames(allUsersNames));
    getAllServices().then((allServices) => setAllServices(allServices));
  }, [opened]);

  return (
    <CRUDModal
      opened={opened}
      open={open}
      close={close}
      Icon={IconPlus}
      iconColor='green'
      title='Add Service Session'
      show={() =>
        !!user &&
        (user.permissions.includes(Permissions.SERVICE_IC) ||
          user.permissions.includes(Permissions.MENTORSHIP_IC))
      }
    >
      <form onSubmit={form.onSubmit(handleSubmit)} className='add-modal-form'>
        <Select
          className='add-modal-form-service'
          data={allServices.map((service) => service.name)}
          label='Service'
          placeholder='Select a service'
          {...form.getInputProps('service_name')}
        />
        <Group className='add-modal-form-datetime'>
          <DateTimePicker label='Start Date' {...form.getInputProps('start_time')} />
          <DateTimePicker label='End Date' {...form.getInputProps('end_time')} />
        </Group>

        <Group className='add-modal-service-hours'>
          <NumberInput
            label='CCA Hours'
            {...form.getInputProps('service_hours')}
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

        <Checkbox
          label='Allow Ad Hoc attendees?'
          {...form.getInputProps('ad_hoc_enabled')}
          checked={form.values.ad_hoc_enabled}
          disabled={disableSelectAdHoc}
        />
        <ServiceSessionUserInput
          service_session_id={null}
          service_session_users={[]}
          all_users_names={allUsernames}
          handle_update={(v) => form.setFieldValue('attendees', v)}
        />

        <div className='add-modal-form-buttons'>
          <Button
            onClick={() => {
              close();
              form.reset();
            }}
            variant='outline'
            color='red'
          >
            Close
          </Button>
          <Button variant='outline' color='green' loading={loading} type='submit'>
            Save and close
          </Button>
        </div>
      </form>
    </CRUDModal>
  );
}

export default memo(AddAction);
