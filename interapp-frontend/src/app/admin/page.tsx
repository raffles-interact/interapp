import { Table } from "@mantine/core";
import APIClient from "@/api/api_client";

export default async function AdminPage() {
  const apiClient = new APIClient({useClient: false}).instance;

  

  return (
    <div>
      <h1>Admin Page</h1>
    </div>
  );
}