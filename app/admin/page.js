import { isAuthenticated } from '../../lib/auth';
import LoginForm from '../../components/LoginForm';
import AdminEditor from '../../components/AdminEditor';

export const dynamic = 'force-dynamic';

export default async function AdminPage() {
  const authed = await isAuthenticated();
  if (!authed) return <LoginForm />;
  return <AdminEditor />;
}
