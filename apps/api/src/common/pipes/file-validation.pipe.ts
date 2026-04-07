import { PipeTransform, Injectable, BadRequestException } from '@nestjs/common';

export interface FileValidationOptions {
  maxSizeBytes: number;
  allowedMimeTypes: string[];
  allowedExtensions: string[];
}

const DEFAULT_OPTIONS: FileValidationOptions = {
  maxSizeBytes: 10 * 1024 * 1024, // 10 MB
  allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'],
  allowedExtensions: ['.jpg', '.jpeg', '.png', '.webp', '.pdf'],
};

/** Magic-byte signatures for file-type validation (prevents extension spoofing). */
const MAGIC_BYTES: Record<string, number[][]> = {
  'image/jpeg': [[0xff, 0xd8, 0xff]],
  'image/png': [[0x89, 0x50, 0x4e, 0x47]],
  'image/webp': [[0x52, 0x49, 0x46, 0x46]],
  'application/pdf': [[0x25, 0x50, 0x44, 0x46]],
};

@Injectable()
export class FileValidationPipe implements PipeTransform {
  private readonly options: FileValidationOptions;

  constructor(options?: Partial<FileValidationOptions>) {
    this.options = { ...DEFAULT_OPTIONS, ...options };
  }

  transform(file: Express.Multer.File) {
    if (!file) throw new BadRequestException('File is required');

    // 1. Size
    if (file.size > this.options.maxSizeBytes) {
      throw new BadRequestException(
        `File exceeds maximum size of ${Math.round(this.options.maxSizeBytes / 1024 / 1024)}MB`,
      );
    }

    // 2. MIME type
    if (!this.options.allowedMimeTypes.includes(file.mimetype)) {
      throw new BadRequestException(
        `File type ${file.mimetype} is not allowed. Allowed: ${this.options.allowedMimeTypes.join(', ')}`,
      );
    }

    // 3. Extension
    const ext = '.' + (file.originalname.split('.').pop()?.toLowerCase() || '');
    if (!this.options.allowedExtensions.includes(ext)) {
      throw new BadRequestException(
        `Extension ${ext} is not allowed. Allowed: ${this.options.allowedExtensions.join(', ')}`,
      );
    }

    // 4. Magic-byte verification (content must match declared MIME)
    if (file.buffer) {
      const patterns = MAGIC_BYTES[file.mimetype];
      if (patterns) {
        const valid = patterns.some((pattern) =>
          pattern.every((byte, idx) => file.buffer[idx] === byte),
        );
        if (!valid) {
          throw new BadRequestException('File content does not match its declared type');
        }
      }
    }

    // 5. Sanitize filename (strip path-traversal & special chars)
    file.originalname = file.originalname.replace(/[^\w\s.-]/g, '').replace(/\s+/g, '_');

    return file;
  }
}
