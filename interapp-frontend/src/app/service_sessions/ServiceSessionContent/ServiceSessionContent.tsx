'use client';
import { useEffect, useState } from 'react';
import { Table, Select } from '@mantine/core';
import { ServiceSessionsWithMeta, ServiceMeta } from '../types';
import { useMediaQuery } from '@mantine/hooks';
import PageController from '@components/PageController/PageController';
import ServiceSession from './ServiceSession/ServiceSession';
import './styles.css';

const ServiceSessionContent = ({
  serviceSessionsWithMeta,
  serviceMetas,
  totalPages,
  perPage,
  serviceOptions,
  refreshData,
}: {
  serviceSessionsWithMeta: ServiceSessionsWithMeta;
  serviceMetas: ServiceMeta[];
  totalPages: number;
  perPage: number;
  serviceOptions: ServiceMeta[];
  refreshData: (
    page: number,
    service_id?: number,
  ) => Promise<readonly [ServiceSessionsWithMeta, ServiceMeta[]]>;
}) => {
  const isDesktop = useMediaQuery('(min-width: 768px)');
  const [serviceId, setServiceId] = useState<number>();
  const [page, setPage] = useState(1);
  const [totalPagesState, setTotalPagesState] = useState(totalPages);

  useEffect(() => {
    setPage(1);
  }, [serviceId]);

  const [serviceSessions, setServiceSessions] = useState(serviceSessionsWithMeta.data);

  const refresh = () => {
    const args: readonly [number, number?] = serviceId !== undefined ? [page, serviceId] : [page];
    refreshData(...args).then(([serviceSessionsWithMeta, _]) => {
      setServiceSessions(serviceSessionsWithMeta.data);
      setTotalPagesState(Math.ceil(serviceSessionsWithMeta.total_entries / perPage));
    });
  }

  useEffect(refresh, [page, serviceId]);

  return (
    <div className='service-sessions-page-content'>
      <Select
        label='Service'
        placeholder='Filter by service'
        data={serviceOptions.map((option) => option.name)}
        onChange={(selected) => {
          const index = serviceOptions.findIndex((option) => option.name === selected);
          setServiceId(serviceOptions[index]?.service_id ?? null);
        }}
      />
      <Table.ScrollContainer minWidth={768}>
        <Table stickyHeader>
          <Table.Thead>
            <Table.Tr>
              {isDesktop && <Table.Th>{''}</Table.Th>}
              <Table.Th>Session ID</Table.Th>
              <Table.Th>Service</Table.Th>
              <Table.Th>Date</Table.Th>
              <Table.Th>Time</Table.Th>
              <Table.Th>Ad hoc?</Table.Th>
              <Table.Th>Attendees</Table.Th>
              <Table.Th>Actions</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {serviceSessions.map((serviceSession) => {
              return (
                <ServiceSession
                  key={serviceSession.service_session_id}
                  service_session_id={serviceSession.service_session_id}
                  service_name={serviceSession.service_name}
                  service_promotional_image={
                    serviceMetas.find(
                      (serviceMeta) => serviceMeta.service_id === serviceSession.service_id,
                    )?.promotional_image
                  }
                  start_time={serviceSession.start_time}
                  end_time={serviceSession.end_time}
                  ad_hoc_enabled={serviceSession.ad_hoc_enabled}
                  service_session_users={serviceSession.service_session_users}
                  isDesktop={isDesktop ?? false}
                  refreshData={refresh}
                />
              );
            })}
          </Table.Tbody>
        </Table>
      </Table.ScrollContainer>
      <PageController
        activePage={page}
        handlePageChange={(page) => setPage(page)}
        totalPages={totalPagesState}
        className='service-sessions-page-controller'
      />
    </div>
  );
};

export default ServiceSessionContent;
