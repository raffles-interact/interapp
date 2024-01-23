import { Skeleton, Group } from '@mantine/core';

export default function PageSkeleton() {
  return (
    <Group p='md' w='100%'>
      <Skeleton height={500} width='100%' />
    </Group>
  );
}
