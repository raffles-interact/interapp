import { Service } from '../services/types';

export interface ServiceSession {
  service_session_id: number;
  service_id: number;
  service_name: string;
  start_time: string;
  end_time: string;
  ad_hoc_enabled: boolean;
  service_session_users: ServiceSessionUser[];
}

export const AttendanceStatus = ['Absent', 'Attended', 'Valid Reason'];
export interface ServiceSessionUser {
  ad_hoc: boolean;
  attended: 'Absent' | 'Attended' | 'Valid Reason';
  is_ic: boolean;
  service_session_id: number | null;
  username: string;
}

export interface ServiceSessionsWithMeta {
  data: ServiceSession[];
  total_entries: number;
  length_of_page: number;
}

export type ServiceMeta = Pick<Service, 'service_id' | 'name' | 'promotional_image'>;
