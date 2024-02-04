import SignUpForm from './signupForm';
import { Text, Title, Paper, Box, Anchor } from '@mantine/core';
import Image from 'next/image';
import './styles.css';

export default function SignUp() {
  return (
    <div className='signup-page'>
      <div className='signup-headers'>
        <Box visibleFrom='sm' className='signup-logo'>
          <Image src='/oneinteract.png' alt='OneInteract Logo' fill={true} />
        </Box>
        <div className='signup-headers-text'>
          <Title className='signup-title'>Sign Up</Title>
          <Text className='signup-text'>
            Create an account to start using OneInteract! Please use the ID number provided by the
            school.
          </Text>
        </div>
      </div>

      <Paper className='signup-form-container' shadow='md'>
        <SignUpForm />
        <Text className='signup-form-already-member'>
          Already a member? <Anchor href='/auth/login'>Login</Anchor>
        </Text>
      </Paper>
    </div>
  );
}
