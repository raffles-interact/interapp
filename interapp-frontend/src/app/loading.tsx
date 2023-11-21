import { Loader, Text } from '@mantine/core';
import './loading.css';

export default function Loading() {
  return (
    <div className='loading-container'>
      <Loader className='loading-loader' color='blue' type='dots' size='xl' />
      <Text className='loading-text'>Hang tight, we're getting the page for you!</Text>
    </div>
  );
}
