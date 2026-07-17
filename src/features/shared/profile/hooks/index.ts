/**
 * Profile hooks barrel export.
 *
 * Provides clean, centralized imports for profile-related custom hooks.
 * Per rule 60 (Multi-Module Isolation), these hooks are shared across domains
 * and live inside `src/features/shared/`.
 */

export { useProfileForm } from './useProfileForm';
export { useOrganizationOptions } from './useOrganizationOptions';
