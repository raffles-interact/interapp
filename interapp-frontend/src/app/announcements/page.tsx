'use client';
import APIClient from '@api/api_client';
import UnderConstruction from '@components/UnderConstruction/UnderContruction';
import { useState } from 'react';

export default function AnnouncementsPage() {
  const apiClient = new APIClient({useMultiPart: true}).instance;
  const [A, setA] = useState<FileList | null>(null);


  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData();
    if (A) for (let i = 0; i < A.length; i++) {
      formData.append('docs', A[i]);
    }
    const body = {
      'creation_date': new Date().toISOString(),
      'title': 'test4',
      'description': 'test',
      'username': 'sebas'
    }
    for (const [key, value] of Object.entries(body)) {
      formData.append(key, value);
    }
    apiClient.post('/announcement', formData).then((res) => {
      console.log(res);
    }).catch((err) => {
      console.log(err);
    });
  }
  return (
    <form onSubmit={handleSubmit}>
      <input type='file' accept='*' multiple onChange={(e) => setA(e.currentTarget.files)}/>
      <button type='submit'>Submit</button>
    </form>

  );
}
