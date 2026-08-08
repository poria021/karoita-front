import {
  WorkbenchHomeClient,
  type WorkbenchHomeProps,
} from '@/features/karvita/dashboard/components/WorkbenchHomeClient';

/** RSC boundary — quiet workbench home; session chrome hydrates in client leaf. */
export function WorkbenchHome(props: WorkbenchHomeProps) {
  return <WorkbenchHomeClient {...props} />;
}
