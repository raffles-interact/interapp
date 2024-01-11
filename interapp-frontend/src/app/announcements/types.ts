export interface Announcement {
  announcement_id: number;
  creation_date: string;
  title: string;
  description: string;
  image?: string | null;
  username: string;
}

export interface AnnouncementCompletion {
  username: string;
  announcement_id: number;
  completed: boolean;
}

export interface AnnouncementAttachment {
  announcement_id: number;
  attachment: string;
}
