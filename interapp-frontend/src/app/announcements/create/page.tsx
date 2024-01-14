import TextEditor from '@components/TextEditor/TextEditor';
import CreateForm from './createForm';
import './styles.css';

async function log(str: string) {
  'use server';
  console.log(str);
}

export default async function CreatePage() {
  return (
    <div className='create-page'>
      <CreateForm />
    </div>
  );
}
