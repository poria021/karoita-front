'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useEffect } from 'react';

import {
  AppTabs,
  AppTabsContent,
  AppTabsList,
  AppTabsTrigger,
} from '@/components/shared/AppTabs';
import { FaIcon } from '@/components/shared/FaIcon';
import { AuthService } from '@/services/auth.service';
import { RouteService } from '@/services/route.service';
import { useUserStore } from '@/store/useUserStore';
import type { UserRole } from '@/types/auth';
import { faIcons } from '@/utils/iconMap';

import { ProfileStatusAlert } from './alerts/ProfileStatusAlert';
import { IdentityForm } from './forms/IdentityForm';
import { SecurityForm } from './forms/SecurityForm';

type ProfileTab = 'identity' | 'security';

interface ProfileUiStrategy {
  showSecurityTab: boolean;
  showStatusAlerts: boolean;
}

/** Role-driven profile chrome — never branch on `role === '...'` in JSX. */
const PROFILE_UI_STRATEGY: Record<UserRole, ProfileUiStrategy> = {
  student: { showSecurityTab: true, showStatusAlerts: true },
  skill_learner: { showSecurityTab: true, showStatusAlerts: true },
  supervisor_professor: { showSecurityTab: true, showStatusAlerts: true },
  mentor_teacher: { showSecurityTab: true, showStatusAlerts: true },
  school_principal: { showSecurityTab: true, showStatusAlerts: true },
  regional_edu_admin: { showSecurityTab: true, showStatusAlerts: true },
  faculty_role: { showSecurityTab: true, showStatusAlerts: false },
  provincial_university: { showSecurityTab: true, showStatusAlerts: false },
  assistant_admin: { showSecurityTab: true, showStatusAlerts: false },
  central_organization: { showSecurityTab: true, showStatusAlerts: false },
  super_admin: { showSecurityTab: false, showStatusAlerts: false },
};

export interface ProfileContainerProps {
  /** Role segment from the Next.js `[role]` route param. */
  role: string;
}

/** Client master profile shell — layout mirrors original-karvita.html. */
export function ProfileContainer({ role }: ProfileContainerProps) {
  // App layout already gates with HydrationSafe — do not nest another gate.
  return <ProfileContainerInner role={role} />;
}

function ProfileContainerInner({ role }: ProfileContainerProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const activeUser = useUserStore((state) => state.activeUser);
  const session = AuthService.getSession();

  useEffect(() => {
    if (!activeUser) {
      router.replace(RouteService.auth.login());
      return;
    }
    if (activeUser.role !== role) {
      router.replace(RouteService.karvita.profile(activeUser.role));
    }
  }, [activeUser, role, router]);

  if (!activeUser || activeUser.role !== role) {
    return <ProfileRoutePlaceholder />;
  }

  const uiStrategy = PROFILE_UI_STRATEGY[activeUser.role];
  const requestedTab = searchParams.get('tab');
  const activeTab: ProfileTab =
    requestedTab === 'security' && uiStrategy.showSecurityTab
      ? 'security'
      : 'identity';

  const handleTabChange = (value: string) => {
    const nextTab: ProfileTab = value === 'security' ? 'security' : 'identity';
    const params = new URLSearchParams(searchParams.toString());
    params.set('tab', nextTab);
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  };

  const statusAlerts = uiStrategy.showStatusAlerts ? (
    <ProfileStatusAlert
      approved={activeUser.approved}
      docStatus={activeUser.docStatus}
      adminRequestMessage={activeUser.adminRequestMessage}
    />
  ) : null;

  const isProfileLocked =
    activeUser.role !== 'super_admin' &&
    activeUser.docStatus !== 'not_submitted' &&
    activeUser.docStatus !== 'rejected';

  const identityForm = (
    <IdentityForm
      activeUser={activeUser}
      token={session?.token}
      disabled={isProfileLocked}
      statusAlerts={statusAlerts}
    />
  );

  if (!uiStrategy.showSecurityTab) {
    return (
      <div dir="rtl" className="w-full space-y-6 font-sans text-xs">
        {identityForm}
      </div>
    );
  }

  return (
    <div dir="rtl" className="w-full space-y-6 font-sans">
      {/* Capsule tabs — matches original `.kv-tabs-container` */}
      <div className="mb-4 pb-4 pt-1">
        <AppTabs
          value={activeTab}
          onValueChange={handleTabChange}
          className="gap-5"
        >
          <AppTabsList>
            <AppTabsTrigger value="identity">
              <FaIcon icon={faIcons.idCard} size="xs" />
              <span>اطلاعات هویتی و مدارک</span>
            </AppTabsTrigger>
            <AppTabsTrigger value="security">
              <FaIcon icon={faIcons.key} size="xs" />
              <span>تنظیم رمز عبور حساب</span>
            </AppTabsTrigger>
          </AppTabsList>

          <AppTabsContent value="identity">
            {identityForm}
          </AppTabsContent>

          <AppTabsContent value="security">
            <SecurityForm
              mobile={activeUser.mobile}
              hasPassword={activeUser.hasPassword !== false}
            />
          </AppTabsContent>
        </AppTabs>
      </div>
    </div>
  );
}

/** Plain placeholder while redirecting / resolving role — no skeleton UI. */
export function ProfileRoutePlaceholder() {
  return (
    <div
      className="min-h-40 w-full bg-transparent"
      aria-busy="true"
      aria-live="polite"
    />
  );
}
