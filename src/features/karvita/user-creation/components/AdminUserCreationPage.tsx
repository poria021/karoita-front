'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

import { KvWorkspace } from '@/components/shared/shell/KvWorkspace';
import { getPostLoginPath } from '@/services/post-login-path';
import { useUserStore } from '@/store/useUserStore';
import { isSuperAdminRole } from '@/utils/RoleStrategyMap';

import { useAdminUserCreationForm } from '../hooks/useAdminUserCreationForm';
import { AdminUserCreationForm } from './AdminUserCreationForm';

export function AdminUserCreationPage() {
  const router = useRouter();
  const activeUser = useUserStore((state) => state.activeUser);
  const page = useAdminUserCreationForm();

  useEffect(() => {
    if (!activeUser) return;
    if (!isSuperAdminRole(activeUser.role)) {
      router.replace(getPostLoginPath(activeUser));
    }
  }, [activeUser, router]);

  if (!activeUser || !isSuperAdminRole(activeUser.role)) {
    return <div className="min-h-40 w-full bg-kv-canvas" aria-busy="true" />;
  }

  return (
    <KvWorkspace panel={false}>
      <AdminUserCreationForm page={page} />
    </KvWorkspace>
  );
}
