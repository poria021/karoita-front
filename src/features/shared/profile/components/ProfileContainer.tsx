'use client';

import { IdCard, ShieldHalf } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

import { PageChrome } from '@/components/shared/PageChrome';
import HydrationSafe from '@/components/shared/HydrationSafe';
import { Skeleton } from '@/components/ui/skeleton';
import { AuthService } from '@/services/auth.service';
import { RouteService } from '@/services/route.service';
import { useUserStore } from '@/store/useUserStore';
import type { UserRole } from '@/types/auth';

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

/** Client master profile shell: Zustand boundary, status alerts, and tab switcher. */
export function ProfileContainer({ role }: ProfileContainerProps) {
  return (
    <HydrationSafe>
      <ProfileContainerInner role={role} />
    </HydrationSafe>
  );
}

function ProfileContainerInner({ role }: ProfileContainerProps) {
  const router = useRouter();
  const activeUser = useUserStore((state) => state.activeUser);
  const [activeTab, setActiveTab] = useState<ProfileTab>('identity');
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
    return <ProfileContainerSkeleton />;
  }

  const uiStrategy = PROFILE_UI_STRATEGY[activeUser.role];

  const statusAlerts =
    uiStrategy.showStatusAlerts ? (
      <ProfileStatusAlert
        approved={activeUser.approved}
        docStatus={activeUser.docStatus}
        adminRequestMessage={activeUser.adminRequestMessage}
      />
    ) : null;

  const identityForm = (
    <IdentityForm
      activeUser={activeUser}
      token={session?.token}
      disabled={activeUser.approved}
    />
  );

  if (uiStrategy.showSecurityTab) {
    return (
      <div dir="rtl" className="w-full font-sans">
        <PageChrome
          mode="tabs"
          tabsModel="underline"
          tabsSize="lg"
          value={activeTab}
          onValueChange={(value) => setActiveTab(value as ProfileTab)}
          banner={statusAlerts}
          tabs={[
            {
              value: 'identity',
              label: 'اطلاعات هویتی',
              icon: <IdCard className="size-4" aria-hidden="true" />,
              content: identityForm,
            },
            {
              value: 'security',
              label: 'تنظیم رمز عبور حساب',
              icon: <ShieldHalf className="size-4" aria-hidden="true" />,
              content: (
                <SecurityForm
                  mobile={activeUser.mobile}
                  hasPassword={activeUser.hasPassword !== false}
                />
              ),
            },
          ]}
        />
      </div>
    );
  }

  return (
    <div dir="rtl" className="w-full space-y-kv-section font-sans">
      {statusAlerts}
      {identityForm}
    </div>
  );
}

/** Smooth skeleton for Suspense / pre-hydration profile loading. */
export function ProfileContainerSkeleton() {
  return (
    <div
      dir="rtl"
      className="w-full space-y-kv-stack font-sans"
      aria-busy="true"
      aria-live="polite"
    >
      <div className="flex gap-kv-inline border-b border-slate-100 pb-3">
        <Skeleton className="h-11 w-32 rounded-md" />
        <Skeleton className="h-11 w-40 rounded-md" />
      </div>

      <Skeleton className="h-20 w-full rounded-2xl" />

      <div className="space-y-kv-group rounded-3xl border border-slate-200 bg-white p-kv-inset sm:p-kv-page">
        <div className="grid grid-cols-1 gap-kv-group sm:grid-cols-2">
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="space-y-2">
              <Skeleton className="h-3 w-24 rounded-md" />
              <Skeleton className="h-11 w-full rounded-xl" />
            </div>
          ))}
        </div>
        <Skeleton className="mt-2 h-32 w-full rounded-2xl" />
        <div className="flex justify-end pt-2">
          <Skeleton className="h-10 w-40 rounded-xl" />
        </div>
      </div>
    </div>
  );
}
