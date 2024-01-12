import {
  IconFile,
  IconFileTypePdf,
  IconFileTypeDocx,
  IconPhoto,
  IconFileTypePpt,
} from '@tabler/icons-react';
type MediaType = {
  format: string;
  icon: React.ReactNode;
};

export const mediaTypes: MediaType[] = [
  {
    format: 'image/png',
    icon: <IconPhoto />,
  },
  {
    format: 'image/jpeg',
    icon: <IconPhoto />,
  },
  {
    format: 'image/gif',
    icon: <IconPhoto />,
  },
  {
    format: 'image/webp',
    icon: <IconPhoto />,
  },
  {
    format: 'application/pdf',
    icon: <IconFileTypePdf />,
  },
  {
    format: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    icon: <IconFileTypeDocx />,
  },
  {
    format: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    icon: <IconFileTypePpt />,
  },
];

export const allowedImgFormats = ['image/png', 'image/jpeg', 'image/gif', 'image/webp'];
export const allowedDocFormats = [
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
];

export const allowedFormats = [...allowedImgFormats, ...allowedDocFormats];
