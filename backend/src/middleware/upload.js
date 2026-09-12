const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const { cloudinary, isCloudinaryConfigured } = require('../config/cloudinary');

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

const memoryStorage = multer.memoryStorage();

const complaintUpload = multer({
  storage: memoryStorage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: fileFilter
});

/**
 * Uploads an in-memory image buffer to Cloudinary (or writes to local uploadsDir fallback).
 * This ensures that image moderation happens on the buffer BEFORE any permanent upload occurs.
 *
 * @param {Buffer} buffer - In-memory image buffer
 * @param {Object} options - Upload options (folder, ext, etc.)
 * @returns {Promise<string>} The permanent image URL (HTTPS Cloudinary URL or /uploads/<filename>)
 */
const uploadBufferToCloudinary = (buffer, options = {}) => {
  return new Promise((resolve, reject) => {
    const ext = (options.ext || '.jpg').toLowerCase();
    const cleanExt = ALLOWED_EXTENSIONS.has(ext) ? ext.replace('.', '') : 'jpg';
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);

    if (!isCloudinaryConfigured) {
      const filename = `complaint-${uniqueSuffix}.${cleanExt}`;
      const filePath = path.join(uploadsDir, filename);
      fs.writeFile(filePath, buffer, (err) => {
        if (err) return reject(err);
        resolve(`/uploads/${filename}`);
      });
      return;
    }

    const folder = options.folder || 'crp-india/complaints';
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder,
        format: cleanExt,
        public_id: `complaint-${uniqueSuffix}`,
        transformation: [
          { quality: 'auto', fetch_format: 'auto' }
        ]
      },
      (error, result) => {
        if (error) return reject(error);
        resolve(result.secure_url || result.url);
      }
    );
    uploadStream.end(buffer);
  });
};

upload.getUploadedFileUrl = getUploadedFileUrl;
upload.complaintUpload = complaintUpload;
upload.uploadBufferToCloudinary = uploadBufferToCloudinary;

module.exports = upload;
module.exports.upload = upload;
module.exports.complaintUpload = complaintUpload;
module.exports.uploadBufferToCloudinary = uploadBufferToCloudinary;
module.exports.getUploadedFileUrl = getUploadedFileUrl;