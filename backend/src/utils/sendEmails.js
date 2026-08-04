const transporter = require('../config/email');

/* Actual send — used internally, always wrapped in try/catch by callers */
const sendEmail = async ({ to, subject, html }) => {
  try {
    await transporter.sendMail({
      from:    process.env.EMAIL_FROM,
      to,
      subject,
      html,
    });
    console.log(`✉️  Email sent to ${to} — "${subject}"`);
    return true;
  } catch (error) {
    console.error(`❌ Email failed to ${to}: ${error.message}`);
    return false;
  }
};

/* Fire-and-forget wrapper — never blocks or throws into the calling request.
   Use this everywhere in controllers instead of awaiting sendEmail directly. */
const queueEmail = (options) => {
  setImmediate(() => {
    sendEmail(options).catch(err => {
      console.error('Email queue error:', err.message);
    });
  });
};

/* ── Email templates ── */
const emailTemplates = {

  verificationCode: (name, code) => ({
    subject: 'Verify Your Email — FUL Clearance System',
    html: `
      <div style="font-family:Inter,sans-serif;max-width:520px;margin:0 auto;padding:32px;background:#f9fafb;border-radius:12px;">
        <div style="background:#1a3d7a;padding:24px;border-radius:8px;text-align:center;margin-bottom:24px;">
          <h1 style="color:#fbbf24;margin:0;font-size:22px;">FUL Clearance System</h1>
          <p style="color:rgba(255,255,255,0.7);margin:8px 0 0;font-size:14px;">Federal University Lokoja</p>
        </div>
        <h2 style="color:#111827;">Hello, ${name}</h2>
        <p style="color:#4b5563;line-height:1.7;">Please use the verification code below to verify your email address.</p>
        <div style="background:#1a3d7a;color:#fff;font-size:36px;font-weight:bold;letter-spacing:16px;text-align:center;padding:24px;border-radius:8px;margin:24px 0;">
          ${code}
        </div>
        <p style="color:#6b7280;font-size:14px;">This code expires in <strong>10 minutes</strong>. If you did not request this, please ignore this email.</p>
      </div>
    `,
  }),

  clearanceApproved: (name, department, officerName) => ({
    subject: `Clearance Approved — ${department}`,
    html: `
      <div style="font-family:Inter,sans-serif;max-width:520px;margin:0 auto;padding:32px;">
        <div style="background:#dcfce7;border-radius:8px;padding:20px;text-align:center;margin-bottom:20px;">
          <h2 style="color:#16a34a;margin:0;">✅ Clearance Approved</h2>
        </div>
        <p>Dear <strong>${name}</strong>,</p>
        <p>Your clearance for <strong>${department}</strong> has been approved${officerName ? ` by ${officerName}` : ''}.</p>
        <p style="color:#6b7280;font-size:14px;">Log in to your portal to check your overall progress.</p>
      </div>
    `,
  }),

  clearanceRejected: (name, department, reason) => ({
    subject: `Clearance Rejected — ${department}`,
    html: `
      <div style="font-family:Inter,sans-serif;max-width:520px;margin:0 auto;padding:32px;">
        <div style="background:#fee2e2;border-radius:8px;padding:20px;text-align:center;margin-bottom:20px;">
          <h2 style="color:#dc2626;margin:0;">❌ Clearance Rejected</h2>
        </div>
        <p>Dear <strong>${name}</strong>,</p>
        <p>Your clearance for <strong>${department}</strong> was rejected.</p>
        <p style="background:#f9fafb;padding:12px 16px;border-radius:8px;border-left:3px solid #dc2626;"><strong>Reason:</strong> ${reason}</p>
        <p style="color:#6b7280;font-size:14px;">Please address the issue and resubmit through the portal.</p>
      </div>
    `,
  }),

  certificateReady: (name) => ({
    subject: 'Your Clearance Certificate is Ready',
    html: `
      <div style="font-family:Inter,sans-serif;max-width:520px;margin:0 auto;padding:32px;">
        <div style="background:#1a3d7a;border-radius:8px;padding:24px;text-align:center;margin-bottom:20px;">
          <h2 style="color:#fbbf24;margin:0;">🎓 Certificate Ready</h2>
        </div>
        <p>Dear <strong>${name}</strong>,</p>
        <p>Congratulations! Your clearance has been fully approved and your certificate is now available for download.</p>
        <p style="color:#6b7280;font-size:14px;">Log in to your portal to download your official clearance certificate.</p>
      </div>
    `,
  }),

  passwordReset: (name, resetUrl) => ({
    subject: 'Password Reset — FUL Clearance System',
    html: `
      <div style="font-family:Inter,sans-serif;max-width:520px;margin:0 auto;padding:32px;">
        <h2 style="color:#1a3d7a;">Reset Your Password</h2>
        <p>Dear <strong>${name}</strong>,</p>
        <p>Click the button below to reset your password. This link expires in <strong>1 hour</strong>.</p>
        <a href="${resetUrl}" style="display:inline-block;background:#1a3d7a;color:#fff;padding:12px 28px;border-radius:8px;text-decoration:none;margin:16px 0;font-weight:600;">
          Reset Password
        </a>
        <p style="color:#6b7280;font-size:14px;">If you did not request this, please ignore this email.</p>
      </div>
    `,
  }),

  clearanceSubmittedOfficerAlert: (studentName, matric, department) => ({
    subject: `New Clearance Request — ${department}`,
    html: `
      <div style="font-family:Inter,sans-serif;max-width:520px;margin:0 auto;padding:32px;">
        <h2 style="color:#1a3d7a;">New Request Awaiting Review</h2>
        <p><strong>${studentName}</strong> (${matric}) has submitted a clearance request for <strong>${department}</strong>.</p>
        <p style="color:#6b7280;font-size:14px;">Log in to the officer portal to review and take action.</p>
      </div>
    `,
  }),
};

module.exports = { sendEmail, queueEmail, emailTemplates };