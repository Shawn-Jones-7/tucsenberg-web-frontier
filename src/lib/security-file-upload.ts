import { COUNT_PAIR, HEX_BYTE_MAX, HEX_JPEG_MARKER_1, HEX_PDF_MARKER, HEX_PDF_SIGNATURE_1, HEX_PNG_SIGNATURE_1, HEX_PNG_SIGNATURE_2, HEX_PNG_SIGNATURE_3, HEX_PNG_SIGNATURE_4, HEX_PNG_SIGNATURE_5, HEX_PNG_SIGNATURE_6, HEX_ZIP_SIGNATURE, MAGIC_255, MAGIC_HEX_03, MAGIC_HEX_04 } from '@/constants/magic-numbers';

/**
 * 文件上传安全验证工具
 * File upload security validation utilities
 */

/**
 * File upload constants
 */
const FILE_UPLOAD_CONSTANTS = {
  MAX_FILE_SIZE_MB: 10,
  BYTES_PER_MB: 1024,
  KB_TO_BYTES: 1024,
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

  // Check file size
  const maxSize =
    (options.maxSizeMB || FILE_UPLOAD_CONSTANTS.MAX_FILE_SIZE_MB) *
    FILE_UPLOAD_CONSTANTS.BYTES_PER_MB *
    FILE_UPLOAD_CONSTANTS.KB_TO_BYTES;

  if (file.size > maxSize) {
    return {
      valid: false,
      error: `File size exceeds ${options.maxSizeMB || FILE_UPLOAD_CONSTANTS.MAX_FILE_SIZE_MB}MB limit`,
    };
  }

  // Determine allowed types
  let allowedTypes: string[] = [];

  if (options.allowedTypes) {
    allowedTypes = options.allowedTypes;
  } else if (options.allowedCategories) {
    allowedTypes = options.allowedCategories.flatMap(
      (category) => ALLOWED_FILE_TYPES[category] || [],
    );
  } else {
    // Default: allow images and documents
    allowedTypes = [
      ...ALLOWED_FILE_TYPES.images,
      ...ALLOWED_FILE_TYPES.documents,
    ];
  }

  // Check file type
  if (!allowedTypes.includes(file.type)) {
    return {
      valid: false,
      error: `File type '${file.type}' is not allowed. Allowed types: ${allowedTypes.join(', ')}`,
    };
  }

  // Check file name for dangerous extensions
  const fileName = file.name.toLowerCase();

  for (const ext of DANGEROUS_EXTENSIONS) {
    if (fileName.endsWith(ext)) {
      return {
        valid: false,
        error: `File extension '${ext}' is not allowed for security reasons`,
      };
    }
  }

  // Check for double extensions (e.g., file.pdf.exe)
  const parts = fileName.split('.');
  if (parts.length > COUNT_PAIR) {
    for (let i = 1; i < parts.length - 1; i++) {
      const ext = `.${parts[i]}`;
      if (DANGEROUS_EXTENSIONS.includes(ext as any)) {
        return {
          valid: false,
          error: `File contains dangerous extension '${ext}' in filename`,
        };
      }
    }
  }

  // Check for suspicious file names
  const suspiciousPatterns = [
    /^con\./i,
    /^prn\./i,
    /^aux\./i,
    /^nul\./i,
    /^com[1-9]\./i,
    /^lpt[1-9]\./i,
  ];

  for (const pattern of suspiciousPatterns) {
    if (pattern.test(fileName)) {
      warnings.push('File name matches a reserved system name pattern');
      break;
    }
  }

  // Check file name length
  if (fileName.length > MAGIC_255) {
    return {
      valid: false,
      error: 'File name is too long (maximum MAGIC_255 characters)',
    };
  }

  // Check for null bytes in filename
  if (fileName.includes('\0')) {
    return {
      valid: false,
      error: 'File name contains invalid characters',
    };
  }

  return {
    valid: true,
    ...(warnings.length > 0 && { warnings }),
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

    // Check for common file signatures
    const signatures = {
      'image/jpeg': [HEX_BYTE_MAX, HEX_JPEG_MARKER_1, HEX_BYTE_MAX],
      'image/png': [HEX_PNG_SIGNATURE_1, HEX_PNG_SIGNATURE_2, HEX_PNG_SIGNATURE_3, HEX_PNG_SIGNATURE_4],
      'image/gif': [HEX_PNG_SIGNATURE_4, HEX_PNG_SIGNATURE_5, HEX_PNG_SIGNATURE_6],
      'application/pdf': [HEX_PDF_MARKER, HEX_PNG_SIGNATURE_2, HEX_PDF_SIGNATURE_1, HEX_PNG_SIGNATURE_6],
      'application/zip': [HEX_PNG_SIGNATURE_2, HEX_ZIP_SIGNATURE, MAGIC_HEX_03, MAGIC_HEX_04],
    };

    // Get the declared MIME type
    const declaredType = file.type;
    const expectedSignature =
      signatures[declaredType as keyof typeof signatures];

    if (expectedSignature) {
      const actualSignature = Array.from(
        bytes.slice(0, expectedSignature.length),
      );
      const matches = expectedSignature.every(
        (byte, index) => byte === actualSignature[index],
      );

      if (!matches) {
        return {
          valid: false,
          error: `File signature does not match declared type '${declaredType}'`,
        };
      }
    }

    return { valid: true };
  } catch (error) {
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
    .replace(/_{COUNT_PAIR,}/g, '_') // Replace multiple underscores with single
    .replace(/^_+|_+$/g, '') // Remove leading/trailing underscores
    .substring(0, MAGIC_255); // Limit length
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
  return ALLOWED_FILE_TYPES.images.includes(file.type as any);
}

/**
 * Check if file is a document
 */
export function isDocumentFile(file: File): boolean {
  return ALLOWED_FILE_TYPES.documents.includes(file.type as any);
}

/**
 * Get file category
 */
export function getFileCategory(
  file: File,
): keyof typeof ALLOWED_FILE_TYPES | 'unknown' {
  if (ALLOWED_FILE_TYPES.images.includes(file.type as any)) {
    return 'images';
  }
  if (ALLOWED_FILE_TYPES.documents.includes(file.type as any)) {
    return 'documents';
  }
  if (ALLOWED_FILE_TYPES.archives.includes(file.type as any)) {
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
    const totalSize = fileArray.reduce((sum, file) => sum + file.size, 0);
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
  for (let i = 0; i < fileArray.length; i++) {
    const file = fileArray[i];
    if (!file) continue;
    const result = validateFileUpload(file, options);
    if (!result.valid) {
      return {
        valid: false,
        error: `File ${i + 1} (${fileArray[i]?.name}): ${result.error}`,
      };
    }
  }

  return { valid: true };
}
