import { Group, Text, rem } from '@mantine/core';
import { IconUpload, IconPhoto, IconX } from '@tabler/icons-react';
import { Dropzone, DropzoneProps } from '@mantine/dropzone';

export default function FileDrop(props: Partial<DropzoneProps>) {
  return (
    <Dropzone
      onDrop={(files) => console.log('accepted files', files)}
      onReject={(files) => console.log('rejected files', files)}
      maxSize={10 * 1024 ** 2}
      maxFiles={1}
      {...props}
    >
      <Group justify='center' gap='xl' mih={220} style={{ pointerEvents: 'none' }}>
        <Dropzone.Accept>
          <IconUpload
            style={{ width: rem(52), height: rem(52), color: 'var(--mantine-color-blue-6)' }}
            stroke={1.5}
          />
        </Dropzone.Accept>
        <Dropzone.Reject>
          <IconX
            style={{ width: rem(52), height: rem(52), color: 'var(--mantine-color-red-6)' }}
            stroke={1.5}
          />
        </Dropzone.Reject>
        <Dropzone.Idle>
          <IconPhoto
            style={{ width: rem(52), height: rem(52), color: 'var(--mantine-color-dimmed)' }}
            stroke={1.5}
          />
        </Dropzone.Idle>

        <div>
          <Text size='xl' inline>
            Drag files or click here to upload files
          </Text>
          <Text size='sm' c='dimmed' inline mt={7}>
            {props.maxFiles
              ? `Upload up to ${props.maxFiles} file${props.maxFiles > 1 ? 's' : ''}.`
              : 'Upload a file.'}{' '}
            {props.maxSize
              ? ` Each file has a max size of ${props.maxSize / 1024 ** 2}MB).`
              : 'Each file has a max size of 10MB.'}
          </Text>
        </div>
      </Group>
    </Dropzone>
  );
}
