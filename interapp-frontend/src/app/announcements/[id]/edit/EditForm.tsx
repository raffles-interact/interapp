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
import { useParams, useRouter } from 'next/navigation';
import { parseServerError, remapAssetUrl } from '@utils/.';
import { notifications } from '@mantine/notifications';
import { Button, Group, TextInput, Title, Text, Stack } from '@mantine/core';
import { IconClock, IconUser } from '@tabler/icons-react';
import { allowedImgFormats, allowedDocFormats } from '../../utils';
import './styles.css';
import { FileWithPath } from '@mantine/dropzone';
import PageSkeleton from '@components/PageSkeleton/PageSkeleton';

const fetchAnnouncement = async (id: number) => {
  const apiClient = new APIClient().instance;
  const res = await apiClient.get('/announcement/', { params: { announcement_id: id } });

  const announcement: AnnouncementWithMeta = res.data;
  return [res.status, announcement] as const;
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
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const announcementId = useMemo(() => Number(params.id), []);

  const { user } = useContext(AuthContext);
  const [announcement, setAnnouncement] = useState<AnnouncementWithMeta | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitLoading, setSubmitLoading] = useState(false);
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
      setSubmitLoading(true);
      const [status, data] = await updateAnnouncement(params.id, values);

      switch (status) {
        case 409:
          notifications.show({
            title: 'Error',
            message: `Announcement with title ${values.title} already exists`,
            color: 'red',
          });
          break;
        case 200:
          notifications.show({
            title: 'Success',
            message: `Successfully updated announcement ${values.title} with id ${data.announcement_id}`,
            color: 'green',
          });
          router.push('/announcements');
          break;
        default:
          notifications.show({
            title: 'Error',
            message: parseServerError(data),
            color: 'red',
          });
      }
      setSubmitLoading(false);
    },
    [user, params.id],
  );

  useEffect(() => {
    if (!user) return;
    setLoading(true);
    const handleFetch = async () => {
      const [status, announcement] = await fetchAnnouncement(announcementId);
      if (status === 404) {
        notifications.show({
          title: 'Error',
          message: `Announcement with id ${announcementId} does not exist`,
          color: 'red',
        });
        router.replace('/announcements');
        return;
      }
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

      setLoading(false);
    };

    handleFetch();
  }, []);

  const generateAttachmentInfo = useCallback((attachment: FileWithPath) => {
    const loc = URL.createObjectURL(attachment);
    return (
      <AnnouncementAttachment
        key={loc}
        attachment={{
          attachment_loc: loc,
          attachment_mime: attachment.type,
          attachment_name: attachment.name,
        }}
      />
    );
  }, []);

  if (!user) return null;
  if (loading) return <PageSkeleton />;

  return (
    <form onSubmit={form.onSubmit(handleSubmit)}>
      <div className='edit-form'>
        <Group justify='space-between'>
          <Title order={1}>Edit Announcement</Title>
          <Stack gap={5}>
            <Group align='center' gap={5}>
              <IconClock className='edit-form-icon' />
              <Text>
                {announcement && new Date(announcement.creation_date).toLocaleString('en-GB')}
              </Text>
            </Group>
            <Group align='center' gap={5}>
              <IconUser className='edit-form-icon' />
              <Text>{announcement?.username}</Text>
            </Group>
          </Stack>
        </Group>

        <UploadImage
          accept={allowedImgFormats}
          defaultImageURL={announcement?.image}
          onChange={(imageURL, file) => {
            if (file)
              convertToBase64(file).then((base64) => {
                form.setFieldValue('image', base64);
              });
            else form.setFieldValue('image', null);
          }}
          className='edit-form-image'
        />
        <TextInput label='Title' placeholder='Title' required {...form.getInputProps('title')} />
        <TextEditor
          content={announcement?.description ?? ''}
          onChange={(content) => form.setFieldValue('description', content)}
        />
        <FileDrop
          accept={allowedDocFormats}
          maxFiles={10}
          onDrop={(files) => form.setFieldValue('attachments', files)}
          onReject={(files) => {
            for (const file of files) {
              notifications.show({
                title: file.errors.map((err) => err.code).join(', '),
                message: file.errors.map((err) => err.message).join(', '),
                color: 'red',
              });
            }
          }}
        />
        <div className='edit-form-attachments'>
          {form.values.attachments.map(generateAttachmentInfo)}
        </div>

        <Button type='submit' loading={submitLoading}>
          Submit
        </Button>
      </div>
    </form>
  );
}

export default EditForm;
