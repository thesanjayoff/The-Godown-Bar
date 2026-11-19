import './theme.css';
import { getMenu } from '../../lib/blob';
import MenuView from '../../components/MenuView';

export const metadata = {
  title: 'Southern Station — Menu',
};

export const dynamic = 'force-dynamic';

export default async function SouthernStationPage() {
  const data = await getMenu('southern-station');
  return <MenuView data={data} slug="southern-station" />;
}
