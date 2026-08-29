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
        <div className="mx-auto flex w-full max-w-4xl flex-col gap-kv-section">
          <AdminUserCreationForm page={page} />
        </div>
      </KvWorkspace>
    </SuperAdminModuleGuard>
  );
}
