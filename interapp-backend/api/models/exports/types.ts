import { AttendanceStatus } from '@db/entities';

export interface ExportsModelImpl {
  queryExports(conds: unknown): Promise<unknown[]>;
  formatXLSX(conds: unknown): Promise<unknown>;
  packXLSX(ids: number[], start_date?: string, end_date?: string): Promise<Buffer>;
}

// class decorator that asserts that a class implements an interface statically
// https://stackoverflow.com/a/43674389
export function staticImplements<T>() {
  return <U extends T>(constructor: U) => {
    constructor;
  };
}

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

export type AttendanceExportsXLSX = [
  ['username', ...string[]],
  ...[string, ...(AttendanceStatus | null)[]][],
];

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
