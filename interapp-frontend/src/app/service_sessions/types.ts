import { Service } from '../services/page';

export interface ServiceSession {
  service_session_id: string;
  service_id: number;
  service_name: string;
  start_time: string;
  end_time: string;
  ad_hoc_enabled: boolean;
  service_session_users: UserService[];
}

export interface UserService {
  ad_hoc: boolean;
  attended: 'Absent' | 'Present' | 'Valid Reason';
  is_ic: boolean;
  service_session_id: number;
  username: string;
}

export interface ServiceSessionsWithMeta {
  data: ServiceSession[];
  total_entries: number;
  length_of_page: number;
}

export type ServiceMeta = Pick<Service, 'service_id' | 'name' | 'promotional_image'>;

export interface SearchContextProps {
  page: number;
  serviceId: number | null;
}
