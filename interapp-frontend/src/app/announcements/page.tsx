'use client';
import APIClient from '@api/api_client';
import UnderConstruction from '@components/UnderConstruction/UnderContruction';
import { useState, useEffect } from 'react';

const handleFetch = async () => {
  const apiClient = new APIClient().instance;
  const res = await apiClient.get('/announcement/all', { params: { page: 1, page_size: 100 } });
  return res.data;
};

export default function AnnouncementsPage() {
  const [A, setA] = useState<FileList | null>(null);
  const [B, setB] = useState<any>(null);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    const apiClient = new APIClient({ useMultiPart: true }).instance;
    event.preventDefault();
    const formData = new FormData();
    if (A)
      for (let i = 0; i < A.length; i++) {
        formData.append('docs', A[i]);
      }
    const body = {
      creation_date: new Date().toISOString(),
      title: 'test5',
      description: 'test',
      username: 'sebas',
    };
    for (const [key, value] of Object.entries(body)) {
      formData.append(key, value);
    }
    apiClient
      .post('/announcement', formData)
      .then((res) => {
        console.log(res);
      })
      .catch((err) => {
        console.log(err);
      });
  };

  useEffect(() => {
    handleFetch().then((res) => setB(res));
  }, []);

  return (
    <>
      <form onSubmit={handleSubmit}>
        <input type='file' accept='*' multiple onChange={(e) => setA(e.currentTarget.files)} />
        <button type='submit'>Submit</button>
      </form>
      <div>{JSON.stringify(B)}</div>
    </>
  );
}
