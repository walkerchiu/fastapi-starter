// User validations
export {
  createUserSchema,
  updateUserSchema,
  updateProfileSchema,
  changePasswordSchema,
  userFilterSchema,
  type CreateUserInput,
  type UpdateUserInput,
  type UpdateProfileInput,
  type ChangePasswordInput,
  type UserFilterInput,
} from './user.schema';

// Role validations
export {
  createRoleSchema,
  updateRoleSchema,
  updateRolePermissionsSchema,
  roleFilterSchema,
  type CreateRoleInput,
  type UpdateRoleInput,
  type UpdateRolePermissionsInput,
  type RoleFilterInput,
} from './role.schema';

// File validations
export {
  updateFileMetadataSchema,
  fileUploadSchema,
  fileFilterSchema,
  batchDeleteFilesSchema,
  ALLOWED_IMAGE_TYPES,
  ALLOWED_DOCUMENT_TYPES,
  ALLOWED_FILE_TYPES,
  MAX_IMAGE_SIZE,
  MAX_DOCUMENT_SIZE,
  MAX_FILE_SIZE,
  isValidFileType,
  isValidFileSize,
  formatFileSize,
  type UpdateFileMetadataInput,
  type FileUploadInput,
  type FileFilterInput,
  type BatchDeleteFilesInput,
} from './file.schema';

// Product validations
export {
  createProductSchema,
  updateProductSchema,
  productFilterSchema,
  inventoryAdjustmentSchema,
  type CreateProductInput,
  type UpdateProductInput,
  type ProductFilterInput,
  type InventoryAdjustmentInput,
} from './product.schema';

// Order validations
export {
  orderStatusSchema,
  paymentStatusSchema,
  createOrderSchema,
  updateOrderStatusSchema,
  cancelOrderSchema,
  orderFilterSchema,
  refundRequestSchema,
  type OrderStatus,
  type PaymentStatus,
  type CreateOrderInput,
  type UpdateOrderStatusInput,
  type CancelOrderInput,
  type OrderFilterInput,
  type RefundRequestInput,
} from './order.schema';

// Customer validations
export {
  customerStatusSchema,
  customerTierSchema,
  createCustomerSchema,
  updateCustomerSchema,
  addCustomerAddressSchema,
  updateCustomerAddressSchema,
  customerFilterSchema,
  importCustomersSchema,
  type CustomerStatus,
  type CustomerTier,
  type CreateCustomerInput,
  type UpdateCustomerInput,
  type AddCustomerAddressInput,
  type UpdateCustomerAddressInput,
  type CustomerFilterInput,
  type ImportCustomersInput,
} from './customer.schema';

// Ticket validations
export {
  ticketCategorySchema,
  ticketPrioritySchema,
  ticketStatusSchema,
  createTicketSchema,
  replyTicketSchema,
  updateTicketSchema,
  ticketFilterSchema,
  assignTicketSchema,
  closeTicketSchema,
  mergeTicketsSchema,
  type TicketCategory,
  type TicketPriority,
  type TicketStatus,
  type CreateTicketInput,
  type ReplyTicketInput,
  type UpdateTicketInput,
  type TicketFilterInput,
  type AssignTicketInput,
  type CloseTicketInput,
  type MergeTicketsInput,
} from './ticket.schema';

// App validations
export {
  appTypeSchema,
  appStatusSchema,
  createAppSchema,
  updateAppSchema,
  appFilterSchema,
  createApiKeySchema,
  OAUTH_SCOPES,
  type AppType,
  type AppStatus,
  type CreateAppInput,
  type UpdateAppInput,
  type AppFilterInput,
  type CreateApiKeyInput,
  type OAuthScope,
} from './app.schema';

// Webhook validations
export {
  webhookStatusSchema,
  createWebhookSchema,
  updateWebhookSchema,
  webhookFilterSchema,
  testWebhookSchema,
  WEBHOOK_EVENTS,
  type WebhookStatus,
  type CreateWebhookInput,
  type UpdateWebhookInput,
  type WebhookFilterInput,
  type TestWebhookInput,
  type WebhookEvent,
} from './webhook.schema';
