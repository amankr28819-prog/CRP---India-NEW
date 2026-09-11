const path = require('path');
const fs = require('fs');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });
const mongoose = require('mongoose');
const cloudinary = require('cloudinary').v2;

const User = require('../models/User');
const Complaint = require('../models/Complaint');
const Notification = require('../models/Notification');
const Vote = require('../models/Vote');

const uploadsDir = path.join(__dirname, '../../uploads');

const isCloudinaryReady = Boolean(
  process.env.CLOUDINARY_CLOUD_NAME &&
  process.env.CLOUDINARY_API_KEY &&
  process.env.CLOUDINARY_API_SECRET
);

if (isCloudinaryReady) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true
  });
}

const checkUrlAccessible = async (url) => {
  try {
    const res = await fetch(url, { method: 'HEAD' });
    return res.status >= 200 && res.status < 400;
  } catch (err) {
    return false;
  }
};

const resolveLocalFile = (imagePath) => {
  if (!imagePath) return null;
  let filename = path.basename(imagePath);
  
  // Handle known drainage typo
  if (filename === 'demo-drainage-before.jpg') {
    filename = 'demo-drain-before.jpg';
  }

  const fullPath = path.join(uploadsDir, filename);
  if (fs.existsSync(fullPath)) {
    return fullPath;
  }
  return null;
};

async function executeCleanupAndMigration() {
  console.log('====================================================');
  console.log('  CRP INDIA: PRODUCTION DATA CLEANUP & MIGRATION    ');
  console.log('====================================================\n');

  const mongoUri = process.env.MONGO_URI;
  if (!mongoUri) {
    throw new Error('CRITICAL ERROR: MONGO_URI environment variable is not set. Please set MONGO_URI.');
  }

  if (!isCloudinaryReady) {
    throw new Error('CRITICAL ERROR: Cloudinary credentials (CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET) are incomplete.');
  }

  console.log('[1/6] Connecting to MongoDB Atlas...');
  await mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 10000 });
  console.log(`[Connected] Host: ${mongoose.connection.host}, DB: ${mongoose.connection.name}\n`);

  console.log('[2/6] Inspecting and uploading physically available demo assets to Cloudinary...');
  const uploadedUrlCache = new Map();

  const getOrUploadAsset = async (filename, folder) => {
    let targetFilename = filename;
    if (targetFilename === 'demo-drainage-before.jpg') {
      targetFilename = 'demo-drain-before.jpg';
    }

    if (uploadedUrlCache.has(targetFilename)) {
      return uploadedUrlCache.get(targetFilename);
    }

    const localPath = path.join(uploadsDir, targetFilename);
    if (!fs.existsSync(localPath)) {
      return null;
    }

    const publicId = path.parse(targetFilename).name + '-' + Date.now();
    console.log(` -> Uploading ${targetFilename} to Cloudinary [${folder}]...`);
    const result = await cloudinary.uploader.upload(localPath, {
      folder,
      public_id: publicId,
      quality: 'auto',
      fetch_format: 'auto'
    });

    const secureUrl = result.secure_url;
    console.log(`    Uploaded successfully: ${secureUrl}`);
    uploadedUrlCache.set(targetFilename, secureUrl);
    uploadedUrlCache.set(filename, secureUrl);
    return secureUrl;
  };

  console.log('\n[3/6] Evaluating all citizen accounts and associated complaints...');
  const allCitizens = await User.find({ role: 'citizen' }).lean();
  console.log(`Found ${allCitizens.length} citizen user accounts.\n`);

  const accountsToDelete = [];
  const accountsToKeep = [];

  for (const citizen of allCitizens) {
    let hasBrokenImage = false;
    const reasons = [];

    // Check avatar
    if (citizen.avatar && citizen.avatar.trim() !== '') {
      if (citizen.avatar.startsWith('http://') || citizen.avatar.startsWith('https://')) {
        const isReachable = await checkUrlAccessible(citizen.avatar);
        if (!isReachable) {
          hasBrokenImage = true;
          reasons.push(`Cloudinary avatar returned 404/error: ${citizen.avatar}`);
        }
      } else {
        const localFile = resolveLocalFile(citizen.avatar);
        if (!localFile) {
          hasBrokenImage = true;
          reasons.push(`Local avatar file missing: ${citizen.avatar}`);
        }
      }
    }

    // Check complaints belonging to citizen
    const userComplaints = await Complaint.find({
      $or: [
        { 'citizen.userId': citizen._id },
        { 'citizen.email': citizen.email }
      ]
    }).lean();

    for (const comp of userComplaints) {
      for (const img of (comp.images || [])) {
        if (img.startsWith('http://') || img.startsWith('https://')) {
          const isReachable = await checkUrlAccessible(img);
          if (!isReachable) {
            hasBrokenImage = true;
            reasons.push(`Complaint ${comp.referenceId} image 404: ${img}`);
          }
        } else {
          const localFile = resolveLocalFile(img);
          if (!localFile) {
            hasBrokenImage = true;
            reasons.push(`Complaint ${comp.referenceId} local image missing: ${img}`);
          }
        }
      }

      if (comp.resolutionPhoto && comp.resolutionPhoto.trim() !== '') {
        if (comp.resolutionPhoto.startsWith('http://') || comp.resolutionPhoto.startsWith('https://')) {
          const isReachable = await checkUrlAccessible(comp.resolutionPhoto);
          if (!isReachable) {
            hasBrokenImage = true;
            reasons.push(`Complaint ${comp.referenceId} resolutionPhoto 404: ${comp.resolutionPhoto}`);
          }
        } else {
          const localFile = resolveLocalFile(comp.resolutionPhoto);
          if (!localFile) {
            hasBrokenImage = true;
            reasons.push(`Complaint ${comp.referenceId} local resolutionPhoto missing: ${comp.resolutionPhoto}`);
          }
        }
      }
    }

    if (hasBrokenImage) {
      accountsToDelete.push({ citizen, complaints: userComplaints, reasons });
    } else {
      accountsToKeep.push({ citizen, complaints: userComplaints });
    }
  }

  console.log(`Accounts classified for DELETION: ${accountsToDelete.length}`);
  for (const item of accountsToDelete) {
    console.log(` - User [${item.citizen.name}] (ID: ${item.citizen._id}): ${item.reasons.join('; ')}`);
  }

  console.log(`\nAccounts classified to KEEP: ${accountsToKeep.length}`);

  console.log('\n[4/6] Executing deletion of broken accounts and associated records...');
  let deletedComplaintsCount = 0;

  for (const item of accountsToDelete) {
    const userId = item.citizen._id;
    const userEmail = item.citizen.email;

    // Delete complaints
    const compDeleteResult = await Complaint.deleteMany({
      $or: [
        { 'citizen.userId': userId },
        { 'citizen.email': userEmail }
      ]
    });
    deletedComplaintsCount += compDeleteResult.deletedCount;

    // Delete votes and notifications
    await Vote.deleteMany({ userId });
    await Notification.deleteMany({ userId });

    // Delete user
    await User.deleteOne({ _id: userId });
    console.log(` -> Deleted User [${item.citizen.name}] (${userId}) and ${compDeleteResult.deletedCount} complaint(s).`);
  }

  console.log('\n[5/6] Migrating remaining complaints and resolution images to Cloudinary...');
  const remainingComplaints = await Complaint.find({}).lean();
  let updatedComplaintsCount = 0;

  for (const comp of remainingComplaints) {
    let modified = false;
    const updatedImages = [];

    for (const img of (comp.images || [])) {
      if (img.startsWith('http://') || img.startsWith('https://')) {
        updatedImages.push(img);
      } else {
        const filename = path.basename(img);
        const cloudUrl = await getOrUploadAsset(filename, 'crp-india/complaints');
        if (cloudUrl) {
          updatedImages.push(cloudUrl);
          modified = true;
        } else {
          updatedImages.push(img);
        }
      }
    }

    let updatedResPhoto = comp.resolutionPhoto || '';
    if (comp.resolutionPhoto && !comp.resolutionPhoto.startsWith('http')) {
      const filename = path.basename(comp.resolutionPhoto);
      const cloudUrl = await getOrUploadAsset(filename, 'crp-india/resolutions');
      if (cloudUrl) {
        updatedResPhoto = cloudUrl;
        modified = true;
      }
    }

    if (modified) {
      await Complaint.updateOne(
        { _id: comp._id },
        {
          $set: {
            images: updatedImages,
            resolutionPhoto: updatedResPhoto
          }
        }
      );
      console.log(` -> Updated Complaint [${comp.referenceId}] with Cloudinary URLs.`);
      updatedComplaintsCount++;
    }
  }

  console.log('\n[6/6] Cleaning orphaned complaints and votes...');
  const existingUserIds = (await User.find({}).select('_id').lean()).map(u => u._id.toString());
  const existingUserIdSet = new Set(existingUserIds);

  const allRemaining = await Complaint.find({}).select('_id referenceId citizen').lean();
  let orphanedComplaintsCount = 0;
  for (const c of allRemaining) {
    if (c.citizen && c.citizen.userId) {
      const ownerIdStr = c.citizen.userId.toString();
      if (!existingUserIdSet.has(ownerIdStr)) {
        await Complaint.deleteOne({ _id: c._id });
        console.log(` -> Removed orphaned complaint: ${c.referenceId} (Owner ${ownerIdStr} does not exist).`);
        orphanedComplaintsCount++;
      }
    }
  }

  console.log('\n====================================================');
  console.log('              CLEANUP & MIGRATION SUMMARY           ');
  console.log('====================================================');
  console.log(`- Accounts Deleted: ${accountsToDelete.length}`);
  console.log(`- Complaints Deleted: ${deletedComplaintsCount}`);
  console.log(`- Orphaned Complaints Removed: ${orphanedComplaintsCount}`);
  console.log(`- Complaints Updated to Cloudinary: ${updatedComplaintsCount}`);
  console.log(`- Assets Uploaded to Cloudinary: ${uploadedUrlCache.size}`);
  console.log(`- Preserved Citizen Accounts: ${accountsToKeep.length}`);
  console.log('====================================================\n');
}

if (require.main === module) {
  executeCleanupAndMigration()
    .then(async () => {
      await mongoose.disconnect();
      console.log('[Done] Database disconnected cleanly.');
      process.exit(0);
    })
    .catch(async (err) => {
      console.error('\n[FATAL ERROR]', err.message);
      try { await mongoose.disconnect(); } catch (_) {}
      process.exit(1);
    });
}

module.exports = { executeCleanupAndMigration };
