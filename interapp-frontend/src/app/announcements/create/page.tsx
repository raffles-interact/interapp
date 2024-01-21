import GoBackButton from '@components/GoBackButton/GoBackButton';
import CreateForm from './CreateForm';
import './styles.css';

export default async function CreatePage() {
  return (
    <div className='create-page'>
      <GoBackButton href='/announcements' className='create-go-back-button' />
      <CreateForm />
    </div>
  );
}
