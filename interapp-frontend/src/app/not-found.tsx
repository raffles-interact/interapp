import { redirect } from 'next/navigation';

export default async function NotFoundPage() {
  redirect('/error/404');
}
