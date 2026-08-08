import { LandingCmsPage } from '@/features/karvita/landing-cms/components/LandingCmsPage';
import { dashboardModuleMetadata } from '@/lib/dashboard-module-metadata';

export const metadata = dashboardModuleMetadata('landing-cms');

export default function LandingCmsRoutePage() {
  return <LandingCmsPage />;
}
