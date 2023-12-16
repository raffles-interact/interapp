import AdminTable from './AdminTable/AdminTable';
import { Text, Title } from '@mantine/core';
import './styles.css';

export default async function AdminPage() {
  return (
    <div className='admin-page'>
      <div>
        <Title order={1}>Admin Page</Title>
        <Text>
          This page allows for admins to modify and edit raw user data. Warning, changes may cause
          security breaches if performed incorrectly.
        </Text>
      </div>
      <AdminTable />
    </div>
  );
}
