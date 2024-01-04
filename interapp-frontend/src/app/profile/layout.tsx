'use client';
import { Tabs, Stack, ScrollArea } from '@mantine/core';
import { useState } from 'react';
import { TabLabel, tabs, ActiveTabContext } from './utils';

export default function ProfileLayout({ children }: Readonly<{ children: React.ReactNode }>) {
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
