// this file is used to create the tabs for the profile layout
// this file is imported into the profile layout file
// cannot be directly in layout file because Nextjs build will fail
import { createContext } from 'react';
import { IconChartDots, IconHeart, IconTableRow } from '@tabler/icons-react';
import { Stack, Text, Title, rem } from '@mantine/core';

const iconStyle = { width: rem(12), height: rem(12) };
export const tabs = [
  {
    label: 'Overview',
    icon: <IconChartDots style={iconStyle} />,
    header: (
      <Stack gap={5}>
        <Title order={1}>Overview</Title>
        <Text>View your profile and miscellaneous information about your account.</Text>
      </Stack>
    ),
  },
  {
    label: 'Services',
    icon: <IconHeart style={iconStyle} />,
    header: (
      <Stack gap={5}>
        <Title order={1}>Services</Title>
        <Text>View your services and sign up for ad hoc sessions.</Text>
      </Stack>
    ),
  },
  {
    label: 'Service Sessions',
    icon: <IconTableRow style={iconStyle} />,
    header: (
      <Stack gap={5}>
        <Title order={1}>Service Sessions</Title>
        <Text>View your service sessions and manage your attendance.</Text>
      </Stack>
    ),
  },
] as const;

export type TabLabel = (typeof tabs)[number]['label'];

export const ActiveTabContext = createContext<TabLabel | null>(null);
