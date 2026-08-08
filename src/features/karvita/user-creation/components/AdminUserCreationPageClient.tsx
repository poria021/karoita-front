'use client';

import { SuperAdminModuleGuard } from '@/components/shared/shell/SuperAdminModuleGuard';
import { KvWorkspace } from '@/components/shared/shell/KvWorkspace';

import { useAdminUserCreationForm } from '../hooks/useAdminUserCreationForm';
import { AdminUserCreationForm } from './AdminUserCreationForm';

export function AdminUserCreationPageClient() {
  const page = useAdminUserCreationForm();

  return (
    <SuperAdminModuleGuard>
      <KvWorkspace panel={false}>
        <AdminUserCreationForm page={page} />
      </KvWorkspace>
    </SuperAdminModuleGuard>
  );
}
