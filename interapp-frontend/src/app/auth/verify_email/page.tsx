import VerifyStatus from './VerifyStatus';
import './styles.css';
import { Title } from '@mantine/core';

export default async function VerifyEmailPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  return (
    <div className='verify-container'>
      <Title>Verify Email</Title>
      <VerifyStatus token={searchParams.token as string} />
    </div>
  );
}
