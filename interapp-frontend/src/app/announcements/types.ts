import { type FileWithPath } from '@mantine/dropzone';
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
  attachment_loc: string;
  attachment_name: string;
  attachment_mime: string;
}

export type AnnouncementWithMeta = Announcement & {
  announcement_attachments: AnnouncementAttachment[];
  announcement_completions: AnnouncementCompletion[];
};

export interface AnnouncementForm {
  image: string | null;
  title: string;
  description: string;
  attachments: FileWithPath[];
}
