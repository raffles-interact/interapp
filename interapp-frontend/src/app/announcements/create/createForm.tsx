'use client';

import { useForm } from '@mantine/form';
import APIClient from '@api/api_client';
import { TextInput, Button } from '@mantine/core';
import TextEditor from '@components/TextEditor/TextEditor';
import FileDrop from '@components/FileDrop/FileDrop';
import UploadImage, { convertToBase64 } from '@/components/UploadImage/UploadImage';
import { useContext, useCallback } from 'react';
import { AuthContext } from '@providers/AuthProvider/AuthProvider';
import { allowedImgFormats, allowedDocFormats } from '../utils';
import { notifications } from '@mantine/notifications';
import { useRouter } from 'next/navigation';
import { type AnnouncementForm } from '../types';
import AnnouncementAttachment from '@components/AnnouncementAttachment/AnnouncementAttachment';
import './styles.css';

const CreateForm = () => {
  const apiClient = new APIClient({ useMultiPart: true }).instance;
  const router = useRouter();
  const { user } = useContext(AuthContext);
  const form = useForm<AnnouncementForm>({
    initialValues: {
      image: null,
      title: '',
      description: '',
      attachments: [],
    },
  });

  const handleSubmit = useCallback(
    async (values: typeof form.values) => {
      if (!user) return;
      const body = new FormData();
      if (values.image) body.append('image', values.image);
      body.append('title', values.title);
      body.append('description', values.description);
      console.log(values.attachments);

      values.attachments.forEach((file) => {
        body.append('attachments', new File([file], file.name, { type: file.type }));
      });

      body.append('username', user.username);
      body.append('creation_date', new Date().toISOString());

      const res = await apiClient.post('/announcement', body);
      switch (res.status) {
        case 409:
          notifications.show({
            title: 'Error',
            message: `Announcement with title ${values.title} already exists`,
            color: 'red',
          });
          break;
        case 201:
          notifications.show({
            title: 'Success',
            message: `Successfully created announcement ${values.title} with id ${res.data.announcement_id}`,
            color: 'green',
          });
          router.push('/announcements');
          break;
        case 400:
          notifications.show({
            title: 'Error',
            message: 'Failed to create announcement',
            color: 'red',
          });
          break;
        case 500:
          notifications.show({
            title: 'Error',
            message: 'Internal server error',
            color: 'red',
          });
          break;
      }
    },
    [user],
  );

  if (!user) return null;
  return (
    <form onSubmit={form.onSubmit(handleSubmit)}>
      <div className='create-form'>
        <UploadImage
          accept={allowedImgFormats}
          onChange={(imageURL, file) => {
            if (file)
              convertToBase64(file).then((base64) => {
                form.setFieldValue('image', base64);
              });
            else form.setFieldValue('image', null);
          }}
          className='create-form-image'
        />
        <TextInput label='Title' placeholder='Title' required {...form.getInputProps('title')} />
        <TextEditor content='' onChange={(content) => form.setFieldValue('description', content)} />
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
        <div className='create-form-attachments'>
          {form.values.attachments.map((attachment, idx) => (
            <AnnouncementAttachment
              key={idx}
              attachment={{
                attachment_loc: URL.createObjectURL(attachment),
                attachment_mime: attachment.type,
                attachment_name: attachment.name,
              }}
            />
          ))}
        </div>

        <Button type='submit'>Submit</Button>
      </div>
    </form>
  );
};

export default CreateForm;
