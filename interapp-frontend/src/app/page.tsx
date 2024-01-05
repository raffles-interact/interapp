'use client';
import { useContext } from 'react';
import { AuthContext } from '@providers/AuthProvider/AuthProvider';
import { useRouter } from 'next/navigation';
import AnnouncementList from '@components/AnnouncementList/AnnouncementList'
import ServiceList from '@components/ServiceList/ServiceList'
import AttendanceList from '@components/AttendanceList/AttendanceList'
import './styles.css';

export default function Home() {
  const router = useRouter();
  const { user, logout } = useContext(AuthContext);
  return (
    <div className='body'>
      <AnnouncementList number_of_announcements={1}/>
      <ServiceList/>
      <AttendanceList/>
    </div>
  );
}
