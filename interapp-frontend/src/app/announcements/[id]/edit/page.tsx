import GoBackButton from '@components/GoBackButton/GoBackButton';
import EditForm from './EditForm';
import './styles.css';

export default async function CreatePage() {
  return (
    <div className='edit-page'>
      <GoBackButton href='/announcements' className='create-go-back-button' />
      <EditForm />
    </div>
  );
}
