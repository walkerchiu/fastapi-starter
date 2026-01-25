export {
  useUsers,
  useUser,
  useCreateUser,
  useUpdateUser,
  useDeleteUser,
  userKeys,
} from './use-users';

export type { User, Role, Permission, File, PaginatedResponse } from './types';

export {
  useFiles,
  useFile,
  useUploadFile,
  useUpdateFile,
  useDeleteFile,
  fileKeys,
} from './use-files';

export {
  useMe,
  useUpdateProfile,
  useChangePassword,
  useRegister,
  useForgotPassword,
  useResetPassword,
  useVerifyEmail,
  useEnable2FA,
  useVerify2FA,
  useDisable2FA,
  useRegenerateBackupCodes,
  authKeys,
} from './use-auth';

export {
  useRoles,
  useRole,
  useRolePermissions,
  useCreateRole,
  useUpdateRole,
  useDeleteRole,
  useReplaceRolePermissions,
  roleKeys,
} from './use-roles';

export {
  usePermissions,
  usePermission,
  useCreatePermission,
  useUpdatePermission,
  useDeletePermission,
  permissionKeys,
} from './use-permissions';

export {
  useAuditLogs,
  useAuditLog,
  auditLogKeys,
  type AuditLog,
  type AuditLogListResponse,
  type AuditLogQueryParams,
} from './use-audit-logs';

export {
  useAnalyticsOverview,
  useRevenueAnalytics,
  useOrdersAnalytics,
  useTrafficAnalytics,
  useTopProducts,
  useTopCustomers,
  useCategoryAnalytics,
  analyticsKeys,
  type AnalyticsOverview,
  type TimeSeriesData,
  type CategoryData,
  type TopProduct,
  type TopCustomer,
  type AnalyticsQueryParams,
} from './use-analytics';
