'use client';
import { Tabs, Text, Title, Stack, ScrollArea, rem } from '@mantine/core';
import { IconChartDots, IconHeart, IconTableRow } from '@tabler/icons-react';
import { createContext, useState } from 'react';

const iconStyle = { width: rem(12), height: rem(12) };

const tabs = [
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

type TabLabel = (typeof tabs)[number]['label'];

export const ActiveTabContext = createContext<TabLabel | null>(null);

export default function ProfileLayout({ children }: { children: React.ReactNode }) {
  const [activeTab, setActiveTab] = useState<TabLabel | null>('Overview');

  return (
    <>
      <Stack gap={5} m={20}>
        {tabs.find(({ label }) => label === activeTab)?.header}

        <Tabs value={activeTab} onChange={(v) => setActiveTab(v as TabLabel | null)}>
          <ScrollArea type='auto'>
            <Tabs.List style={{ flexWrap: 'nowrap' }}>
              {tabs.map(({ label, icon }) => (
                <Tabs.Tab key={label} value={label} leftSection={icon}>
                  {label}
                </Tabs.Tab>
              ))}
            </Tabs.List>
          </ScrollArea>
        </Tabs>
      </Stack>
      <ActiveTabContext.Provider value={activeTab}>{children}</ActiveTabContext.Provider>
    </>
  );
}
