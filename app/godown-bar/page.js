import './theme.css';
import { getMenu } from '../../lib/blob';
import MenuView from '../../components/MenuView';

export const metadata = {
  title: 'The Godown Bar — Menu',
};

export const dynamic = 'force-dynamic';

export default async function GodownBarPage() {
  const data = await getMenu('godown-bar');
  return <MenuView data={data} slug="godown-bar" />;
}
