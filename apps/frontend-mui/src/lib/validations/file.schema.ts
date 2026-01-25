import { z } from 'zod';

// Allowed file types
export const ALLOWED_IMAGE_TYPES = [
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
];
export const ALLOWED_DOCUMENT_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
];
export const ALLOWED_FILE_TYPES = [
  ...ALLOWED_IMAGE_TYPES,
  ...ALLOWED_DOCUMENT_TYPES,
];

// Max file sizes (in bytes)
export const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB
export const MAX_DOCUMENT_SIZE = 10 * 1024 * 1024; // 10MB
export const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

// File metadata update schema
export const updateFileMetadataSchema = z.object({
  filename: z
    .string()
    .min(1, 'Filename is required')
    .max(255, 'Filename must be less than 255 characters')
    .optional(),
  description: z
    .string()
    .max(500, 'Description must be less than 500 characters')
    .optional(),
});

// File upload validation schema (for client-side validation before upload)
export const fileUploadSchema = z.object({
  file: z.custom<File>(
    (val) => val instanceof File,
    'Please select a valid file',
  ),
  prefix: z.string().optional(),
});

// File filter/search schema
export const fileFilterSchema = z.object({
  search: z.string().optional(),
  mimeType: z.string().optional(),
  minSize: z.number().min(0).optional(),
  maxSize: z.number().min(0).optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(100).default(10),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).optional(),
});

// Batch delete schema
export const batchDeleteFilesSchema = z.object({
  ids: z.array(z.string()).min(1, 'At least one file ID is required'),
});

// Helper function to validate file type
export function isValidFileType(
  file: File,
  allowedTypes: string[] = ALLOWED_FILE_TYPES,
): boolean {
  return allowedTypes.includes(file.type);
}

// Helper function to validate file size
export function isValidFileSize(
  file: File,
  maxSize: number = MAX_FILE_SIZE,
): boolean {
  return file.size <= maxSize;
}

// Helper function to format file size
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// Types
export type UpdateFileMetadataInput = z.infer<typeof updateFileMetadataSchema>;
export type FileUploadInput = z.infer<typeof fileUploadSchema>;
export type FileFilterInput = z.infer<typeof fileFilterSchema>;
export type BatchDeleteFilesInput = z.infer<typeof batchDeleteFilesSchema>;
