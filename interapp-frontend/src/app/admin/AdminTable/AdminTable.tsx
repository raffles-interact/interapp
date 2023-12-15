'use client';
import { Table } from "@mantine/core"
import APIClient from "@/api/api_client";
import { useState } from "react";
import {User} from "@/providers/AuthProvider/types";



const AdminTable = () => {
  const apiClient = new APIClient().instance;
  const [userData, setUserData] = useState<User[]>([])

  const fetchUserData = () => {}

  return (
    <div>
      <h1>Admin Table</h1>
    </div>
  )
}