'use client';
import { Pagination, Group } from '@mantine/core';
import {
  IconArrowBarToRight,
  IconArrowBarToLeft,
  IconArrowLeft,
  IconArrowRight,
} from '@tabler/icons-react';
import { memo } from 'react';

export interface PaginationProps {
  activePage: number;
  totalPages: number;
  handlePageChange: (page: number) => void;
  className?: string;
}

export function paginateItems<T>(items: T[], page: number, perPage: number): T[] {
  return items.slice((page - 1) * perPage, page * perPage);
}

const PageController = ({
  activePage,
  totalPages,
  handlePageChange,
  className,
}: PaginationProps) => {
  return (
    <div className={className}>
      <Pagination.Root total={totalPages} onChange={handlePageChange} value={activePage}>
        <Group gap={7}>
          <Pagination.First icon={IconArrowBarToLeft} />
          <Pagination.Previous icon={IconArrowLeft} />
          <Pagination.Items />
          <Pagination.Next icon={IconArrowRight} />
          <Pagination.Last icon={IconArrowBarToRight} />
        </Group>
      </Pagination.Root>
    </div>
  );
};

export default memo(PageController);
