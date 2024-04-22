import { AttendanceStatus } from '@db/entities';

export type AttendanceExportsResult = {
  service_session_id: number;
  start_time: string;
  end_time: string;
  service: {
    name: string;
    service_id: number;
  };
  service_session_users: {
    service_session_id: number;
    username: string;
    ad_hoc: boolean;
    attended: AttendanceStatus;
    is_ic: boolean;
  }[];
};

export type AttendanceExportsXLSX = [['username', ...string[]], ...[string, ...(AttendanceStatus | null)[]][]];

export type AttendanceQueryExportsConditions = {
  id: number;
} & (
  | {
      start_date: string; // ISO strings, we have already validated this
      end_date: string;
    }
  | {
      start_date?: never;
      end_date?: never;
    }
);