export interface Service {
  service_id: number;
  name: string;
  description?: string | null;
  contact_email: string;
  contact_number?: number | null;
  website?: string | null;
  promotional_image?: string | null;
  day_of_week: 0 | 1 | 2 | 3 | 4 | 5 | 6;
  start_time: string;
  end_time: string;
  service_ic_username: string;
  service_hours: number;
  enable_scheduled: boolean;
}

export type ServiceWithUsers = Service & { usernames: string[] };
export type CreateServiceWithUsers = Omit<ServiceWithUsers, 'service_id'>;
