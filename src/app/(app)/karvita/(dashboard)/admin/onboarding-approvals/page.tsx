import { OnboardingApprovalsModule } from '@/features/karvita/onboarding-approvals/components/OnboardingApprovalsModule';
import { dashboardModuleMetadata } from '@/lib/dashboard-module-metadata';

export const metadata = dashboardModuleMetadata('onboarding-approvals');

export default function OnboardingApprovalsRoutePage() {
  return <OnboardingApprovalsModule />;
}
