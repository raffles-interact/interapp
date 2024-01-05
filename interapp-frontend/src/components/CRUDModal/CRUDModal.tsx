import { ReactNode, memo } from 'react';
import { Modal, ActionIcon } from '@mantine/core';
import { TablerIconsProps } from '@tabler/icons-react';
import './styles.css';

export interface CRUDModalProps {
  opened: boolean;
  open: () => void;
  close: () => void;
  show?: () => boolean;
  title?: string;
  Icon: (props: TablerIconsProps) => JSX.Element;
  iconColor?: string;
  children: ReactNode;
  className?: string;
}

const CRUDModal = ({
  children,
  opened,
  open,
  close,
  show,
  title,
  Icon,
  iconColor,
  className,
}: CRUDModalProps) => {
  if (show && !show()) return null;
  return (
    <>
      <Modal
        opened={opened}
        onClose={close}
        closeOnClickOutside={false}
        closeOnEscape={false}
        withCloseButton={false}
        className='modal'
        title={title ?? ''}
      >
        {children}
      </Modal>
      <ActionIcon
        size={36}
        onClick={open}
        className={`action-icon ${className}`}
        color={iconColor ?? 'blue'}
      >
        <Icon />
      </ActionIcon>
    </>
  );
};

export default memo(CRUDModal);
