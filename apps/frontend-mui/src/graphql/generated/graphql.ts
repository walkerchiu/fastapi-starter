/* eslint-disable */
import { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core';
export type Maybe<T> = T | null;
export type InputMaybe<T> = T | null | undefined;
export type Exact<T extends { [key: string]: unknown }> = {
  [K in keyof T]: T[K];
};
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & {
  [SubKey in K]?: Maybe<T[SubKey]>;
};
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & {
  [SubKey in K]: Maybe<T[SubKey]>;
};
export type MakeEmpty<
  T extends { [key: string]: unknown },
  K extends keyof T,
> = { [_ in K]?: never };
export type Incremental<T> =
  | T
  | {
      [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never;
    };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: { input: string; output: string };
  String: { input: string; output: string };
  Boolean: { input: boolean; output: boolean };
  Int: { input: number; output: number };
  Float: { input: number; output: number };
  DateTime: { input: any; output: any };
  JSON: { input: any; output: any };
  Upload: { input: any; output: any };
};

/** 使用者活動類型。 */
export enum ActivityType {
  UserCreated = 'USER_CREATED',
  UserDeleted = 'USER_DELETED',
  UserLoggedIn = 'USER_LOGGED_IN',
  UserLoggedOut = 'USER_LOGGED_OUT',
  UserUpdated = 'USER_UPDATED',
}

/** 指派權限輸入。 */
export type AssignPermissionsInput = {
  permissionIds: Array<Scalars['ID']['input']>;
};

/** 指派角色輸入。 */
export type AssignRolesInput = {
  roleIds: Array<Scalars['ID']['input']>;
};

/** 認證回應。 */
export type AuthPayload = {
  __typename?: 'AuthPayload';
  accessToken: Scalars['String']['output'];
  refreshToken: Scalars['String']['output'];
  tokenType: Scalars['String']['output'];
  user?: Maybe<User>;
};

/** 批次刪除檔案輸入。 */
export type BatchDeleteFilesInput = {
  fileIds: Array<Scalars['ID']['input']>;
};

/** 批次檔案刪除回應。 */
export type BatchDeleteFilesResponse = {
  __typename?: 'BatchDeleteFilesResponse';
  errors?: Maybe<Array<Scalars['String']['output']>>;
  failed: Scalars['Int']['output'];
  successful: Scalars['Int']['output'];
};

/** 批次檔案上傳回應。 */
export type BatchFileUploadResponse = {
  __typename?: 'BatchFileUploadResponse';
  failed: Scalars['Int']['output'];
  results: Array<BatchFileUploadResult>;
  successful: Scalars['Int']['output'];
};

/** 批次檔案上傳結果。 */
export type BatchFileUploadResult = {
  __typename?: 'BatchFileUploadResult';
  contentType?: Maybe<Scalars['String']['output']>;
  error?: Maybe<Scalars['String']['output']>;
  filename: Scalars['String']['output'];
  key?: Maybe<Scalars['String']['output']>;
  size?: Maybe<Scalars['Int']['output']>;
  success: Scalars['Boolean']['output'];
  url?: Maybe<Scalars['String']['output']>;
};

/** 變更密碼輸入。 */
export type ChangePasswordInput = {
  currentPassword: Scalars['String']['input'];
  newPassword: Scalars['String']['input'];
};

/** 元件健康狀態。 */
export type ComponentHealth = {
  __typename?: 'ComponentHealth';
  latencyMs?: Maybe<Scalars['Float']['output']>;
  message?: Maybe<Scalars['String']['output']>;
  status: HealthStatus;
};

/** 元件健康項目。 */
export type ComponentHealthEntry = {
  __typename?: 'ComponentHealthEntry';
  health: ComponentHealth;
  name: Scalars['String']['output'];
};

/** 建立權限輸入。 */
export type CreatePermissionInput = {
  code: Scalars['String']['input'];
  description?: InputMaybe<Scalars['String']['input']>;
  name: Scalars['String']['input'];
};

/** 建立角色輸入。 */
export type CreateRoleInput = {
  code: Scalars['String']['input'];
  description?: InputMaybe<Scalars['String']['input']>;
  isSystem?: InputMaybe<Scalars['Boolean']['input']>;
  name: Scalars['String']['input'];
  permissionIds?: InputMaybe<Array<Scalars['ID']['input']>>;
};

/** 建立使用者輸入。 */
export type CreateUserInput = {
  email: Scalars['String']['input'];
  name: Scalars['String']['input'];
};

/** 停用 2FA 輸入。 */
export type Disable2FaInput = {
  password: Scalars['String']['input'];
};

/** 啟用 2FA 輸入。 */
export type Enable2FaInput = {
  code: Scalars['String']['input'];
};

/** 檔案類型。 */
export type File = {
  __typename?: 'File';
  bucket: Scalars['String']['output'];
  contentType: Scalars['String']['output'];
  createdAt: Scalars['DateTime']['output'];
  filename: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  key: Scalars['String']['output'];
  metadata?: Maybe<Scalars['JSON']['output']>;
  size: Scalars['Int']['output'];
  updatedAt: Scalars['DateTime']['output'];
  userId: Scalars['ID']['output'];
};

/** 檔案上傳回應。 */
export type FileUpload = {
  __typename?: 'FileUpload';
  bucket: Scalars['String']['output'];
  contentType?: Maybe<Scalars['String']['output']>;
  filename: Scalars['String']['output'];
  key: Scalars['String']['output'];
  size: Scalars['Int']['output'];
  url?: Maybe<Scalars['String']['output']>;
};

/** 完整健康檢查回應。 */
export type HealthCheck = {
  __typename?: 'HealthCheck';
  components: Array<ComponentHealthEntry>;
  environment: Scalars['String']['output'];
  status: HealthStatus;
  timestamp: Scalars['DateTime']['output'];
  version: Scalars['String']['output'];
};

/** 健康狀態。 */
export enum HealthStatus {
  Degraded = 'DEGRADED',
  Healthy = 'HEALTHY',
  Unhealthy = 'UNHEALTHY',
}

/** Liveness 探針回應。 */
export type LivenessProbe = {
  __typename?: 'LivenessProbe';
  status: Scalars['String']['output'];
};

/** 登入輸入。 */
export type LoginInput = {
  email: Scalars['String']['input'];
  password: Scalars['String']['input'];
};

/** 登入結果（可能需要 2FA）。 */
export type LoginResult = AuthPayload | TwoFactorRequired;

/** 通用訊息回應。 */
export type Message = {
  __typename?: 'Message';
  message: Scalars['String']['output'];
};

export type Mutation = {
  __typename?: 'Mutation';
  /** 新增權限到角色。僅限 Super Admin。 */
  addPermissionToRole: Message;
  /** 批次新增角色給使用者（不替換現有角色）。需要 users:update 權限。 */
  addRolesToUser: Array<Role>;
  /** 批次指派權限給角色（替換現有權限）。僅限 Super Admin。 */
  assignRolePermissions: Array<Permission>;
  /** 指派單一角色給使用者。需要 users:update 權限。 */
  assignRoleToUser: Message;
  /** 批次指派角色給使用者（替換現有角色）。需要 users:update 權限。 */
  assignUserRoles: Array<Role>;
  /** 變更密碼。 */
  changePassword: Message;
  /** 建立權限。僅限 Super Admin。 */
  createPermission: Permission;
  /** 建立角色。僅限 Super Admin。 */
  createRole: Role;
  /** 建立使用者。需要 users:create 權限。 */
  createUser: User;
  /** 軟刪除檔案。需要 files:delete 權限。 */
  deleteFile: Message;
  /** 依 key 軟刪除檔案。需要 files:delete 權限。 */
  deleteFileByKey: Message;
  /** 批次刪除檔案。需要 files:delete 權限。 */
  deleteFiles: BatchDeleteFilesResponse;
  /** 軟刪除權限。僅限 Super Admin。 */
  deletePermission: Message;
  /** 軟刪除角色。僅限 Super Admin。 */
  deleteRole: Message;
  /** 軟刪除使用者。需要 users:delete 權限。 */
  deleteUser: Message;
  /** 停用 2FA。 */
  disable2FA: Message;
  /** 啟用 2FA。 */
  enable2FA: TwoFaEnableResponse;
  /** 永久刪除檔案。僅限 Super Admin。 */
  hardDeleteFile: Scalars['Boolean']['output'];
  /** 依 key 永久刪除檔案。僅限 Super Admin。 */
  hardDeleteFileByKey: Scalars['Boolean']['output'];
  /** 永久刪除權限。僅限 Super Admin。 */
  hardDeletePermission: Scalars['Boolean']['output'];
  /** 永久刪除角色。僅限 Super Admin。 */
  hardDeleteRole: Scalars['Boolean']['output'];
  /** 永久刪除使用者。僅限 Super Admin。 */
  hardDeleteUser: Scalars['Boolean']['output'];
  /** 使用者登入（可能需要 2FA）。 */
  login: LoginResult;
  /** 使用者登出。 */
  logout: Message;
  /** 簡單測試 Mutation。 */
  ping: Scalars['String']['output'];
  /** 刷新 Access Token。 */
  refreshToken: AuthPayload;
  /** 重新產生備份碼。 */
  regenerateBackupCodes: TwoFaEnableResponse;
  /** 註冊新使用者。 */
  register: AuthPayload;
  /** 從角色移除權限。僅限 Super Admin。 */
  removePermissionFromRole: Message;
  /** 移除使用者的單一角色。需要 users:update 權限。 */
  removeRoleFromUser: Message;
  /** 批次移除使用者的角色。需要 users:update 權限。 */
  removeRolesFromUser: Message;
  /** 請求密碼重設。 */
  requestPasswordReset: Message;
  /** 重新發送驗證郵件（未驗證）。 */
  resendVerification: Message;
  /** 重設密碼。 */
  resetPassword: Message;
  /** 還原軟刪除的檔案。需要 files:update 權限。 */
  restoreFile: File;
  /** 依 key 還原軟刪除的檔案。需要 files:update 權限。 */
  restoreFileByKey: File;
  /** 還原軟刪除的權限。僅限 Super Admin。 */
  restorePermission: Permission;
  /** 還原軟刪除的角色。僅限 Super Admin。 */
  restoreRole: Role;
  /** 還原軟刪除的使用者。需要 users:update 權限。 */
  restoreUser: User;
  /** 發送驗證郵件（已驗證使用者）。 */
  sendVerificationEmail: Scalars['Boolean']['output'];
  /** 設定 2FA。 */
  setup2FA: TwoFaSetupResponse;
  /** 更新檔案中繼資料。需要 files:update 權限。 */
  updateFile?: Maybe<File>;
  /** 更新權限。僅限 Super Admin。 */
  updatePermission?: Maybe<Permission>;
  /** 更新個人資料。 */
  updateProfile: User;
  /** 更新角色。僅限 Super Admin。 */
  updateRole?: Maybe<Role>;
  /** 更新使用者。需要 users:update 權限。 */
  updateUser?: Maybe<User>;
  /** 上傳檔案。需要 files:create 權限。 */
  uploadFile: FileUpload;
  /** 批次上傳檔案。需要 files:create 權限。 */
  uploadFiles: BatchFileUploadResponse;
  /** 驗證 2FA 碼（登入時）。 */
  verify2FA: AuthPayload;
  /** 驗證並消耗備份碼（已驗證使用者）。 */
  verify2FABackupCode: Scalars['Boolean']['output'];
  /** 驗證 TOTP 碼（已驗證使用者）。 */
  verify2FACode: Scalars['Boolean']['output'];
  /** 驗證 Email。 */
  verifyEmail: Message;
};

export type MutationAddPermissionToRoleArgs = {
  permissionId: Scalars['ID']['input'];
  roleId: Scalars['ID']['input'];
};

export type MutationAddRolesToUserArgs = {
  input: AssignRolesInput;
  userId: Scalars['ID']['input'];
};

export type MutationAssignRolePermissionsArgs = {
  input: AssignPermissionsInput;
  roleId: Scalars['ID']['input'];
};

export type MutationAssignRoleToUserArgs = {
  roleId: Scalars['ID']['input'];
  userId: Scalars['ID']['input'];
};

export type MutationAssignUserRolesArgs = {
  input: AssignRolesInput;
  userId: Scalars['ID']['input'];
};

export type MutationChangePasswordArgs = {
  input: ChangePasswordInput;
};

export type MutationCreatePermissionArgs = {
  input: CreatePermissionInput;
};

export type MutationCreateRoleArgs = {
  input: CreateRoleInput;
};

export type MutationCreateUserArgs = {
  input: CreateUserInput;
};

export type MutationDeleteFileArgs = {
  id: Scalars['ID']['input'];
};

export type MutationDeleteFileByKeyArgs = {
  key: Scalars['String']['input'];
};

export type MutationDeleteFilesArgs = {
  input: BatchDeleteFilesInput;
};

export type MutationDeletePermissionArgs = {
  id: Scalars['ID']['input'];
};

export type MutationDeleteRoleArgs = {
  id: Scalars['ID']['input'];
};

export type MutationDeleteUserArgs = {
  id: Scalars['ID']['input'];
};

export type MutationDisable2FaArgs = {
  input: Disable2FaInput;
};

export type MutationEnable2FaArgs = {
  input: Enable2FaInput;
};

export type MutationHardDeleteFileArgs = {
  id: Scalars['ID']['input'];
};

export type MutationHardDeleteFileByKeyArgs = {
  key: Scalars['String']['input'];
};

export type MutationHardDeletePermissionArgs = {
  id: Scalars['ID']['input'];
};

export type MutationHardDeleteRoleArgs = {
  id: Scalars['ID']['input'];
};

export type MutationHardDeleteUserArgs = {
  id: Scalars['ID']['input'];
};

export type MutationLoginArgs = {
  input: LoginInput;
};

export type MutationRefreshTokenArgs = {
  input: RefreshTokenInput;
};

export type MutationRegenerateBackupCodesArgs = {
  input: RegenerateBackupCodesInput;
};

export type MutationRegisterArgs = {
  input: RegisterInput;
};

export type MutationRemovePermissionFromRoleArgs = {
  permissionId: Scalars['ID']['input'];
  roleId: Scalars['ID']['input'];
};

export type MutationRemoveRoleFromUserArgs = {
  roleId: Scalars['ID']['input'];
  userId: Scalars['ID']['input'];
};

export type MutationRemoveRolesFromUserArgs = {
  input: AssignRolesInput;
  userId: Scalars['ID']['input'];
};

export type MutationRequestPasswordResetArgs = {
  input: RequestPasswordResetInput;
};

export type MutationResendVerificationArgs = {
  input: ResendVerificationInput;
};

export type MutationResetPasswordArgs = {
  input: ResetPasswordInput;
};

export type MutationRestoreFileArgs = {
  id: Scalars['ID']['input'];
};

export type MutationRestoreFileByKeyArgs = {
  key: Scalars['String']['input'];
};

export type MutationRestorePermissionArgs = {
  id: Scalars['ID']['input'];
};

export type MutationRestoreRoleArgs = {
  id: Scalars['ID']['input'];
};

export type MutationRestoreUserArgs = {
  id: Scalars['ID']['input'];
};

export type MutationUpdateFileArgs = {
  id: Scalars['ID']['input'];
  input: UpdateFileInput;
};

export type MutationUpdatePermissionArgs = {
  id: Scalars['ID']['input'];
  input: UpdatePermissionInput;
};

export type MutationUpdateProfileArgs = {
  input: UpdateProfileInput;
};

export type MutationUpdateRoleArgs = {
  id: Scalars['ID']['input'];
  input: UpdateRoleInput;
};

export type MutationUpdateUserArgs = {
  id: Scalars['ID']['input'];
  input: UpdateUserInput;
};

export type MutationUploadFileArgs = {
  file: Scalars['Upload']['input'];
  prefix?: InputMaybe<Scalars['String']['input']>;
};

export type MutationUploadFilesArgs = {
  files: Array<Scalars['Upload']['input']>;
  prefix?: InputMaybe<Scalars['String']['input']>;
};

export type MutationVerify2FaArgs = {
  input: Verify2FaInput;
};

export type MutationVerify2FaBackupCodeArgs = {
  input: Verify2FaBackupCodeInput;
};

export type MutationVerify2FaCodeArgs = {
  input: Verify2FaCodeInput;
};

export type MutationVerifyEmailArgs = {
  input: VerifyEmailInput;
};

/** 分頁檔案回應。 */
export type PaginatedFiles = {
  __typename?: 'PaginatedFiles';
  hasMore: Scalars['Boolean']['output'];
  items: Array<File>;
  limit: Scalars['Int']['output'];
  skip: Scalars['Int']['output'];
  total: Scalars['Int']['output'];
};

/** 分頁權限回應。 */
export type PaginatedPermissions = {
  __typename?: 'PaginatedPermissions';
  hasMore: Scalars['Boolean']['output'];
  items: Array<Permission>;
  limit: Scalars['Int']['output'];
  skip: Scalars['Int']['output'];
  total: Scalars['Int']['output'];
};

/** 分頁角色回應。 */
export type PaginatedRoles = {
  __typename?: 'PaginatedRoles';
  hasMore: Scalars['Boolean']['output'];
  items: Array<Role>;
  limit: Scalars['Int']['output'];
  skip: Scalars['Int']['output'];
  total: Scalars['Int']['output'];
};

/** 分頁使用者回應。 */
export type PaginatedUsers = {
  __typename?: 'PaginatedUsers';
  hasMore: Scalars['Boolean']['output'];
  items: Array<User>;
  limit: Scalars['Int']['output'];
  skip: Scalars['Int']['output'];
  total: Scalars['Int']['output'];
};

/** 權限類型。 */
export type Permission = {
  __typename?: 'Permission';
  action: Scalars['String']['output'];
  code: Scalars['String']['output'];
  createdAt: Scalars['DateTime']['output'];
  description?: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  name: Scalars['String']['output'];
  resource: Scalars['String']['output'];
  updatedAt: Scalars['DateTime']['output'];
};

/** 預簽 URL 回應。 */
export type PresignedUrl = {
  __typename?: 'PresignedUrl';
  expiresIn: Scalars['Int']['output'];
  url: Scalars['String']['output'];
};

export type Query = {
  __typename?: 'Query';
  /** 取得單一檔案。需要 files:read 權限。 */
  file?: Maybe<File>;
  /** 依 key 取得檔案。需要 files:read 權限。 */
  fileByKey?: Maybe<File>;
  /** 取得檔案列表。需要 files:read 權限。 */
  files: PaginatedFiles;
  /** 完整健康檢查。 */
  health: HealthCheck;
  /** Liveness 探針。 */
  healthLive: LivenessProbe;
  /** Readiness 探針。 */
  healthReady: ReadinessProbe;
  /** 簡單測試查詢。 */
  hello: Scalars['String']['output'];
  /** 取得目前使用者資訊。 */
  me?: Maybe<User>;
  /** 取得單一權限。需要 permissions:read 權限。 */
  permission?: Maybe<Permission>;
  /** 依代碼取得權限。需要 permissions:read 權限。 */
  permissionByCode?: Maybe<Permission>;
  /** 依名稱取得權限。需要 permissions:read 權限。 */
  permissionByName?: Maybe<Permission>;
  /** 取得權限列表。需要 permissions:read 權限。 */
  permissions: PaginatedPermissions;
  /** 取得預簽下載 URL。需要 files:read 權限。 */
  presignedUrl: PresignedUrl;
  /** 依 ID 取得預簽下載 URL。需要 files:read 權限。 */
  presignedUrlById: PresignedUrl;
  /** 取得單一角色。需要 roles:read 權限。 */
  role?: Maybe<Role>;
  /** 依代碼取得角色。需要 roles:read 權限。 */
  roleByCode?: Maybe<Role>;
  /** 依名稱取得角色。需要 roles:read 權限。 */
  roleByName?: Maybe<Role>;
  /** 取得角色的權限。需要 roles:read 權限。 */
  rolePermissions: Array<Permission>;
  /** 取得角色列表。需要 roles:read 權限。 */
  roles: PaginatedRoles;
  /** 取得單一使用者。需要 users:read 權限。 */
  user?: Maybe<User>;
  /** 取得使用者的所有權限。需要 users:read 權限。 */
  userPermissions: Array<Permission>;
  /** 取得使用者的角色。需要 users:read 權限。 */
  userRoles: Array<Role>;
  /** 取得使用者（含角色）。需要 users:read 權限。 */
  userWithRoles?: Maybe<UserWithRoles>;
  /** 取得使用者列表。需要 users:read 權限。 */
  users: PaginatedUsers;
};

export type QueryFileArgs = {
  id: Scalars['ID']['input'];
};

export type QueryFileByKeyArgs = {
  key: Scalars['String']['input'];
};

export type QueryFilesArgs = {
  limit?: InputMaybe<Scalars['Int']['input']>;
  skip?: InputMaybe<Scalars['Int']['input']>;
};

export type QueryPermissionArgs = {
  id: Scalars['ID']['input'];
};

export type QueryPermissionByCodeArgs = {
  code: Scalars['String']['input'];
};

export type QueryPermissionByNameArgs = {
  name: Scalars['String']['input'];
};

export type QueryPermissionsArgs = {
  limit?: InputMaybe<Scalars['Int']['input']>;
  skip?: InputMaybe<Scalars['Int']['input']>;
};

export type QueryPresignedUrlArgs = {
  expiresIn?: InputMaybe<Scalars['Int']['input']>;
  key: Scalars['String']['input'];
};

export type QueryPresignedUrlByIdArgs = {
  expiresIn?: InputMaybe<Scalars['Int']['input']>;
  id: Scalars['ID']['input'];
};

export type QueryRoleArgs = {
  id: Scalars['ID']['input'];
};

export type QueryRoleByCodeArgs = {
  code: Scalars['String']['input'];
};

export type QueryRoleByNameArgs = {
  name: Scalars['String']['input'];
};

export type QueryRolePermissionsArgs = {
  roleId: Scalars['ID']['input'];
};

export type QueryRolesArgs = {
  limit?: InputMaybe<Scalars['Int']['input']>;
  skip?: InputMaybe<Scalars['Int']['input']>;
};

export type QueryUserArgs = {
  id: Scalars['ID']['input'];
};

export type QueryUserPermissionsArgs = {
  userId: Scalars['ID']['input'];
};

export type QueryUserRolesArgs = {
  userId: Scalars['ID']['input'];
};

export type QueryUserWithRolesArgs = {
  id: Scalars['ID']['input'];
};

export type QueryUsersArgs = {
  limit?: InputMaybe<Scalars['Int']['input']>;
  skip?: InputMaybe<Scalars['Int']['input']>;
};

/** Readiness 探針回應。 */
export type ReadinessProbe = {
  __typename?: 'ReadinessProbe';
  status: Scalars['String']['output'];
};

/** 刷新 Token 輸入。 */
export type RefreshTokenInput = {
  refreshToken: Scalars['String']['input'];
};

/** 重新產生備份碼輸入。 */
export type RegenerateBackupCodesInput = {
  password: Scalars['String']['input'];
};

/** 註冊輸入。 */
export type RegisterInput = {
  email: Scalars['String']['input'];
  name: Scalars['String']['input'];
  password: Scalars['String']['input'];
};

/** 請求密碼重設輸入。 */
export type RequestPasswordResetInput = {
  email: Scalars['String']['input'];
};

/** 重新發送驗證郵件輸入。 */
export type ResendVerificationInput = {
  email: Scalars['String']['input'];
};

/** 重設密碼輸入。 */
export type ResetPasswordInput = {
  newPassword: Scalars['String']['input'];
  token: Scalars['String']['input'];
};

/** 角色類型。 */
export type Role = {
  __typename?: 'Role';
  code: Scalars['String']['output'];
  createdAt: Scalars['DateTime']['output'];
  description?: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  isSystem: Scalars['Boolean']['output'];
  name: Scalars['String']['output'];
  permissions: Array<Permission>;
  updatedAt: Scalars['DateTime']['output'];
};

export type Subscription = {
  __typename?: 'Subscription';
  /** 倒數計時（測試用）。 */
  countdown: Scalars['Int']['output'];
  /** 使用者活動事件流。 */
  userActivities: UserActivity;
};

export type SubscriptionCountdownArgs = {
  start?: InputMaybe<Scalars['Int']['input']>;
};

/** 2FA 啟用回應（含備份碼）。 */
export type TwoFaEnableResponse = {
  __typename?: 'TwoFAEnableResponse';
  backupCodes: Array<Scalars['String']['output']>;
};

/** 2FA 設定回應。 */
export type TwoFaSetupResponse = {
  __typename?: 'TwoFASetupResponse';
  qrCodeDataUrl?: Maybe<Scalars['String']['output']>;
  qrCodeUrl: Scalars['String']['output'];
  secret: Scalars['String']['output'];
};

/** 需要 2FA 驗證回應。 */
export type TwoFactorRequired = {
  __typename?: 'TwoFactorRequired';
  requiresTwoFactor: Scalars['Boolean']['output'];
  userId: Scalars['ID']['output'];
};

/** 更新檔案輸入。 */
export type UpdateFileInput = {
  filename?: InputMaybe<Scalars['String']['input']>;
  metadata?: InputMaybe<Scalars['JSON']['input']>;
};

/** 更新權限輸入。 */
export type UpdatePermissionInput = {
  code?: InputMaybe<Scalars['String']['input']>;
  description?: InputMaybe<Scalars['String']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
};

/** 更新個人資料輸入。 */
export type UpdateProfileInput = {
  name: Scalars['String']['input'];
};

/** 更新角色輸入。 */
export type UpdateRoleInput = {
  code?: InputMaybe<Scalars['String']['input']>;
  description?: InputMaybe<Scalars['String']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
  permissionIds?: InputMaybe<Array<Scalars['ID']['input']>>;
};

/** 更新使用者輸入。 */
export type UpdateUserInput = {
  email?: InputMaybe<Scalars['String']['input']>;
  isActive?: InputMaybe<Scalars['Boolean']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
};

/** 使用者類型。 */
export type User = {
  __typename?: 'User';
  createdAt: Scalars['DateTime']['output'];
  email: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  isActive: Scalars['Boolean']['output'];
  isEmailVerified: Scalars['Boolean']['output'];
  isTwoFactorEnabled: Scalars['Boolean']['output'];
  name: Scalars['String']['output'];
  roles: Array<Role>;
  updatedAt: Scalars['DateTime']['output'];
};

/** 使用者活動事件。 */
export type UserActivity = {
  __typename?: 'UserActivity';
  activityType: ActivityType;
  email?: Maybe<Scalars['String']['output']>;
  message: Scalars['String']['output'];
  timestamp: Scalars['DateTime']['output'];
  userId?: Maybe<Scalars['ID']['output']>;
};

/** 使用者類型（含角色，用於 eager loading）。 */
export type UserWithRoles = {
  __typename?: 'UserWithRoles';
  createdAt: Scalars['DateTime']['output'];
  email: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  isActive: Scalars['Boolean']['output'];
  isEmailVerified: Scalars['Boolean']['output'];
  isTwoFactorEnabled: Scalars['Boolean']['output'];
  name: Scalars['String']['output'];
  roles: Array<Role>;
  updatedAt: Scalars['DateTime']['output'];
};

/** 驗證備份碼輸入（已驗證使用者）。 */
export type Verify2FaBackupCodeInput = {
  code: Scalars['String']['input'];
};

/** 驗證 2FA 碼輸入（已驗證使用者）。 */
export type Verify2FaCodeInput = {
  code: Scalars['String']['input'];
};

/** 驗證 2FA 輸入（登入時）。 */
export type Verify2FaInput = {
  code: Scalars['String']['input'];
  isBackupCode?: InputMaybe<Scalars['Boolean']['input']>;
  userId: Scalars['ID']['input'];
};

/** 驗證 Email 輸入。 */
export type VerifyEmailInput = {
  token: Scalars['String']['input'];
};

export type MeQueryVariables = Exact<{ [key: string]: never }>;

export type MeQuery = {
  __typename?: 'Query';
  me?: {
    __typename?: 'User';
    id: string;
    email: string;
    name: string;
    isActive: boolean;
    isEmailVerified: boolean;
    isTwoFactorEnabled: boolean;
    createdAt: any;
    updatedAt: any;
  } | null;
};

export type HelloQueryVariables = Exact<{ [key: string]: never }>;

export type HelloQuery = { __typename?: 'Query'; hello: string };

export type UsersQueryVariables = Exact<{
  skip?: InputMaybe<Scalars['Int']['input']>;
  limit?: InputMaybe<Scalars['Int']['input']>;
}>;

export type UsersQuery = {
  __typename?: 'Query';
  users: {
    __typename?: 'PaginatedUsers';
    total: number;
    skip: number;
    limit: number;
    hasMore: boolean;
    items: Array<{
      __typename?: 'User';
      id: string;
      email: string;
      name: string;
      isActive: boolean;
      createdAt: any;
      updatedAt: any;
    }>;
  };
};

export type UserQueryVariables = Exact<{
  id: Scalars['ID']['input'];
}>;

export type UserQuery = {
  __typename?: 'Query';
  user?: {
    __typename?: 'User';
    id: string;
    email: string;
    name: string;
    isActive: boolean;
    createdAt: any;
    updatedAt: any;
  } | null;
};

export type RegisterMutationVariables = Exact<{
  input: RegisterInput;
}>;

export type RegisterMutation = {
  __typename?: 'Mutation';
  register: {
    __typename?: 'AuthPayload';
    accessToken: string;
    refreshToken: string;
    tokenType: string;
    user?: {
      __typename?: 'User';
      id: string;
      email: string;
      name: string;
      isActive: boolean;
    } | null;
  };
};

export type LoginMutationVariables = Exact<{
  input: LoginInput;
}>;

export type LoginMutation = {
  __typename?: 'Mutation';
  login:
    | {
        __typename?: 'AuthPayload';
        accessToken: string;
        refreshToken: string;
        tokenType: string;
        user?: {
          __typename?: 'User';
          id: string;
          email: string;
          name: string;
          isActive: boolean;
        } | null;
      }
    | {
        __typename?: 'TwoFactorRequired';
        requiresTwoFactor: boolean;
        userId: string;
      };
};

export type RefreshTokenMutationVariables = Exact<{
  input: RefreshTokenInput;
}>;

export type RefreshTokenMutation = {
  __typename?: 'Mutation';
  refreshToken: {
    __typename?: 'AuthPayload';
    accessToken: string;
    refreshToken: string;
    tokenType: string;
  };
};

export type CreateUserMutationVariables = Exact<{
  input: CreateUserInput;
}>;

export type CreateUserMutation = {
  __typename?: 'Mutation';
  createUser: {
    __typename?: 'User';
    id: string;
    email: string;
    name: string;
    isActive: boolean;
  };
};

export type UpdateUserMutationVariables = Exact<{
  id: Scalars['ID']['input'];
  input: UpdateUserInput;
}>;

export type UpdateUserMutation = {
  __typename?: 'Mutation';
  updateUser?: {
    __typename?: 'User';
    id: string;
    email: string;
    name: string;
    isActive: boolean;
  } | null;
};

export type DeleteUserMutationVariables = Exact<{
  id: Scalars['ID']['input'];
}>;

export type DeleteUserMutation = {
  __typename?: 'Mutation';
  deleteUser: { __typename?: 'Message'; message: string };
};

export type UpdateProfileMutationVariables = Exact<{
  input: UpdateProfileInput;
}>;

export type UpdateProfileMutation = {
  __typename?: 'Mutation';
  updateProfile: {
    __typename?: 'User';
    id: string;
    email: string;
    name: string;
    isActive: boolean;
    createdAt: any;
    updatedAt: any;
  };
};

export type ChangePasswordMutationVariables = Exact<{
  input: ChangePasswordInput;
}>;

export type ChangePasswordMutation = {
  __typename?: 'Mutation';
  changePassword: { __typename?: 'Message'; message: string };
};

export type RequestPasswordResetMutationVariables = Exact<{
  input: RequestPasswordResetInput;
}>;

export type RequestPasswordResetMutation = {
  __typename?: 'Mutation';
  requestPasswordReset: { __typename?: 'Message'; message: string };
};

export type ResetPasswordMutationVariables = Exact<{
  input: ResetPasswordInput;
}>;

export type ResetPasswordMutation = {
  __typename?: 'Mutation';
  resetPassword: { __typename?: 'Message'; message: string };
};

export type VerifyEmailMutationVariables = Exact<{
  input: VerifyEmailInput;
}>;

export type VerifyEmailMutation = {
  __typename?: 'Mutation';
  verifyEmail: { __typename?: 'Message'; message: string };
};

export type ResendVerificationMutationVariables = Exact<{
  input: ResendVerificationInput;
}>;

export type ResendVerificationMutation = {
  __typename?: 'Mutation';
  resendVerification: { __typename?: 'Message'; message: string };
};

export type Setup2FaMutationVariables = Exact<{ [key: string]: never }>;

export type Setup2FaMutation = {
  __typename?: 'Mutation';
  setup2FA: {
    __typename?: 'TwoFASetupResponse';
    secret: string;
    qrCodeUrl: string;
    qrCodeDataUrl?: string | null;
  };
};

export type Enable2FaMutationVariables = Exact<{
  input: Enable2FaInput;
}>;

export type Enable2FaMutation = {
  __typename?: 'Mutation';
  enable2FA: { __typename?: 'TwoFAEnableResponse'; backupCodes: Array<string> };
};

export type Disable2FaMutationVariables = Exact<{
  input: Disable2FaInput;
}>;

export type Disable2FaMutation = {
  __typename?: 'Mutation';
  disable2FA: { __typename?: 'Message'; message: string };
};

export type Verify2FaMutationVariables = Exact<{
  input: Verify2FaInput;
}>;

export type Verify2FaMutation = {
  __typename?: 'Mutation';
  verify2FA: {
    __typename?: 'AuthPayload';
    accessToken: string;
    refreshToken: string;
    tokenType: string;
  };
};

export type RegenerateBackupCodesMutationVariables = Exact<{
  input: RegenerateBackupCodesInput;
}>;

export type RegenerateBackupCodesMutation = {
  __typename?: 'Mutation';
  regenerateBackupCodes: {
    __typename?: 'TwoFAEnableResponse';
    backupCodes: Array<string>;
  };
};

export const MeDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'query',
      name: { kind: 'Name', value: 'Me' },
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'me' },
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                { kind: 'Field', name: { kind: 'Name', value: 'email' } },
                { kind: 'Field', name: { kind: 'Name', value: 'name' } },
                { kind: 'Field', name: { kind: 'Name', value: 'isActive' } },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'isEmailVerified' },
                },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'isTwoFactorEnabled' },
                },
                { kind: 'Field', name: { kind: 'Name', value: 'createdAt' } },
                { kind: 'Field', name: { kind: 'Name', value: 'updatedAt' } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<MeQuery, MeQueryVariables>;
export const HelloDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'query',
      name: { kind: 'Name', value: 'Hello' },
      selectionSet: {
        kind: 'SelectionSet',
        selections: [{ kind: 'Field', name: { kind: 'Name', value: 'hello' } }],
      },
    },
  ],
} as unknown as DocumentNode<HelloQuery, HelloQueryVariables>;
export const UsersDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'query',
      name: { kind: 'Name', value: 'Users' },
      variableDefinitions: [
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'skip' } },
          type: { kind: 'NamedType', name: { kind: 'Name', value: 'Int' } },
        },
        {
          kind: 'VariableDefinition',
          variable: {
            kind: 'Variable',
            name: { kind: 'Name', value: 'limit' },
          },
          type: { kind: 'NamedType', name: { kind: 'Name', value: 'Int' } },
        },
      ],
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'users' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'skip' },
                value: {
                  kind: 'Variable',
                  name: { kind: 'Name', value: 'skip' },
                },
              },
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'limit' },
                value: {
                  kind: 'Variable',
                  name: { kind: 'Name', value: 'limit' },
                },
              },
            ],
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'items' },
                  selectionSet: {
                    kind: 'SelectionSet',
                    selections: [
                      { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                      { kind: 'Field', name: { kind: 'Name', value: 'email' } },
                      { kind: 'Field', name: { kind: 'Name', value: 'name' } },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'isActive' },
                      },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'createdAt' },
                      },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'updatedAt' },
                      },
                    ],
                  },
                },
                { kind: 'Field', name: { kind: 'Name', value: 'total' } },
                { kind: 'Field', name: { kind: 'Name', value: 'skip' } },
                { kind: 'Field', name: { kind: 'Name', value: 'limit' } },
                { kind: 'Field', name: { kind: 'Name', value: 'hasMore' } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<UsersQuery, UsersQueryVariables>;
export const UserDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'query',
      name: { kind: 'Name', value: 'User' },
      variableDefinitions: [
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'id' } },
          type: {
            kind: 'NonNullType',
            type: { kind: 'NamedType', name: { kind: 'Name', value: 'ID' } },
          },
        },
      ],
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'user' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'id' },
                value: {
                  kind: 'Variable',
                  name: { kind: 'Name', value: 'id' },
                },
              },
            ],
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                { kind: 'Field', name: { kind: 'Name', value: 'email' } },
                { kind: 'Field', name: { kind: 'Name', value: 'name' } },
                { kind: 'Field', name: { kind: 'Name', value: 'isActive' } },
                { kind: 'Field', name: { kind: 'Name', value: 'createdAt' } },
                { kind: 'Field', name: { kind: 'Name', value: 'updatedAt' } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<UserQuery, UserQueryVariables>;
export const RegisterDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'mutation',
      name: { kind: 'Name', value: 'Register' },
      variableDefinitions: [
        {
          kind: 'VariableDefinition',
          variable: {
            kind: 'Variable',
            name: { kind: 'Name', value: 'input' },
          },
          type: {
            kind: 'NonNullType',
            type: {
              kind: 'NamedType',
              name: { kind: 'Name', value: 'RegisterInput' },
            },
          },
        },
      ],
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'register' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'input' },
                value: {
                  kind: 'Variable',
                  name: { kind: 'Name', value: 'input' },
                },
              },
            ],
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'accessToken' } },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'refreshToken' },
                },
                { kind: 'Field', name: { kind: 'Name', value: 'tokenType' } },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'user' },
                  selectionSet: {
                    kind: 'SelectionSet',
                    selections: [
                      { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                      { kind: 'Field', name: { kind: 'Name', value: 'email' } },
                      { kind: 'Field', name: { kind: 'Name', value: 'name' } },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'isActive' },
                      },
                    ],
                  },
                },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<RegisterMutation, RegisterMutationVariables>;
export const LoginDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'mutation',
      name: { kind: 'Name', value: 'Login' },
      variableDefinitions: [
        {
          kind: 'VariableDefinition',
          variable: {
            kind: 'Variable',
            name: { kind: 'Name', value: 'input' },
          },
          type: {
            kind: 'NonNullType',
            type: {
              kind: 'NamedType',
              name: { kind: 'Name', value: 'LoginInput' },
            },
          },
        },
      ],
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'login' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'input' },
                value: {
                  kind: 'Variable',
                  name: { kind: 'Name', value: 'input' },
                },
              },
            ],
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                {
                  kind: 'InlineFragment',
                  typeCondition: {
                    kind: 'NamedType',
                    name: { kind: 'Name', value: 'AuthPayload' },
                  },
                  selectionSet: {
                    kind: 'SelectionSet',
                    selections: [
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'accessToken' },
                      },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'refreshToken' },
                      },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'tokenType' },
                      },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'user' },
                        selectionSet: {
                          kind: 'SelectionSet',
                          selections: [
                            {
                              kind: 'Field',
                              name: { kind: 'Name', value: 'id' },
                            },
                            {
                              kind: 'Field',
                              name: { kind: 'Name', value: 'email' },
                            },
                            {
                              kind: 'Field',
                              name: { kind: 'Name', value: 'name' },
                            },
                            {
                              kind: 'Field',
                              name: { kind: 'Name', value: 'isActive' },
                            },
                          ],
                        },
                      },
                    ],
                  },
                },
                {
                  kind: 'InlineFragment',
                  typeCondition: {
                    kind: 'NamedType',
                    name: { kind: 'Name', value: 'TwoFactorRequired' },
                  },
                  selectionSet: {
                    kind: 'SelectionSet',
                    selections: [
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'requiresTwoFactor' },
                      },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'userId' },
                      },
                    ],
                  },
                },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<LoginMutation, LoginMutationVariables>;
export const RefreshTokenDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'mutation',
      name: { kind: 'Name', value: 'RefreshToken' },
      variableDefinitions: [
        {
          kind: 'VariableDefinition',
          variable: {
            kind: 'Variable',
            name: { kind: 'Name', value: 'input' },
          },
          type: {
            kind: 'NonNullType',
            type: {
              kind: 'NamedType',
              name: { kind: 'Name', value: 'RefreshTokenInput' },
            },
          },
        },
      ],
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'refreshToken' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'input' },
                value: {
                  kind: 'Variable',
                  name: { kind: 'Name', value: 'input' },
                },
              },
            ],
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'accessToken' } },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'refreshToken' },
                },
                { kind: 'Field', name: { kind: 'Name', value: 'tokenType' } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  RefreshTokenMutation,
  RefreshTokenMutationVariables
>;
export const CreateUserDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'mutation',
      name: { kind: 'Name', value: 'CreateUser' },
      variableDefinitions: [
        {
          kind: 'VariableDefinition',
          variable: {
            kind: 'Variable',
            name: { kind: 'Name', value: 'input' },
          },
          type: {
            kind: 'NonNullType',
            type: {
              kind: 'NamedType',
              name: { kind: 'Name', value: 'CreateUserInput' },
            },
          },
        },
      ],
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'createUser' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'input' },
                value: {
                  kind: 'Variable',
                  name: { kind: 'Name', value: 'input' },
                },
              },
            ],
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                { kind: 'Field', name: { kind: 'Name', value: 'email' } },
                { kind: 'Field', name: { kind: 'Name', value: 'name' } },
                { kind: 'Field', name: { kind: 'Name', value: 'isActive' } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<CreateUserMutation, CreateUserMutationVariables>;
export const UpdateUserDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'mutation',
      name: { kind: 'Name', value: 'UpdateUser' },
      variableDefinitions: [
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'id' } },
          type: {
            kind: 'NonNullType',
            type: { kind: 'NamedType', name: { kind: 'Name', value: 'ID' } },
          },
        },
        {
          kind: 'VariableDefinition',
          variable: {
            kind: 'Variable',
            name: { kind: 'Name', value: 'input' },
          },
          type: {
            kind: 'NonNullType',
            type: {
              kind: 'NamedType',
              name: { kind: 'Name', value: 'UpdateUserInput' },
            },
          },
        },
      ],
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'updateUser' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'id' },
                value: {
                  kind: 'Variable',
                  name: { kind: 'Name', value: 'id' },
                },
              },
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'input' },
                value: {
                  kind: 'Variable',
                  name: { kind: 'Name', value: 'input' },
                },
              },
            ],
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                { kind: 'Field', name: { kind: 'Name', value: 'email' } },
                { kind: 'Field', name: { kind: 'Name', value: 'name' } },
                { kind: 'Field', name: { kind: 'Name', value: 'isActive' } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<UpdateUserMutation, UpdateUserMutationVariables>;
export const DeleteUserDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'mutation',
      name: { kind: 'Name', value: 'DeleteUser' },
      variableDefinitions: [
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'id' } },
          type: {
            kind: 'NonNullType',
            type: { kind: 'NamedType', name: { kind: 'Name', value: 'ID' } },
          },
        },
      ],
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'deleteUser' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'id' },
                value: {
                  kind: 'Variable',
                  name: { kind: 'Name', value: 'id' },
                },
              },
            ],
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'message' } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<DeleteUserMutation, DeleteUserMutationVariables>;
export const UpdateProfileDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'mutation',
      name: { kind: 'Name', value: 'UpdateProfile' },
      variableDefinitions: [
        {
          kind: 'VariableDefinition',
          variable: {
            kind: 'Variable',
            name: { kind: 'Name', value: 'input' },
          },
          type: {
            kind: 'NonNullType',
            type: {
              kind: 'NamedType',
              name: { kind: 'Name', value: 'UpdateProfileInput' },
            },
          },
        },
      ],
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'updateProfile' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'input' },
                value: {
                  kind: 'Variable',
                  name: { kind: 'Name', value: 'input' },
                },
              },
            ],
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                { kind: 'Field', name: { kind: 'Name', value: 'email' } },
                { kind: 'Field', name: { kind: 'Name', value: 'name' } },
                { kind: 'Field', name: { kind: 'Name', value: 'isActive' } },
                { kind: 'Field', name: { kind: 'Name', value: 'createdAt' } },
                { kind: 'Field', name: { kind: 'Name', value: 'updatedAt' } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  UpdateProfileMutation,
  UpdateProfileMutationVariables
>;
export const ChangePasswordDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'mutation',
      name: { kind: 'Name', value: 'ChangePassword' },
      variableDefinitions: [
        {
          kind: 'VariableDefinition',
          variable: {
            kind: 'Variable',
            name: { kind: 'Name', value: 'input' },
          },
          type: {
            kind: 'NonNullType',
            type: {
              kind: 'NamedType',
              name: { kind: 'Name', value: 'ChangePasswordInput' },
            },
          },
        },
      ],
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'changePassword' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'input' },
                value: {
                  kind: 'Variable',
                  name: { kind: 'Name', value: 'input' },
                },
              },
            ],
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'message' } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  ChangePasswordMutation,
  ChangePasswordMutationVariables
>;
export const RequestPasswordResetDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'mutation',
      name: { kind: 'Name', value: 'RequestPasswordReset' },
      variableDefinitions: [
        {
          kind: 'VariableDefinition',
          variable: {
            kind: 'Variable',
            name: { kind: 'Name', value: 'input' },
          },
          type: {
            kind: 'NonNullType',
            type: {
              kind: 'NamedType',
              name: { kind: 'Name', value: 'RequestPasswordResetInput' },
            },
          },
        },
      ],
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'requestPasswordReset' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'input' },
                value: {
                  kind: 'Variable',
                  name: { kind: 'Name', value: 'input' },
                },
              },
            ],
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'message' } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  RequestPasswordResetMutation,
  RequestPasswordResetMutationVariables
>;
export const ResetPasswordDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'mutation',
      name: { kind: 'Name', value: 'ResetPassword' },
      variableDefinitions: [
        {
          kind: 'VariableDefinition',
          variable: {
            kind: 'Variable',
            name: { kind: 'Name', value: 'input' },
          },
          type: {
            kind: 'NonNullType',
            type: {
              kind: 'NamedType',
              name: { kind: 'Name', value: 'ResetPasswordInput' },
            },
          },
        },
      ],
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'resetPassword' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'input' },
                value: {
                  kind: 'Variable',
                  name: { kind: 'Name', value: 'input' },
                },
              },
            ],
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'message' } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  ResetPasswordMutation,
  ResetPasswordMutationVariables
>;
export const VerifyEmailDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'mutation',
      name: { kind: 'Name', value: 'VerifyEmail' },
      variableDefinitions: [
        {
          kind: 'VariableDefinition',
          variable: {
            kind: 'Variable',
            name: { kind: 'Name', value: 'input' },
          },
          type: {
            kind: 'NonNullType',
            type: {
              kind: 'NamedType',
              name: { kind: 'Name', value: 'VerifyEmailInput' },
            },
          },
        },
      ],
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'verifyEmail' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'input' },
                value: {
                  kind: 'Variable',
                  name: { kind: 'Name', value: 'input' },
                },
              },
            ],
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'message' } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<VerifyEmailMutation, VerifyEmailMutationVariables>;
export const ResendVerificationDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'mutation',
      name: { kind: 'Name', value: 'ResendVerification' },
      variableDefinitions: [
        {
          kind: 'VariableDefinition',
          variable: {
            kind: 'Variable',
            name: { kind: 'Name', value: 'input' },
          },
          type: {
            kind: 'NonNullType',
            type: {
              kind: 'NamedType',
              name: { kind: 'Name', value: 'ResendVerificationInput' },
            },
          },
        },
      ],
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'resendVerification' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'input' },
                value: {
                  kind: 'Variable',
                  name: { kind: 'Name', value: 'input' },
                },
              },
            ],
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'message' } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  ResendVerificationMutation,
  ResendVerificationMutationVariables
>;
export const Setup2FaDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'mutation',
      name: { kind: 'Name', value: 'Setup2FA' },
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'setup2FA' },
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'secret' } },
                { kind: 'Field', name: { kind: 'Name', value: 'qrCodeUrl' } },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'qrCodeDataUrl' },
                },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<Setup2FaMutation, Setup2FaMutationVariables>;
export const Enable2FaDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'mutation',
      name: { kind: 'Name', value: 'Enable2FA' },
      variableDefinitions: [
        {
          kind: 'VariableDefinition',
          variable: {
            kind: 'Variable',
            name: { kind: 'Name', value: 'input' },
          },
          type: {
            kind: 'NonNullType',
            type: {
              kind: 'NamedType',
              name: { kind: 'Name', value: 'Enable2FAInput' },
            },
          },
        },
      ],
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'enable2FA' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'input' },
                value: {
                  kind: 'Variable',
                  name: { kind: 'Name', value: 'input' },
                },
              },
            ],
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'backupCodes' } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<Enable2FaMutation, Enable2FaMutationVariables>;
export const Disable2FaDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'mutation',
      name: { kind: 'Name', value: 'Disable2FA' },
      variableDefinitions: [
        {
          kind: 'VariableDefinition',
          variable: {
            kind: 'Variable',
            name: { kind: 'Name', value: 'input' },
          },
          type: {
            kind: 'NonNullType',
            type: {
              kind: 'NamedType',
              name: { kind: 'Name', value: 'Disable2FAInput' },
            },
          },
        },
      ],
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'disable2FA' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'input' },
                value: {
                  kind: 'Variable',
                  name: { kind: 'Name', value: 'input' },
                },
              },
            ],
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'message' } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<Disable2FaMutation, Disable2FaMutationVariables>;
export const Verify2FaDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'mutation',
      name: { kind: 'Name', value: 'Verify2FA' },
      variableDefinitions: [
        {
          kind: 'VariableDefinition',
          variable: {
            kind: 'Variable',
            name: { kind: 'Name', value: 'input' },
          },
          type: {
            kind: 'NonNullType',
            type: {
              kind: 'NamedType',
              name: { kind: 'Name', value: 'Verify2FAInput' },
            },
          },
        },
      ],
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'verify2FA' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'input' },
                value: {
                  kind: 'Variable',
                  name: { kind: 'Name', value: 'input' },
                },
              },
            ],
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'accessToken' } },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'refreshToken' },
                },
                { kind: 'Field', name: { kind: 'Name', value: 'tokenType' } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<Verify2FaMutation, Verify2FaMutationVariables>;
export const RegenerateBackupCodesDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'mutation',
      name: { kind: 'Name', value: 'RegenerateBackupCodes' },
      variableDefinitions: [
        {
          kind: 'VariableDefinition',
          variable: {
            kind: 'Variable',
            name: { kind: 'Name', value: 'input' },
          },
          type: {
            kind: 'NonNullType',
            type: {
              kind: 'NamedType',
              name: { kind: 'Name', value: 'RegenerateBackupCodesInput' },
            },
          },
        },
      ],
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'regenerateBackupCodes' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'input' },
                value: {
                  kind: 'Variable',
                  name: { kind: 'Name', value: 'input' },
                },
              },
            ],
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'backupCodes' } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  RegenerateBackupCodesMutation,
  RegenerateBackupCodesMutationVariables
>;
