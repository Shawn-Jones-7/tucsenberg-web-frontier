import {
  BYTES_PER_KB,
  COUNT_PAIR,
  COUNT_TEN,
  HEX_BYTE_MAX,
  HEX_JPEG_MARKER_1,
  HEX_PDF_MARKER,
  HEX_PDF_SIGNATURE_1,
  HEX_PNG_SIGNATURE_1,
  HEX_PNG_SIGNATURE_2,
  HEX_PNG_SIGNATURE_3,
  HEX_PNG_SIGNATURE_4,
  HEX_PNG_SIGNATURE_5,
  HEX_PNG_SIGNATURE_6,
  HEX_ZIP_SIGNATURE,
  MAGIC_255,
  MAGIC_HEX_03,
  MAGIC_HEX_04,
  ONE,
  ZERO,
} from '@/constants';

/**
 * 文件上传安全验证工具
 * File upload security validation utilities
 */

/**
 * File upload constants
 */
const FILE_UPLOAD_CONSTANTS = {
  MAX_FILE_SIZE_MB: COUNT_TEN,
  BYTES_PER_MB: BYTES_PER_KB,
  KB_TO_BYTES: BYTES_PER_KB,
} as const;

/**
 * File validation result interface
 */
export interface FileValidationResult {
  valid: boolean;
  error?: string;
  warnings?: string[];
}

/**
 * Allowed file types configuration
 */
export const ALLOWED_FILE_TYPES = {
  images: [
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
    'image/svg+xml',
  ],
  documents: [
    'application/pdf',
    'text/plain',
    'text/csv',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  ],
  archives: [
    'application/zip',
    'application/x-rar-compressed',
    'application/x-7z-compressed',
  ],
} as const;

const ALLOWED_TYPE_SETS = {
  images: new Set<string>(ALLOWED_FILE_TYPES.images),
  documents: new Set<string>(ALLOWED_FILE_TYPES.documents),
  archives: new Set<string>(ALLOWED_FILE_TYPES.archives),
} as const;

function getAllowedTypesForCategory(
  category: keyof typeof ALLOWED_FILE_TYPES,
): readonly string[] {
  switch (category) {
    case 'images':
      return ALLOWED_FILE_TYPES.images;
    case 'documents':
      return ALLOWED_FILE_TYPES.documents;
    case 'archives':
      return ALLOWED_FILE_TYPES.archives;
    default:
      return [] as const;
  }
}

/**
 * Dangerous file extensions that should never be allowed
 */
const DANGEROUS_EXTENSIONS = [
  '.exe',
  '.bat',
  '.cmd',
  '.scr',
  '.pif',
  '.js',
  '.vbs',
  '.jar',
  '.com',
  '.msi',
  '.dll',
  '.app',
  '.deb',
  '.rpm',
  '.dmg',
  '.pkg',
  '.sh',
  '.ps1',
  '.php',
  '.asp',
  '.aspx',
  '.jsp',
] as const;

const DANGEROUS_EXTENSION_SET = new Set<string>(DANGEROUS_EXTENSIONS);

function getMaxBytes(maxSizeMB?: number): number {
  const sizeMB = maxSizeMB ?? FILE_UPLOAD_CONSTANTS.MAX_FILE_SIZE_MB;
  return (
    sizeMB *
    FILE_UPLOAD_CONSTANTS.BYTES_PER_MB *
    FILE_UPLOAD_CONSTANTS.KB_TO_BYTES
  );
}

function resolveAllowedTypes(options: {
  allowedTypes?: string[];
  allowedCategories?: Array<keyof typeof ALLOWED_FILE_TYPES>;
}): string[] {
  if (options.allowedTypes) return options.allowedTypes;
  if (options.allowedCategories)
    return options.allowedCategories.flatMap((c) =>
      getAllowedTypesForCategory(c),
    );
  return [...ALLOWED_FILE_TYPES.images, ...ALLOWED_FILE_TYPES.documents];
}

function checkFileNameIssues(fileName: string): {
  error?: string;
  warnings: string[];
} {
  const warnings: string[] = [];
  const lower = fileName.toLowerCase();

  for (const ext of DANGEROUS_EXTENSIONS) {
    if (lower.endsWith(ext)) {
      return {
        error: `File extension '${ext}' is not allowed for security reasons`,
        warnings,
      };
    }
  }

  const parts = lower.split('.');
  if (parts.length > COUNT_PAIR) {
    for (const part of parts.slice(ONE, -ONE)) {
      const ext = `.${part}`;
      if (DANGEROUS_EXTENSION_SET.has(ext)) {
        return {
          error: `File contains dangerous extension '${ext}' in filename`,
          warnings,
        };
      }
    }
  }

  const suspiciousPatterns = [
    /^con\./i,
    /^prn\./i,
    /^aux\./i,
    /^nul\./i,
    /^com[1-9]\./i,
    /^lpt[1-9]\./i,
  ];
  if (suspiciousPatterns.some((p) => p.test(lower))) {
    warnings.push('File name matches a reserved system name pattern');
  }

  if (lower.length > MAGIC_255) {
    return {
      error: 'File name is too long (maximum MAGIC_255 characters)',
      warnings,
    };
  }

  if (lower.includes('\0')) {
    return { error: 'File name contains invalid characters', warnings };
  }

  return { warnings };
}

/**
 * Validate file upload security
 */
export function validateFileUpload(
  file: File,
  options: {
    maxSizeMB?: number;
    allowedTypes?: string[];
    allowedCategories?: Array<keyof typeof ALLOWED_FILE_TYPES>;
  } = {},
): FileValidationResult {
  const warnings: string[] = [];
  if (file.size > getMaxBytes(options.maxSizeMB)) {
    const size = options.maxSizeMB ?? FILE_UPLOAD_CONSTANTS.MAX_FILE_SIZE_MB;
    return { valid: false, error: `File size exceeds ${size}MB limit` };
  }

  const allowedTypes = resolveAllowedTypes(options);
  if (!allowedTypes.includes(file.type)) {
    return {
      valid: false,
      error: `File type '${file.type}' is not allowed. Allowed types: ${allowedTypes.join(', ')}`,
    };
  }

  const nameCheck = checkFileNameIssues(file.name);
  if (nameCheck.error) {
    return { valid: false, error: nameCheck.error };
  }
  warnings.push(...nameCheck.warnings);

  return {
    valid: true,
    ...(warnings.length > ZERO && { warnings }),
  };
}

/**
 * Validate file content based on file signature (magic numbers)
 */
export async function validateFileSignature(
  file: File,
): Promise<FileValidationResult> {
  try {
    const buffer = await file.arrayBuffer();
    const bytes = new Uint8Array(buffer);

    // Get the declared MIME type
    const declaredType = file.type;
    const expectedSignature = (() => {
      switch (declaredType) {
        case 'image/jpeg':
          return [HEX_BYTE_MAX, HEX_JPEG_MARKER_1, HEX_BYTE_MAX] as const;
        case 'image/png':
          return [
            HEX_PNG_SIGNATURE_1,
            HEX_PNG_SIGNATURE_2,
            HEX_PNG_SIGNATURE_3,
            HEX_PNG_SIGNATURE_4,
          ] as const;
        case 'image/gif':
          return [
            HEX_PNG_SIGNATURE_4,
            HEX_PNG_SIGNATURE_5,
            HEX_PNG_SIGNATURE_6,
          ] as const;
        case 'application/pdf':
          return [
            HEX_PDF_MARKER,
            HEX_PNG_SIGNATURE_2,
            HEX_PDF_SIGNATURE_1,
            HEX_PNG_SIGNATURE_6,
          ] as const;
        case 'application/zip':
          return [
            HEX_PNG_SIGNATURE_2,
            HEX_ZIP_SIGNATURE,
            MAGIC_HEX_03,
            MAGIC_HEX_04,
          ] as const;
        default:
          return null;
      }
    })();

    if (expectedSignature) {
      const actualSignature = Array.from(
        bytes.slice(ZERO, expectedSignature.length),
      );
      const matches = (expectedSignature as readonly number[]).every(
        (byte, index) => byte === actualSignature.at(index),
      );

      if (!matches) {
        return {
          valid: false,
          error: `File signature does not match declared type '${declaredType}'`,
        };
      }
    }

    return { valid: true };
  } catch {
    return {
      valid: false,
      error: 'Failed to validate file signature',
    };
  }
}

/**
 * Sanitize file name for safe storage
 */
export function sanitizeFileName(fileName: string): string {
  return fileName
    .replace(/[^a-zA-Z0-9._-]/g, '_') // Replace special chars with underscore
    .replace(/_{2,}/g, '_') // Replace multiple underscores with single
    .replace(/^_+|_+$/g, '') // Remove leading/trailing underscores
    .substring(ZERO, MAGIC_255); // Limit length
}

/**
 * Generate safe file name with timestamp
 */
export function generateSafeFileName(
  originalName: string,
  prefix?: string,
): string {
  const timestamp = Date.now();
  const extension = originalName.split('.').pop() || '';
  const baseName = originalName.replace(/\.[^/.]+$/, ''); // Remove extension
  const sanitizedBase = sanitizeFileName(baseName);

  const parts = [prefix, sanitizedBase, timestamp].filter(Boolean);

  return `${parts.join('_')}.${extension}`;
}

/**
 * Check if file is an image
 */
export function isImageFile(file: File): boolean {
  return ALLOWED_TYPE_SETS.images.has(file.type);
}

/**
 * Check if file is a document
 */
export function isDocumentFile(file: File): boolean {
  return ALLOWED_TYPE_SETS.documents.has(file.type);
}

/**
 * Get file category
 */
export function getFileCategory(
  file: File,
): keyof typeof ALLOWED_FILE_TYPES | 'unknown' {
  if (ALLOWED_TYPE_SETS.images.has(file.type)) {
    return 'images';
  }
  if (ALLOWED_TYPE_SETS.documents.has(file.type)) {
    return 'documents';
  }
  if (ALLOWED_TYPE_SETS.archives.has(file.type)) {
    return 'archives';
  }
  return 'unknown';
}

/**
 * Validate multiple files
 */
export function validateMultipleFiles(
  files: FileList | File[],
  options: {
    maxFiles?: number;
    maxTotalSizeMB?: number;
    maxSizeMB?: number;
    allowedTypes?: string[];
    allowedCategories?: Array<keyof typeof ALLOWED_FILE_TYPES>;
  } = {},
): FileValidationResult {
  const fileArray = Array.from(files);

  // Check file count
  if (options.maxFiles && fileArray.length > options.maxFiles) {
    return {
      valid: false,
      error: `Too many files. Maximum allowed: ${options.maxFiles}`,
    };
  }

  // Check total size
  if (options.maxTotalSizeMB) {
    const totalSize = fileArray.reduce((sum, file) => sum + file.size, ZERO);
    const maxTotalSize =
      options.maxTotalSizeMB *
      FILE_UPLOAD_CONSTANTS.BYTES_PER_MB *
      FILE_UPLOAD_CONSTANTS.KB_TO_BYTES;

    if (totalSize > maxTotalSize) {
      return {
        valid: false,
        error: `Total file size exceeds ${options.maxTotalSizeMB}MB limit`,
      };
    }
  }

  // Validate each file
  for (const [index, file] of fileArray.entries()) {
    if (!file) continue;
    const result = validateFileUpload(file, options);
    if (!result.valid) {
      return {
        valid: false,
        error: `File ${index + ONE} (${file?.name}): ${result.error}`,
      };
    }
  }

  return { valid: true };
}
