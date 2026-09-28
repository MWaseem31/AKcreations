import { redirect } from 'next/navigation';
import { isAdmin } from '@/lib/auth';
import LoginForm from '@/components/LoginForm';
export const dynamic = 'force-dynamic';

export default async function Login() {
  if (await isAdmin()) redirect('/admin');
  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <LoginForm />
    </main>
  );
}
