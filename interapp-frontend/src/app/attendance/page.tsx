import APIClient from '@api/api_client';
import AttendanceMenu from './AttendanceMenu/AttendanceMenu';

export const fetchActiveServiceSessions = async () => {
  const apiClient = new APIClient().instance;
  const response = await apiClient.get('/service/active_sessions');
  if (response.status !== 200) throw new Error('Failed to fetch active service sessions');

  const data: {
    [hash: string]: {
      service_session_id: number;
      ICs: string[];
    };
  }[] = response.data;
  return data;
};

export type fetchActiveServiceSessionsType = Awaited<ReturnType<typeof fetchActiveServiceSessions>>;

export default async function AttendancePage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  if (searchParams['id'] === undefined) {
    return <AttendanceMenu />;
  }
}
