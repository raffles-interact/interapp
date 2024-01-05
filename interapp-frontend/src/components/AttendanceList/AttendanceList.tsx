import { Text, Title } from '@mantine/core';
import './styles.css';

export default function AttendanceList(props: any) {
  /* function for getting attendance here */
  /* returns attendancelist variable */
  const tempattendancelist = ['Attendance for day 1', 'Attendance for day 2 has been reported']
  return (
    <div className='attendance-list-container'>
      <Title>Attendance</Title>
      {tempattendancelist.map((attendance) => (
        <Text key={attendance} className='attendance'>{attendance}</Text>
      ))}
    </div>
  );
}
