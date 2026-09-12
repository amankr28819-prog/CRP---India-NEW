const nodemailer = require('nodemailer');
const User = require('../models/User');

// Safe email masking helper for diagnostic logging
const maskEmail = (email) => {
  if (!email || typeof email !== 'string') return '[missing]';
  const parts = email.trim().split('@');
  if (parts.length !== 2) return '[invalid-email]';
  const name = parts[0];
  const domain = parts[1];
  const maskedName = name.length > 1 ? `${name[0]}***` : `${name}***`;
  return `${maskedName}@${domain}`;
};

// Configurable SMTP options from environment (Defaults to Gmail SMTP submission via STARTTLS on port 587)
const getSmtpConfig = () => {
  const host = process.env.SMTP_HOST || 'smtp.gmail.com';
  const port = parseInt(process.env.SMTP_PORT || '587', 10);
  const secure = process.env.SMTP_SECURE !== undefined
    ? String(process.env.SMTP_SECURE).trim().toLowerCase() === 'true'
    : port === 465;

  const user = (process.env.EMAIL_USER || 'crpindianew@gmail.com').trim();
  const rawPass = (process.env.EMAIL_APP_PASSWORD || '').trim();
  // Strip accidental whitespace from Google App Password (e.g. "abcd efgh ijkl mnop")
  const pass = rawPass.replace(/\s+/g, '');
  const fromName = process.env.EMAIL_FROM_NAME || 'CRP India Grievance Portal';

  return {
    host,
    port,
    secure,
    requireTLS: !secure,
    auth: { user, pass },
    from: `"${fromName}" <${user}>`,
    isConfigured: Boolean(user && pass && pass.length > 0)
  };
};

// Diagnostic metadata helper (strictly booleans/metadata, NEVER leaks secrets)
const getSafeConfigDiagnostic = () => {
  const host = process.env.SMTP_HOST;
  const port = process.env.SMTP_PORT;
  const secure = process.env.SMTP_SECURE;
  const user = process.env.EMAIL_USER;
  const rawPass = process.env.EMAIL_APP_PASSWORD || '';
  const cleanPass = rawPass.trim().replace(/\s+/g, '');

  return {
    host: Boolean(host && host.trim().length > 0),
    port: Boolean(port && String(port).trim().length > 0),
    secure: Boolean(secure !== undefined && String(secure).trim().length > 0),
    user: Boolean(user && user.trim().length > 0),
    appPassword: Boolean(cleanPass.length > 0),
    appPasswordHadSpaces: rawPass.includes(' '),
    appPasswordLength: cleanPass.length
  };
};

// Singleton transporter instance
let transporter = null;
let customTransporterForTesting = null;

const getTransporter = () => {
  if (customTransporterForTesting) {
    return customTransporterForTesting;
  }

  if (transporter) {
    return transporter;
  }

  const config = getSmtpConfig();
  if (!config.isConfigured) {
    return null;
  }

  transporter = nodemailer.createTransport({
    host: config.host,
    port: config.port,
    secure: config.secure,
    requireTLS: config.requireTLS,
    auth: {
      user: config.auth.user,
      pass: config.auth.pass
    },
    // Safe timeouts so SMTP latency never hangs requests
    connectionTimeout: 10000,
    greetingTimeout: 10000,
    socketTimeout: 15000
  });

  return transporter;
};

// Test hook
const setTransporterForTesting = (mock) => {
  customTransporterForTesting = mock;
};

const resetTransporterForTesting = () => {
  customTransporterForTesting = null;
  transporter = null;
};

/**
 * Diagnostic helper to safely verify Nodemailer SMTP connection and credentials.
 */
const verifyTransporterSafe = async () => {
  const diag = getSafeConfigDiagnostic();
  const config = getSmtpConfig();
  console.log(`[EMAIL DEBUG] SMTP configuration present: host=${diag.host} port=${diag.port} secure=${diag.secure} user=${diag.user} appPassword=${diag.appPassword}`);
  console.log(`[EMAIL DEBUG] SMTP target: host=${config.host} port=${config.port} secure=${config.secure} requireTLS=${Boolean(config.requireTLS)}`);
  console.log(`[EMAIL DEBUG] SMTP appPassword metadata: length=${diag.appPasswordLength}, spacesRemoved=${diag.appPasswordHadSpaces}`);

  const activeTransporter = getTransporter();
  if (!activeTransporter) {
    console.log('[EMAIL DEBUG] Transporter verification skipped: SMTP credentials not configured.');
    return { verified: false, reason: 'NOT_CONFIGURED' };
  }

  try {
    console.log('[EMAIL DEBUG] Attempting Nodemailer transporter verification with SMTP server...');
    await activeTransporter.verify();
    console.log('[EMAIL DEBUG] Nodemailer transporter verification SUCCEEDED. SMTP connection and credentials are valid.');
    return { verified: true };
  } catch (verifyErr) {
    const errName = verifyErr.name || 'Error';
    const errCode = verifyErr.code || 'UNKNOWN';
    const errResponseCode = verifyErr.responseCode !== undefined ? verifyErr.responseCode : null;
    const errCommand = verifyErr.command || 'NONE';
    const errMessage = (verifyErr.message || 'Verification failed').replace(/[\r\n]+/g, ' ');

    console.error(`[EMAIL DEBUG] SMTP verification error: name="${errName}" code="${errCode}" responseCode=${errResponseCode} command="${errCommand}" message="${errMessage}"`);
    return {
      verified: false,
      error: {
        name: errName,
        code: errCode,
        responseCode: errResponseCode,
        message: errMessage
      }
    };
  }
};

/**
 * Safely resolves the citizen recipient email, name, and notification preferences.
 * Checks User model first, falling back to complaint.citizen snapshot.
 *
 * @param {Object} complaint - Mongoose Complaint document or plain object
 * @returns {Promise<{ shouldSend: boolean, email?: string, name?: string, reason?: string }>}
 */
const resolveCitizenRecipient = async (complaint) => {
  try {
    if (!complaint || !complaint.citizen) {
      console.log('[EMAIL DEBUG] Recipient resolution failed: NO_CITIZEN_DATA');
      return { shouldSend: false, reason: 'NO_CITIZEN_DATA' };
    }

    let recipientEmail = (complaint.citizen.email || '').trim().toLowerCase();
    let recipientName = (complaint.citizen.name || '').trim() || 'Citizen';
    let emailUpdatesEnabled = true;
    let complaintStatusEnabled = true;
    let userFound = false;

    if (complaint.citizen.userId) {
      try {
        const user = await User.findById(complaint.citizen.userId).select('email name settings');
        if (user) {
          userFound = true;
          if (user.email && typeof user.email === 'string') {
            recipientEmail = user.email.trim().toLowerCase();
          }
          if (user.name && typeof user.name === 'string') {
            recipientName = user.name.trim();
          }
          if (user.settings?.notifications?.emailUpdates === false) {
            emailUpdatesEnabled = false;
          }
          if (user.settings?.notifications?.complaintStatus === false) {
            complaintStatusEnabled = false;
          }
        } else {
          console.log(`[EMAIL DEBUG] User record not found for userId: ${complaint.citizen.userId}, falling back to complaint snapshot.`);
        }
      } catch (userLookupErr) {
        console.warn('[EMAIL DEBUG] User document lookup failed, using complaint snapshot:', userLookupErr.message);
      }
    } else {
      console.log('[EMAIL DEBUG] No citizen.userId present on complaint, using complaint snapshot.');
    }

    const masked = maskEmail(recipientEmail);
    console.log(`[EMAIL DEBUG] Recipient resolved: ${masked} (source: ${userFound ? 'User record' : 'complaint snapshot'})`);

    const prefsAllowed = emailUpdatesEnabled && complaintStatusEnabled;
    console.log(`[EMAIL DEBUG] Email notification preference: ${prefsAllowed ? 'enabled' : 'disabled'} (emailUpdates=${emailUpdatesEnabled}, complaintStatus=${complaintStatusEnabled})`);

    if (!recipientEmail || !recipientEmail.includes('@')) {
      console.log(`[EMAIL DEBUG] Recipient skipped: INVALID_OR_MISSING_EMAIL (${masked})`);
      return { shouldSend: false, reason: 'INVALID_OR_MISSING_EMAIL' };
    }

    if (!prefsAllowed) {
      console.log(`[EMAIL DEBUG] Recipient skipped: USER_PREFERENCE_DISABLED for ${masked}`);
      return { shouldSend: false, reason: 'USER_PREFERENCE_DISABLED' };
    }

    return {
      shouldSend: true,
      email: recipientEmail,
      name: recipientName
    };
  } catch (err) {
    console.error('[EMAIL DEBUG] Failed to resolve recipient:', err.message);
    return { shouldSend: false, reason: 'RESOLVE_ERROR' };
  }
};

/**
 * Base email dispatch helper with isolated error handling.
 */
const sendMailSafe = async ({ to, subject, text, html }) => {
  const maskedTo = maskEmail(to);
  try {
    const config = getSmtpConfig();
    const configDiag = getSafeConfigDiagnostic();
    console.log(`[EMAIL DEBUG] SMTP configuration present: host=${configDiag.host} port=${configDiag.port} secure=${configDiag.secure} user=${configDiag.user} appPassword=${configDiag.appPassword}`);

    const activeTransporter = getTransporter();

    if (!activeTransporter) {
      console.log(`[EMAIL DEBUG] SMTP credentials not configured. Skipping email dispatch to ${maskedTo} for: "${subject}"`);
      return { success: false, reason: 'NOT_CONFIGURED' };
    }

    const mailOptions = {
      from: config.from,
      to,
      subject,
      text,
      html
    };

    console.log(`[EMAIL DEBUG] Attempting sendMail to ${maskedTo} for subject: "${subject}"`);
    const info = await activeTransporter.sendMail(mailOptions);
    console.log(`[EMAIL DEBUG] sendMail succeeded to ${maskedTo} (Message ID: ${info.messageId || 'present'})`);
    return { success: true, messageId: info.messageId };
  } catch (err) {
    const errName = err.name || 'Error';
    const errCode = err.code || 'UNKNOWN';
    const errResponseCode = err.responseCode !== undefined ? err.responseCode : null;
    const errCommand = err.command || 'NONE';
    const errMessage = (err.message || 'Unknown SMTP error').replace(/[\r\n]+/g, ' ');

    console.error(`[EMAIL DEBUG] sendMail failed to ${maskedTo}: name="${errName}" code="${errCode}" responseCode=${errResponseCode} command="${errCommand}" message="${errMessage}"`);
    return {
      success: false,
      error: {
        name: errName,
        code: errCode,
        responseCode: errResponseCode,
        message: errMessage
      }
    };
  }
};

/**
 * Sends a status update email to the citizen.
 */
const sendStatusUpdateEmail = async ({ complaint, previousStatus, newStatus, remark, resolutionPhoto, resolutionNote }) => {
  try {
    const recipient = await resolveCitizenRecipient(complaint);
    if (!recipient.shouldSend) {
      console.log(`[EMAIL] Status email skipped for ref ${complaint.referenceId}: ${recipient.reason}`);
      return { success: false, reason: recipient.reason };
    }

    const clientUrl = (process.env.CLIENT_URL || 'http://localhost:5173').replace(/\/$/, '');
    const trackingUrl = `${clientUrl}/track?ref=${encodeURIComponent(complaint.referenceId)}`;
    const isResolved = newStatus === 'Resolved';

    const subject = `[CRP India] Grievance Update: Ref #${complaint.referenceId} - ${newStatus}`;

    const text = `
Dear ${recipient.name},

The status of your registered grievance has been updated on the CRP India Civic Portal.

Grievance Details:
- Reference ID: ${complaint.referenceId}
- Title: ${complaint.title}
- Category: ${complaint.category}
- Previous Status: ${previousStatus || 'N/A'}
- New Status: ${newStatus}
${remark ? `- Authority Remark: ${remark}\n` : ''}${isResolved && resolutionNote ? `- Resolution Note: ${resolutionNote}\n` : ''}${isResolved && resolutionPhoto ? `- Resolution Proof Photo: ${resolutionPhoto}\n` : ''}

You can track real-time progress and view complete history on the portal:
${trackingUrl}

Thank you for contributing to civic improvement.

Regards,
CRP India Civic Grievance Cell
https://crp-india.gov.in
    `.trim();

    const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; line-height: 1.6; color: #1E293B; background-color: #F8FAFC; margin: 0; padding: 20px; }
    .container { max-width: 600px; margin: 0 auto; background: #FFFFFF; border-radius: 8px; border: 1px solid #E2E8F0; overflow: hidden; }
    .header { background: #071022; color: #FFFFFF; padding: 24px; text-align: center; }
    .header h1 { margin: 0; font-size: 1.25rem; font-weight: 700; letter-spacing: 0.5px; }
    .header p { margin: 4px 0 0 0; font-size: 0.8125rem; color: #94A3B8; }
    .content { padding: 24px; }
    .badge { display: inline-block; padding: 4px 12px; border-radius: 9999px; font-weight: 600; font-size: 0.8125rem; background-color: #EFF6FF; color: #1D4ED8; }
    .resolved-badge { background-color: #ECFDF5; color: #047857; }
    .card { background: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 6px; padding: 16px; margin: 18px 0; }
    .field { margin-bottom: 10px; font-size: 0.875rem; }
    .field-label { color: #64748B; font-weight: 600; }
    .btn { display: inline-block; background-color: #1E40AF; color: #FFFFFF !important; text-decoration: none; padding: 10px 20px; border-radius: 6px; font-weight: 600; font-size: 0.875rem; margin-top: 14px; }
    .footer { padding: 18px 24px; background: #F1F5F9; border-top: 1px solid #E2E8F0; font-size: 0.75rem; color: #64748B; text-align: center; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Civic Grievance Redressal Portal</h1>
      <p>Official Citizen Notification &bull; Government of India</p>
    </div>
    <div class="content">
      <p>Dear <strong>${recipient.name}</strong>,</p>
      <p>The status of your registered grievance has been updated by municipal authorities.</p>

      <div class="card">
        <div class="field"><span class="field-label">Reference ID:</span> <strong>${complaint.referenceId}</strong></div>
        <div class="field"><span class="field-label">Title:</span> ${complaint.title}</div>
        <div class="field"><span class="field-label">Category:</span> ${complaint.category}</div>
        <div class="field"><span class="field-label">Status:</span> <span class="badge ${isResolved ? 'resolved-badge' : ''}">${newStatus}</span></div>
        ${remark ? `<div class="field"><span class="field-label">Authority Remark:</span> ${remark}</div>` : ''}
        ${isResolved && resolutionNote ? `<div class="field"><span class="field-label">Resolution Note:</span> ${resolutionNote}</div>` : ''}
        ${isResolved && resolutionPhoto ? `<div class="field"><span class="field-label">Resolution Proof:</span> <a href="${resolutionPhoto}" target="_blank" style="color:#1D4ED8;">View Resolution Photo</a></div>` : ''}
      </div>

      <div style="text-align: center;">
        <a href="${trackingUrl}" class="btn">Track Grievance Online</a>
      </div>
    </div>
    <div class="footer">
      <p>&copy; ${new Date().getFullYear()} CRP India. All rights reserved. Civic Infrastructure & Grievance Division.</p>
      <p>This is an automated notification from crpindianew@gmail.com. Please do not reply directly to this email.</p>
    </div>
  </div>
</body>
</html>
    `.trim();

    return await sendMailSafe({
      to: recipient.email,
      subject,
      text,
      html
    });
  } catch (err) {
    console.error(`[EMAIL] sendStatusUpdateEmail error for ${complaint?.referenceId}:`, err.message);
    return { success: false, error: err.message };
  }
};

/**
 * Sends a notification email when a complaint is marked as Duplicate.
 */
const sendDuplicateNoticeEmail = async ({ complaint, explanation, officerDept, officerName }) => {
  try {
    const recipient = await resolveCitizenRecipient(complaint);
    if (!recipient.shouldSend) {
      console.log(`[EMAIL] Duplicate notice skipped for ref ${complaint.referenceId}: ${recipient.reason}`);
      return { success: false, reason: recipient.reason };
    }

    const clientUrl = (process.env.CLIENT_URL || 'http://localhost:5173').replace(/\/$/, '');
    const trackingUrl = `${clientUrl}/track?ref=${encodeURIComponent(complaint.referenceId)}`;

    const subject = `[CRP India] Notice: Grievance Ref #${complaint.referenceId} Marked as Duplicate`;

    const text = `
Dear ${recipient.name},

Your registered grievance Ref #${complaint.referenceId} has been marked as a Duplicate by municipal authorities.

Details:
- Reference ID: ${complaint.referenceId}
- Title: ${complaint.title}
- Status: Duplicate
- Municipal Department: ${officerDept || 'Municipal Authority'}
- Official Explanation: ${explanation}

Advisory Information:
Municipal authorities frequently merge identical or duplicate grievance reports submitted for the same civic defect or geographic location to ensure efficient allocation of engineering and maintenance resources. Work on the underlying defect is tracked under the primary complaint.

You can view complete records on the citizen portal:
${trackingUrl}

Regards,
CRP India Civic Grievance Cell
    `.trim();

    const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; line-height: 1.6; color: #1E293B; background-color: #F8FAFC; margin: 0; padding: 20px; }
    .container { max-width: 600px; margin: 0 auto; background: #FFFFFF; border-radius: 8px; border: 1px solid #E2E8F0; overflow: hidden; }
    .header { background: #071022; color: #FFFFFF; padding: 24px; text-align: center; }
    .header h1 { margin: 0; font-size: 1.25rem; font-weight: 700; }
    .content { padding: 24px; }
    .badge { display: inline-block; padding: 4px 12px; border-radius: 9999px; font-weight: 600; font-size: 0.8125rem; background-color: #FEF3C7; color: #92400E; }
    .card { background: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 6px; padding: 16px; margin: 18px 0; }
    .field { margin-bottom: 10px; font-size: 0.875rem; }
    .field-label { color: #64748B; font-weight: 600; }
    .notice-box { background: #FFFBEB; border-left: 4px solid #F59E0B; padding: 12px 16px; font-size: 0.8125rem; color: #92400E; margin: 16px 0; border-radius: 0 4px 4px 0; }
    .btn { display: inline-block; background-color: #1E40AF; color: #FFFFFF !important; text-decoration: none; padding: 10px 20px; border-radius: 6px; font-weight: 600; font-size: 0.875rem; }
    .footer { padding: 18px 24px; background: #F1F5F9; border-top: 1px solid #E2E8F0; font-size: 0.75rem; color: #64748B; text-align: center; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Civic Grievance Redressal Portal</h1>
      <p style="margin:4px 0 0 0; color:#94A3B8; font-size:0.8125rem;">Official Notice &bull; Duplicate Classification</p>
    </div>
    <div class="content">
      <p>Dear <strong>${recipient.name}</strong>,</p>
      <p>Your grievance report has been reviewed and marked as a <strong>Duplicate</strong> by civic authorities.</p>

      <div class="card">
        <div class="field"><span class="field-label">Reference ID:</span> <strong>${complaint.referenceId}</strong></div>
        <div class="field"><span class="field-label">Title:</span> ${complaint.title}</div>
        <div class="field"><span class="field-label">Status:</span> <span class="badge">Duplicate</span></div>
        <div class="field"><span class="field-label">Reviewing Authority:</span> ${officerDept || 'Municipal Authority'}</div>
        <div class="field"><span class="field-label">Reason / Explanation:</span> ${explanation}</div>
      </div>

      <div class="notice-box">
        <strong>Civic Filing Advisory:</strong> Municipal authorities consolidate duplicate reports filed for the same infrastructure defect or location to maintain effective field response. Rectification work proceeds under the designated primary grievance ticket.
      </div>

      <div style="text-align: center; margin-top: 20px;">
        <a href="${trackingUrl}" class="btn">View Complaint Record</a>
      </div>
    </div>
    <div class="footer">
      <p>&copy; ${new Date().getFullYear()} CRP India. All rights reserved. Civic Infrastructure & Grievance Division.</p>
      <p>This is an automated notification from crpindianew@gmail.com.</p>
    </div>
  </div>
</body>
</html>
    `.trim();

    return await sendMailSafe({
      to: recipient.email,
      subject,
      text,
      html
    });
  } catch (err) {
    console.error(`[EMAIL] sendDuplicateNoticeEmail error for ${complaint?.referenceId}:`, err.message);
    return { success: false, error: err.message };
  }
};

/**
 * Sends a notification email when a complaint is marked as Misinformation.
 */
const sendMisinformationNoticeEmail = async ({ complaint, explanation, officerDept, officerName }) => {
  try {
    const recipient = await resolveCitizenRecipient(complaint);
    if (!recipient.shouldSend) {
      console.log(`[EMAIL] Misinformation notice skipped for ref ${complaint.referenceId}: ${recipient.reason}`);
      return { success: false, reason: recipient.reason };
    }

    const clientUrl = (process.env.CLIENT_URL || 'http://localhost:5173').replace(/\/$/, '');
    const trackingUrl = `${clientUrl}/track?ref=${encodeURIComponent(complaint.referenceId)}`;

    const subject = `[CRP India] Notice: Grievance Ref #${complaint.referenceId} Flagged as Misinformation`;

    const text = `
Dear ${recipient.name},

Your registered grievance Ref #${complaint.referenceId} has been flagged as Misinformation by municipal authorities following field inspection.

Details:
- Reference ID: ${complaint.referenceId}
- Title: ${complaint.title}
- Status: Misinformation
- Municipal Department: ${officerDept || 'Municipal Authority'}
- Official Reason: ${explanation}

Important Civic Notice:
Civic authorities verify reports on the ground. Reports determined to be factually inaccurate, non-existent, or misleading are marked as Misinformation to preserve municipal resource allocation. Continued submission of verified misinformation may lead to account restrictions.

You can inspect the official record on the citizen portal:
${trackingUrl}

Regards,
CRP India Civic Grievance Cell
    `.trim();

    const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; line-height: 1.6; color: #1E293B; background-color: #F8FAFC; margin: 0; padding: 20px; }
    .container { max-width: 600px; margin: 0 auto; background: #FFFFFF; border-radius: 8px; border: 1px solid #E2E8F0; overflow: hidden; }
    .header { background: #071022; color: #FFFFFF; padding: 24px; text-align: center; }
    .header h1 { margin: 0; font-size: 1.25rem; font-weight: 700; }
    .content { padding: 24px; }
    .badge { display: inline-block; padding: 4px 12px; border-radius: 9999px; font-weight: 600; font-size: 0.8125rem; background-color: #FEE2E2; color: #B91C1C; }
    .card { background: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 6px; padding: 16px; margin: 18px 0; }
    .field { margin-bottom: 10px; font-size: 0.875rem; }
    .field-label { color: #64748B; font-weight: 600; }
    .warning-box { background: #FEF2F2; border-left: 4px solid #EF4444; padding: 12px 16px; font-size: 0.8125rem; color: #991B1B; margin: 16px 0; border-radius: 0 4px 4px 0; }
    .btn { display: inline-block; background-color: #1E40AF; color: #FFFFFF !important; text-decoration: none; padding: 10px 20px; border-radius: 6px; font-weight: 600; font-size: 0.875rem; }
    .footer { padding: 18px 24px; background: #F1F5F9; border-top: 1px solid #E2E8F0; font-size: 0.75rem; color: #64748B; text-align: center; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Civic Grievance Redressal Portal</h1>
      <p style="margin:4px 0 0 0; color:#94A3B8; font-size:0.8125rem;">Official Notice &bull; Civic Information Advisory</p>
    </div>
    <div class="content">
      <p>Dear <strong>${recipient.name}</strong>,</p>
      <p>Your grievance report has been reviewed and flagged as <strong>Misinformation</strong> following municipal verification.</p>

      <div class="card">
        <div class="field"><span class="field-label">Reference ID:</span> <strong>${complaint.referenceId}</strong></div>
        <div class="field"><span class="field-label">Title:</span> ${complaint.title}</div>
        <div class="field"><span class="field-label">Status:</span> <span class="badge">Misinformation</span></div>
        <div class="field"><span class="field-label">Reviewing Authority:</span> ${officerDept || 'Municipal Authority'}</div>
        <div class="field"><span class="field-label">Official Finding:</span> ${explanation}</div>
      </div>

      <div class="warning-box">
        <strong>Civic Accountability Advisory:</strong> Grievance reports verified to contain fabricated or inaccurate information divert emergency and maintenance crews. Please ensure reported defects reflect genuine civic conditions.
      </div>

      <div style="text-align: center; margin-top: 20px;">
        <a href="${trackingUrl}" class="btn">View Complaint Record</a>
      </div>
    </div>
    <div class="footer">
      <p>&copy; ${new Date().getFullYear()} CRP India. All rights reserved. Civic Infrastructure & Grievance Division.</p>
      <p>This is an automated notification from crpindianew@gmail.com.</p>
    </div>
  </div>
</body>
</html>
    `.trim();

    return await sendMailSafe({
      to: recipient.email,
      subject,
      text,
      html
    });
  } catch (err) {
    console.error(`[EMAIL] sendMisinformationNoticeEmail error for ${complaint?.referenceId}:`, err.message);
    return { success: false, error: err.message };
  }
};

module.exports = {
  getSmtpConfig,
  getSafeConfigDiagnostic,
  verifyTransporterSafe,
  maskEmail,
  getTransporter,
  setTransporterForTesting,
  resetTransporterForTesting,
  resolveCitizenRecipient,
  sendStatusUpdateEmail,
  sendDuplicateNoticeEmail,
  sendMisinformationNoticeEmail
};
