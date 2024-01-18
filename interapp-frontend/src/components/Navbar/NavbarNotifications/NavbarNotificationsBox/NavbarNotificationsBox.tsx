'use client';
import { Card, Text, Group, Title, LoadingOverlay } from '@mantine/core';
import { useState } from 'react';

interface NavbarNotificationsBoxProps {
  title: string;
  description?: string;
  date?: string;
  icon: JSX.Element;
  color: string;
  onClick?: () => Promise<void>;
}

const NavbarNotificationsBox = ({
  title,
  description,
  date,
  icon,
  color,
  onClick,
}: NavbarNotificationsBoxProps) => {
  const [clicked, setClicked] = useState(false);

  const handleClick = () => {
    if (!onClick || clicked) return; // if there is no onClick callback or the button is already clicked, do nothing
    setClicked(true);
    onClick?.().then(() => setClicked(false));
  };

  return (
    <Card
      shadow='sm'
      padding='sm'
      radius='sm'
      onClick={handleClick}
      style={{ cursor: onClick && 'pointer' }}
      pos='relative'
    >
      <LoadingOverlay visible={clicked} zIndex={1000} overlayProps={{ radius: 'sm', blur: 2 }} />
      <Card.Section withBorder p='sm' bg={color}>
        <Group justify='center'>{icon}</Group>
      </Card.Section>
      <Card.Section m='sm'>
        <Title size='sm' order={6}>
          {title}
        </Title>
        {description && (
          <Text
            size='xs'
            c='dimmed'
            lineClamp={2}
            dangerouslySetInnerHTML={{ __html: description }}
          />
        )}

        <Text size='xs' c='dimmed'>
          {date}
        </Text>
      </Card.Section>
    </Card>
  );
};

export default NavbarNotificationsBox;
