import { DashboardInfoDynamic } from './_components/dashboard-info-dynamic';

export const metadata = {
  title: 'Dashboard Dynamique - Mariage',
  description: 'Tableau de bord dynamique pour l\'organisation de votre mariage',
};

const DashboardPage = async () => {
  return <DashboardInfoDynamic />;
};

export default DashboardPage;
