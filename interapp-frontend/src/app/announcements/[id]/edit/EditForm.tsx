'use client';

import TextEditor from '@components/TextEditor/TextEditor';
import FileDrop from '@components/FileDrop/FileDrop';
import UploadImage, { convertToBase64 } from '@components/UploadImage/UploadImage';
import AnnouncementAttachment from '@components/AnnouncementAttachment/AnnouncementAttachment';
import { useForm } from '@mantine/form';
import APIClient from '@api/api_client';
import { useContext, useEffect, useState, useMemo, useCallback } from 'react';
import { AuthContext } from '@providers/AuthProvider/AuthProvider';
import { type AnnouncementWithMeta, type AnnouncementForm } from '../../types';
import { useParams } from 'next/navigation';
import { remapAssetUrl } from '@api/utils';
import { notifications } from '@mantine/notifications';

const fetchAnnouncement = async (id: number) => {
  const apiClient = new APIClient().instance;
  const res = await apiClient.get('/announcement/', { params: { announcement_id: id } });

  if (res.status !== 200) {
    throw new Error('Failed to fetch announcement');
  }

  const announcement: AnnouncementWithMeta = res.data;
  return announcement;
};

const updateAnnouncement = async (id: string, values: AnnouncementForm) => {
  const apiClient = new APIClient({ useMultiPart: true }).instance;
  const body = new FormData();
  body.append('announcement_id', id);
  if (values.image) body.append('image', values.image);
  body.append('title', values.title);
  body.append('description', values.description);

  values.attachments.forEach((file) => {
    body.append('attachments', new File([file], file.name, { type: file.type }));
  });

  const res = await apiClient.patch(`/announcement/`, body);
  return [res.status, res.data] as const;
};

function EditForm() {
  const params = useParams<{ id: string }>();
  const announcementId = useMemo(() => Number(params.id), []);

  const { user } = useContext(AuthContext);
  const [announcement, setAnnouncement] = useState<AnnouncementWithMeta | null>(null);
  const form = useForm<AnnouncementForm>({
    initialValues: {
      image: null,
      title: '',
      description: '',
      attachments: [],
    },
  });

  const handleSubmit = useCallback(
    async (values: AnnouncementForm) => {
      if (!user) return;
      const [status, data] = await updateAnnouncement(params.id, values);

      switch (status) {
        case 409:
          notifications.show({
            title: 'Error',
            message: `Announcement with title ${values.title} already exists`,
            color: 'red',
          });
          break;
        case 204:
          notifications.show({
            title: 'Success',
            message: `Successfully updated announcement ${values.title} with id ${data.announcement_id}`,
            color: 'green',
          });
          break;
        default:
          notifications.show({
            title: 'Error',
            message: JSON.stringify(data),
            color: 'red',
          });
      }
    },
    [user, params.id],
  );

  useEffect(() => {
    const handleFetch = async () => {
      const announcement = await fetchAnnouncement(announcementId);
      const imageURL = announcement.image ? new URL(remapAssetUrl(announcement.image)) : null;
      const b64 = imageURL && (await convertToBase64(imageURL));

      let attachments: File[] = [];
      for (const attachment of announcement.announcement_attachments) {
        const attachmentURL = new URL(remapAssetUrl(attachment.attachment_loc));
        const file = await fetch(attachmentURL)
          .then((response) => response.blob())
          .then(
            (blob) =>
              new File([blob], attachment.attachment_name, { type: attachment.attachment_mime }),
          );
        attachments.push(file);
      }
      form.setValues({
        title: announcement.title,
        description: announcement.description,
        image: b64,
        attachments: attachments,
      });

      setAnnouncement({
        ...announcement,
        image: announcement.image ? remapAssetUrl(announcement.image) : null,
        announcement_attachments: announcement.announcement_attachments.map((attachment) => ({
          ...attachment,
          attachment_loc: remapAssetUrl(attachment.attachment_loc),
        })),
      });
    };
    handleFetch();
  }, []);

  return (
    <form onSubmit={form.onSubmit(handleSubmit)}>
      {announcement && JSON.stringify(announcement)}
    </form>
  );
}

export default EditForm;
