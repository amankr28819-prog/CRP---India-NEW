const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { cloudinary, isCloudinaryConfigured } = require('../config/cloudinary');

/**
 * Native Multer storage engine for Cloudinary SDK 2.x
 * Eliminates unmaintained third-party peer-dependency conflicts while streaming
 * directly to Cloudinary using official cloudinary.uploader.upload_stream.
 */
class CloudinaryStorage {
  constructor(opts) {
    if (!opts || !opts.cloudinary) {
      throw new Error('`cloudinary` instance is required for CloudinaryStorage');
    }
    this.cloudinary = opts.cloudinary;
    this.params = opts.params || {};
  }

  async _handleFile(req, file, cb) {
    try {
      const options = typeof this.params === 'function'
        ? await this.params(req, file)
        : this.params;

      const uploadStream = this.cloudinary.uploader.upload_stream(
        options,
        (err, result) => {
          if (err) return cb(err);
          cb(null, {
            path: result.secure_url,
            secure_url: result.secure_url,
            filename: result.public_id,
            public_id: result.public_id,
            size: result.bytes,
            bytes: result.bytes,
            format: result.format
          });
        }
      );

      file.stream.pipe(uploadStream);
    } catch (err) {
      cb(err);
    }
  }

  _removeFile(req, file, cb) {
    if (file && (file.filename || file.public_id)) {
      this.cloudinary.uploader.destroy(file.filename || file.public_id, { invalidate: true }, cb);
    } else {
      cb(null);
    }
  }
}

const uploadsDir = path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const ALLOWED_MIME_TYPES = new Set(['image/jpeg', 'image/jpg', 'image/png', 'image/webp']);
const ALLOWED_EXTENSIONS = new Set(['.jpg', '.jpeg', '.png', '.webp']);

let storage;

if (isCloudinaryConfigured) {
  storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: async (req, file) => {
      let folder = 'crp-india/complaints';
      if (file.fieldname === 'avatar') {
        folder = 'crp-india/avatars';
      } else if (file.fieldname === 'resolutionPhoto') {
        folder = 'crp-india/resolutions';
      }

      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
      const ext = path.extname(file.originalname || '').toLowerCase();
      const cleanExt = ALLOWED_EXTENSIONS.has(ext) ? ext.replace('.', '') : 'jpg';

      return {
        folder: folder,
        format: cleanExt,
        public_id: `${file.fieldname}-${uniqueSuffix}`,
        transformation: [
          { quality: 'auto', fetch_format: 'auto' }
        ]
      };
    }
  });
} else {
  storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, uploadsDir);
    },
    filename: function (req, file, cb) {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
      const ext = path.extname(file.originalname).toLowerCase();
      const safeExt = ALLOWED_EXTENSIONS.has(ext) ? ext : '.jpg';
      cb(null, `complaint-${uniqueSuffix}${safeExt}`);
    }
  });
}

const fileFilter = (req, file, cb) => {
  const mime = (file.mimetype || '').toLowerCase();
  const ext = path.extname(file.originalname || '').toLowerCase();

  if (ALLOWED_MIME_TYPES.has(mime) && ALLOWED_EXTENSIONS.has(ext)) {
    return cb(null, true);
  }
  cb(new Error('Only valid image files (.jpg, .jpeg, .png, .webp) are allowed!'));
};

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: fileFilter
});

/**
 * Extracts the appropriate URL to persist in the database:
 * - If uploaded via Cloudinary, `file.path` or `file.secure_url` holds the permanent HTTPS URL.
 * - If uploaded via local disk fallback, `file.filename` is used to construct `/uploads/<filename>`.
 */
const getUploadedFileUrl = (file) => {
  if (!file) return '';
  if (file.path && (file.path.startsWith('http://') || file.path.startsWith('https://'))) {
    return file.path;
  }
  if (file.secure_url) {
    return file.secure_url;
  }
  return `/uploads/${file.filename}`;
};
upload.getUploadedFileUrl = getUploadedFileUrl;

module.exports = upload;
module.exports.upload = upload;
module.exports.getUploadedFileUrl = getUploadedFileUrl;