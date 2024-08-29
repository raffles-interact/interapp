import { AxiosInstance } from 'axios';
import { ServiceSessionUser } from '../../types';
import { EditActionFormProps } from './EditAction';

export async function updateServiceSession(
  apiClient: AxiosInstance,
  service_session_id: number,
  values: EditActionFormProps,
) {
  return await apiClient.patch('/service/session', {
    service_session_id,
    start_time: values.start_time.toISOString(),
    end_time: values.end_time.toISOString(),
    ad_hoc_enabled: values.ad_hoc_enabled,
    service_hours: values.service_hours,
  });
}

export async function updateServiceSessionUsers(
  apiClient: AxiosInstance,
  service_session_id: number,
  attendees: ServiceSessionUser[],
  formValues: EditActionFormProps,
) {
  const addedAttendees = formValues.attendees.filter((attendee) => !attendees.includes(attendee));
  const removedAttendees = attendees.filter((attendee) => !formValues.attendees.includes(attendee));

  let deletedServiceSessionUsersResponse = null;
  if (removedAttendees.length > 0)
    deletedServiceSessionUsersResponse = await apiClient.delete('/service/session_user_bulk', {
      data: {
        service_session_id,
        usernames: removedAttendees.map((attendee) => attendee.username),
      },
    });

  let addedServiceSessionUsersResponse = null;
  if (addedAttendees.length > 0)
    addedServiceSessionUsersResponse = await apiClient.post('/service/session_user_bulk', {
      service_session_id,
      users: addedAttendees,
    });

  return {
    deletedServiceSessionUsersResponse,
    addedServiceSessionUsersResponse,
  };
}

// hope this doesn't break
export async function updateServiceHours(
  apiClient: AxiosInstance,
  service_hours: number,
  attendees: ServiceSessionUser[],
  formValues: EditActionFormProps,
) {
  const oldAttendees = attendees.map((a) => [a.username, a.attended] as const);
  const newAttendees = formValues.attendees.map((a) => [a.username, a.attended] as const);

  const difference = Object.fromEntries(
    newAttendees.map(([key, value]) => {
      let offset = 0;
      const oldAttendee = oldAttendees.find(([k]) => k === key);
      if (oldAttendee) {
        const oldValue = oldAttendee[1];

        // if the hours were adjusted, update the hours of those previously attending and now still attending
        if (oldValue === 'Attended' && value === 'Attended')
          offset += formValues.service_hours - service_hours;

        // if the user was previously attended and is now not attended, subtract the hours
        if (oldValue === 'Attended' && value !== 'Attended') offset -= service_hours;

        // if the user was previously not attended and is now attended, add the hours
        if (oldValue !== 'Attended' && value === 'Attended') offset += formValues.service_hours;
      } else if (value === 'Attended') {
        offset += formValues.service_hours;
      }

      return [key, offset];
    }),
  );

  // if the user was previously attended and is now not attended, subtract the hours
  oldAttendees.forEach(([key, value]) => {
    if (!newAttendees.some(([k]) => k === key) && value === 'Attended') {
      difference[key] = -service_hours;
    }
  });

  const body = Object.entries(difference)
    .map(([username, hours]) => ({
      username,
      hours,
    }))
    .filter((entry) => entry.hours !== 0);

  if (body.length === 0) return;
  const res = await apiClient.patch('/user/service_hours_bulk', body);

  if (res.status === 204) {
    return null;
  } else {
    return res.data;
  }
}
