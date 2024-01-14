'use client';
import { useContext } from 'react';
import { AuthContext } from '@providers/AuthProvider/AuthProvider';
import { useRouter } from 'next/navigation';

import AnnouncementList from '@components/AnnouncementList/AnnouncementList'
import ServiceList from '@components/ServiceList/ServiceList'
import AttendanceList from '@components/AttendanceList/AttendanceList'

import { Text, Box } from '@mantine/core';
import Image from 'next/image';
import './styles.css';

export default function Home() {
  const router = useRouter();
  const { user, logout } = useContext(AuthContext);

  // checks whether user is an interact member or a visitor; true if interact member, false if visitor
  const has_permission = user?.permissions.some(element => {
    return [1,2,3,4,5].includes(element)
  })
  // website will return DIFFERENT pages for interact members and visitors
  // for the Announcement, Service and Attendance lists, I created components that are supposed to return summarised versions of these 3 things respectively
  // but I haven't added API calls to the backend yet
  //
  // page shown to visitors just supposed to be an overview of Interact + a call to join
  if (has_permission) {
    return (
      <div className='body'>
        <AnnouncementList number_of_announcements={1}/>
        <ServiceList/>
        <AttendanceList/>
      </div>
    );
  } else {
    return ( 
      <div className='body'>
        <h1>Welcome to Raffles Interact's official website!</h1>
        <div className='image-container'>
          <Image src='/filler_picture.jpg' alt="Group picture of Raffles Interact members" fill={true}/>
        </div>
        <p>You can...</p>
        <ul>
          <li>View recent announcements</li>
          <li>Check your services</li>
          <li>Log your service session hours</li>
          <li>Mark your attendance (or not, with a valid reason)</li>
        </ul>
      </div>
    )
  }
  
}
