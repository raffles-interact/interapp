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
import { Permissions } from '@/app/route_permissions';
import CRUDModal from '@components/CRUDModal/CRUDModal';
import './styles.css';
import { ServiceSessionUser } from '../../types';
import { getAllUsernames, parseErrorMessage } from '@utils/.';

const calculateInterval = (start: Date, end: Date) => {
  const diff = end.getTime() - start.getTime();
  const diffHours = diff / 1000 / 60 / 60;
  const rounded = Math.floor(diffHours);
  return rounded < 0 ? 0 : rounded;
};

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

  const form = useForm({
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

  const handleSubmit = async (values: typeof form.values) => {
    setLoading(true);
    const body = {
      service_session_id,

      start_time: values.start_time.toISOString(),
      end_time: values.end_time.toISOString(),
      ad_hoc_enabled: values.ad_hoc_enabled,
      service_hours: values.service_hours,
    };

    const res = await apiClient.patch('/service/session', body);

    if (res.status !== 200) {
      notifications.show({
        title: 'Error',
        message: parseErrorMessage(res.data),
        color: 'red',
      });

      refreshData();
      setLoading(false);
      return;
    }
    const addedAttendees = values.attendees.filter((attendee) => !attendees.includes(attendee));
    const removedAttendees = attendees.filter((attendee) => !values.attendees.includes(attendee));

    let res1 = null;
    if (removedAttendees.length > 0)
      res1 = await apiClient.delete('/service/session_user_bulk', {
        data: {
          service_session_id,
          usernames: removedAttendees.map((attendee) => attendee.username),
        },
      });

    let res2 = null;
    if (addedAttendees.length > 0)
      res2 = await apiClient.post('/service/session_user_bulk', {
        service_session_id,
        users: addedAttendees,
      });

    if ((res1 && res1.status >= 400) || (res2 && res2.status >= 400)) {
      notifications.show({
        title: 'Error',
        message:
          'Failed to update service session users (attendees). Changes may have been partially applied.',
        color: 'red',
      });

      refreshData();
      setLoading(false);
      return;
    }

    // calculate the updated attendance status
    // compare the updated attendees with the original attendees

    const oldAttendees = attendees.map((a) => [a.username, a.attended] as const);
    const newAttendees = form.values.attendees.map((a) => [a.username, a.attended] as const);

    // find the difference in service hours
    const difference = Object.fromEntries(
      newAttendees.map(([key, value]) => {
        let offset = 0;
        // attendees that were present before, and now present
        if (oldAttendees.some(([k]) => k === key)) {
          offset += form.values.service_hours - service_hours;

          const oldValue = oldAttendees.find(([k]) => k === key)?.[1] as
            | 'Absent'
            | 'Attended'
            | 'Valid Reason';
          // case 1: user attended before and now not attending
          if (oldValue === 'Attended' && value !== 'Attended') offset -= form.values.service_hours;
          // case 2: user didn't attend before and now attending
          if (oldValue !== 'Attended' && value === 'Attended') offset += form.values.service_hours;
        } else {
          // attendees that were not present before, and now present
          if (value === 'Attended') offset += form.values.service_hours;
        }

        return [key, offset];
      }),
    );

    // handle removed attendees that were present before, and now not present
    oldAttendees.forEach(([key, value]) => {
      if (!newAttendees.some(([k]) => k === key) && value === 'Attended') {
        difference[key] = -service_hours;
      }
    });

    console.log(difference); // UPDATE WITH ENDPOINTS ASAP

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
