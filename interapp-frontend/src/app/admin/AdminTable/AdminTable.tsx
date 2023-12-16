'use client';
import { Table, Loader, Pill, TextInput } from '@mantine/core';
import APIClient from '@/api/api_client';
import { memo, useEffect, useState } from 'react';
import { User } from '@/providers/AuthProvider/types';
import { Permissions } from '@/app/route_permissions';
import { permissionsMap } from './PermissionsInput/PermissionsInput';
import EditAction from './EditAction/EditAction';
import DeleteAction from './DeleteAction/DeleteAction';
import PageController, { paginateItems } from '@/components/PageController/PageController';
import { IconSearch } from '@tabler/icons-react';
import './styles.css';

const fetchUserData = async () => {
  const apiClient = new APIClient().instance;
  try {
    const users: Omit<User, 'permissions'>[] = (await apiClient.get('/user')).data;
    const perms: { [username: string]: Permissions[] } = (await apiClient.get('/user/permissions'))
      .data;
    const usersWithPerms = users.map((user) => ({ ...user, permissions: perms[user.username] }));
    return usersWithPerms;
  } catch (e) {
    throw e;
  }
};

const computeSearchItems = (search: string, users: User[]) => {
  return users.filter(
    (user) =>
      user.username.toLowerCase().includes(search.toLowerCase()) ||
      user.email.toLocaleLowerCase().includes(search.toLowerCase()),
  );
};

const AdminTable = () => {
  const [userData, setUserData] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');

  const usersPerPage = 10;

  const refreshData = () => {
    setLoading(true);
    fetchUserData()
      .then((users) => setUserData(users))
      .catch((e) => console.error(e));
    setLoading(false);
  };

  useEffect(refreshData, []);

  return (
    <div>
      {loading ? (
        <Loader />
      ) : (
        <>
          <TextInput
            label='Search for username or email...'
            value={search}
            onChange={(e) => setSearch(e.currentTarget.value)}
            rightSection={<IconSearch />}
          />
          <Table.ScrollContainer minWidth={1000}>
            <Table stickyHeader>
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>User ID</Table.Th>
                  <Table.Th>Username</Table.Th>
                  <Table.Th>Email</Table.Th>
                  <Table.Th>Verified</Table.Th>
                  <Table.Th>Permissions</Table.Th>
                  <Table.Th>Service Hours</Table.Th>
                  <Table.Th>Actions</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {paginateItems(computeSearchItems(search, userData), page, usersPerPage).map(
                  (user) => (
                    <Table.Tr key={user.username}>
                      <Table.Td>{user.user_id}</Table.Td>
                      <Table.Td>{user.username}</Table.Td>
                      <Table.Td>{user.email}</Table.Td>
                      <Table.Td>
                        {user.verified ? (
                          <span className='admin-table-verified'>Verified</span>
                        ) : (
                          <span className='admin-table-unverified'>Unverified</span>
                        )}
                      </Table.Td>
                      <Table.Td>
                        <div className='admin-table-permissions'>
                          {user.permissions.map((perm) => (
                            <Pill key={perm} className='admin-table-permission'>
                              {permissionsMap[perm]}
                            </Pill>
                          ))}
                        </div>
                      </Table.Td>
                      <Table.Td>{user.service_hours}</Table.Td>
                      <Table.Td className='admin-table-actions'>
                        <EditAction user={user} refreshData={refreshData} />
                        <DeleteAction username={user.username} refreshData={refreshData} />
                      </Table.Td>
                    </Table.Tr>
                  ),
                )}
              </Table.Tbody>
            </Table>
          </Table.ScrollContainer>
          <PageController
            activePage={page}
            totalPages={Math.ceil(userData.length / usersPerPage)}
            handlePageChange={(e) => setPage(e)}
            className='admin-table-pagination'
          />
        </>
      )}
    </div>
  );
};

export default memo(AdminTable);
