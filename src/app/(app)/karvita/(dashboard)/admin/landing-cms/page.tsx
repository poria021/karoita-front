import { LandingCmsModule } from '@/features/karvita/landing-cms/components/LandingCmsModule';
import { dashboardModuleMetadata } from '@/lib/dashboard-module-metadata';

export const metadata = dashboardModuleMetadata('landing-cms');

export default function LandingCmsRoutePage() {
  return <LandingCmsModule />;
}
