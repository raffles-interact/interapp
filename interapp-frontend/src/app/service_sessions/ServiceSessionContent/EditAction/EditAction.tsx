'use client';
import { useDisclosure } from '@mantine/hooks';
import { useForm } from '@mantine/form';
import { Button, Group, Checkbox, NumberInput } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { DateTimePicker } from '@mantine/dates';
import ServiceSessionUserInput from '../ServiceSessionUserInput/ServiceSessionUserInput';
import { IconPencil } from '@tabler/icons-react';
import { AuthContext } from '@providers/AuthProvider/AuthProvider';
import { memo, useContext, useEffect, useState } from 'react';
import APIClient from '@api/api_client';
import { Permissions } from '@/app/routePermissions';
import CRUDModal from '@components/CRUDModal/CRUDModal';
import './styles.css';
import { ServiceSessionUser } from '../../types';
import { getAllUsernames, parseServerError } from '@utils/.';
import { updateServiceSessionUsers, updateServiceSession, updateServiceHours } from './EditActionUpdaters';

const calculateInterval = (start: Date, end: Date) => {
  const diff = end.getTime() - start.getTime();
  const diffHours = diff / 1000 / 60 / 60;
  const rounded = Math.floor(diffHours);
  return rounded < 0 ? 0 : rounded;
};

export interface EditActionFormProps {
  start_time: Date;
  end_time: Date;
  ad_hoc_enabled: boolean;
  attendees: ServiceSessionUser[];
  service_hours: number;
}

export interface EditActionProps {
  service_session_id: number;
  start_time: string;
  end_time: string;
  ad_hoc_enabled: boolean;
  attendees: ServiceSessionUser[];
  service_hours: number;
  refreshData: () => void;
}

function EditAction({
  service_session_id,
  start_time,
  end_time,
  ad_hoc_enabled,
  attendees,
  service_hours,
  refreshData,
}: Readonly<EditActionProps>) {
  const apiClient = new APIClient().instance;
  const { user } = useContext(AuthContext);
  const [opened, { open, close }] = useDisclosure(false);
  const [loading, setLoading] = useState(false);

  const [allUsernames, setAllUsernames] = useState<string[]>([]);
  const [disableSelectAdHoc, setDisableSelectAdHoc] = useState<boolean>(false);

  const form = useForm<EditActionFormProps>({
    initialValues: {
      start_time: new Date(start_time),
      end_time: new Date(end_time),
      ad_hoc_enabled,
      attendees,
      service_hours,
    },
    validate: {
      end_time: (value, values) =>
        value < values.start_time ? 'End time must be after start time' : null,
    },
  });

  const handleSubmit = async (values: EditActionFormProps) => {
    setLoading(true);

    const updatedServiceSessionResponse = await updateServiceSession(
      apiClient,
      service_session_id,
      values,
    );

    if (updatedServiceSessionResponse.status !== 200) {
      notifications.show({
        title: 'Error',
        message: parseServerError(updatedServiceSessionResponse.data),
        color: 'red',
      });

      refreshData();
      setLoading(false);
      return;
    }

    const { deletedServiceSessionUsersResponse, addedServiceSessionUsersResponse } =
      await updateServiceSessionUsers(apiClient, service_session_id, attendees, values);

    if (
      (deletedServiceSessionUsersResponse && deletedServiceSessionUsersResponse.status >= 400) ||
      (addedServiceSessionUsersResponse && addedServiceSessionUsersResponse.status >= 400)
    ) {
      notifications.show({
        title: 'Error',
        message:
          'Failed to update attendees. Changes may have been partially applied.\n' +
          parseServerError(deletedServiceSessionUsersResponse) +
          '\n' +
          parseServerError(addedServiceSessionUsersResponse),
        color: 'red',
      });

      refreshData();
      setLoading(false);
      return;
    }

    const updateHoursResponse = await updateServiceHours(
      apiClient,
      service_hours,
      attendees,
      values,
    );

    if (updateHoursResponse) {
      notifications.show({
        title: 'Error',
        message:
          'Failed to update service hours. Changes may have been partially applied.\n' +
          parseServerError(updateHoursResponse),
        color: 'red',
      });

      refreshData();
      setLoading(false);
      return;
    }

    notifications.show({
      title: 'Success',
      message: 'Successfully updated service session.',
      color: 'green',
    });

    refreshData();
    setLoading(false);
    close();
  };
  
  // if any user is ad_hoc, disable ad_hoc_enabled as a selectable option because it's already enabled for >1 user
  useEffect(() => {
    const hasAdHocUser = form.values.attendees.some((user) => user.ad_hoc);
    if (hasAdHocUser) setDisableSelectAdHoc(true);
    else setDisableSelectAdHoc(false);
    if (hasAdHocUser && !form.values.ad_hoc_enabled) form.setFieldValue('ad_hoc_enabled', true);
  }, [form.values.attendees]);

  useEffect(() => {
    if (opened) getAllUsernames().then((allUsernames) => setAllUsernames(allUsernames));
  }, [opened]);

  return (
    <CRUDModal
      opened={opened}
      open={open}
      close={close}
      Icon={IconPencil}
      iconColor='blue'
      title='Edit Service Session'
      show={() =>
        !!user &&
        (user.permissions.includes(Permissions.SERVICE_IC) ||
          user.permissions.includes(Permissions.MENTORSHIP_IC))
      }
    >
      <form onSubmit={form.onSubmit(handleSubmit)} className='edit-modal-form'>
        <Group className='edit-modal-form-datetime'>
          <DateTimePicker
            label='Start Date'
            defaultValue={new Date(start_time)}
            {...form.getInputProps('start_time')}
          />
          <DateTimePicker
            label='End Date'
            defaultValue={new Date(end_time)}
            {...form.getInputProps('end_time')}
          />
        </Group>

        <Group className='edit-modal-service-hours'>
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
          service_session_id={service_session_id}
          service_session_users={attendees}
          all_users_names={allUsernames}
          handle_update={(v) => form.setFieldValue('attendees', v)}
        />

        <div className='edit-modal-form-buttons'>
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
          <Button type='submit' variant='outline' color='green' loading={loading}>
            Save and close
          </Button>
        </div>
      </form>
    </CRUDModal>
  );
}

export default memo(EditAction);
