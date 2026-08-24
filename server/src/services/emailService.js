const nodemailer = require('nodemailer');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });
require('dotenv').config({ path: path.join(__dirname, '../../../.env') });

let cachedOAuthTransporter = null;
let cachedSmtpTransporter = null;
let cachedEtherealTransporter = null;

const createOAuthTransporter = () => {
  const smtpUser = process.env.SMTP_USER || 'mr.amir.mangrio@gmail.com';
  const gmailClientId = process.env.GMAIL_CLIENT_ID;
  const gmailClientSecret = process.env.GMAIL_CLIENT_SECRET;
  const gmailRefreshToken = process.env.GMAIL_REFRESH_TOKEN;

  if (gmailClientId && gmailClientSecret && gmailRefreshToken) {
    return nodemailer.createTransport({
      service: 'gmail',
      auth: {
        type: 'OAuth2',
        user: smtpUser,
        clientId: gmailClientId,
        clientSecret: gmailClientSecret,
        refreshToken: gmailRefreshToken
      }
    });
  }
  return null;
};

const createSmtpTransporter = () => {
  const smtpUser = process.env.SMTP_USER || 'mr.amir.mangrio@gmail.com';
  const smtpPass = process.env.SMTP_PASS;
  const smtpHost = process.env.SMTP_HOST || 'smtp.gmail.com';
  const smtpPort = parseInt(process.env.SMTP_PORT || '465', 10);

  if (smtpUser && smtpPass) {
    return nodemailer.createTransport({
      host: smtpHost,
      port: smtpPort,
      secure: smtpPort === 465,
      auth: {
        user: smtpUser,
        pass: smtpPass
      }
    });
  }
  return null;
};

const createEtherealTransporter = async () => {
  if (cachedEtherealTransporter) return cachedEtherealTransporter;
  const testAccount = await nodemailer.createTestAccount();
  console.log('[EmailService] Created Ethereal test account:', testAccount.user);
  cachedEtherealTransporter = nodemailer.createTransport({
    host: 'smtp.ethereal.email',
    port: 587,
    secure: false,
    auth: {
      user: testAccount.user,
      pass: testAccount.pass
    }
  });
  return cachedEtherealTransporter;
};

/**
 * Send an email notification with automatic failover (OAuth2 -> SMTP -> Ethereal Sandbox)
 * @param {Object} options - { to, subject, text, html }
 */
const sendEmail = async ({ to, subject, text, html }) => {
  const fromAddress = process.env.FROM_EMAIL || process.env.SMTP_USER || 'mr.amir.mangrio@gmail.com';
  const mailOptions = {
    from: `"Veritus Effective RM" <${fromAddress}>`,
    to,
    subject,
    text,
    html
  };

  // 1. Try Resend HTTP API if RESEND_API_KEY is configured (Recommended for Vercel Serverless)
  const resendApiKey = process.env.RESEND_API_KEY;
  if (resendApiKey) {
    try {
      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${resendApiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          from: process.env.FROM_EMAIL || 'Veritus Effective RM <onboarding@resend.dev>',
          to: Array.isArray(to) ? to : [to],
          subject,
          text,
          html
        })
      });
      const data = await response.json();
      if (response.ok && data.id) {
        console.log('[EmailService] Email sent via Resend HTTP API successfully:', data.id);
        return { success: true, method: 'resend-api', messageId: data.id };
      } else {
        console.warn('[EmailService] Resend API error:', data);
      }
    } catch (err) {
      console.warn('[EmailService] Resend API call failed:', err.message, '- attempting SMTP fallbacks...');
    }
  }

  // 2. Try OAuth2 Transporter if configured
  if (!cachedOAuthTransporter) {
    cachedOAuthTransporter = createOAuthTransporter();
  }
  if (cachedOAuthTransporter) {
    try {
      const info = await cachedOAuthTransporter.sendMail(mailOptions);
      console.log('[EmailService] Email sent via Gmail OAuth2 successfully:', info.messageId);
      return { success: true, method: 'gmail-oauth2', messageId: info.messageId };
    } catch (err) {
      console.warn('[EmailService] Gmail OAuth2 failed:', err.message, '- attempting standard SMTP fallback...');
    }
  }

  // 2. Try Standard SMTP Transporter
  if (!cachedSmtpTransporter) {
    cachedSmtpTransporter = createSmtpTransporter();
  }
  if (cachedSmtpTransporter) {
    try {
      const info = await cachedSmtpTransporter.sendMail(mailOptions);
      console.log('[EmailService] Email sent via Standard SMTP successfully:', info.messageId);
      return { success: true, method: 'smtp', messageId: info.messageId };
    } catch (err) {
      console.warn('[EmailService] Standard SMTP failed:', err.message, '- attempting Ethereal test transport fallback...');
    }
  }

  // 3. Fallback to Ethereal Test Transport (ensures delivery preview URL during dev/testing)
  try {
    const etherealTransporter = await createEtherealTransporter();
    const info = await etherealTransporter.sendMail({
      ...mailOptions,
      from: `"Veritus Sandbox" <test@ethereal.email>`
    });
    const previewUrl = nodemailer.getTestMessageUrl(info);
    console.log('[EmailService] Email sent via Ethereal Sandbox successfully!');
    console.log('[EmailService] Preview URL:', previewUrl);
    return {
      success: true,
      method: 'ethereal-sandbox',
      messageId: info.messageId,
      previewUrl,
      note: 'Primary SMTP/OAuth credentials failed or expired; delivered to sandbox.'
    };
  } catch (err) {
    console.error('[EmailService] All email transports failed:', err.message);
    return { success: false, error: err.message };
  }
};

/**
 * Executive Master HTML Email Renderer for Veritus Effective RM
 * Builds executive dark-themed, responsive HTML emails with crisp typography,
 * branded header, structured cards, CTA button, and compliance footer.
 */
const renderExecutiveEmailTemplate = ({ title, badge, contentHtml, ctaText, ctaUrl, accentColor = '#38bdf8' }) => {
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${title}</title>
    </head>
    <body style="margin: 0; padding: 0; background-color: #070b14; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #f8fafc; -webkit-font-smoothing: antialiased;">
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #070b14; padding: 32px 16px;">
        <tr>
          <td align="center">
            <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width: 600px; background-color: #0f172a; border-radius: 12px; border: 1px solid #1e293b; overflow: hidden; box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.5), 0 8px 10px -6px rgba(0, 0, 0, 0.5);">
              
              <!-- HEADER BRANDING -->
              <tr>
                <td style="background: linear-gradient(135deg, #0b1329 0%, #1e293b 100%); padding: 28px 32px; border-bottom: 1px solid #334155;">
                  <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                    <tr>
                      <td>
                        <div style="font-size: 22px; font-weight: 800; tracking: 1px; color: #ffffff; letter-spacing: 1.5px;">
                          VERITUS <span style="color: ${accentColor}; font-weight: 400; font-size: 14px; letter-spacing: 1px;">| EFFECTIVE RM</span>
                        </div>
                        <div style="font-size: 11px; color: #94a3b8; text-transform: uppercase; letter-spacing: 1.5px; margin-top: 4px;">
                          Executive Risk & Decision Intelligence Platform
                        </div>
                      </td>
                      ${badge ? `
                        <td align="right" valign="top">
                          <span style="background-color: ${accentColor}1e; color: ${accentColor}; border: 1px solid ${accentColor}40; padding: 4px 10px; border-radius: 20px; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px;">
                            ${badge}
                          </span>
                        </td>
                      ` : ''}
                    </tr>
                  </table>
                </td>
              </tr>

              <!-- BODY CONTENT -->
              <tr>
                <td style="padding: 32px; color: #e2e8f0; font-size: 15px; line-height: 1.6;">
                  <h1 style="color: #ffffff; font-size: 20px; font-weight: 700; margin-top: 0; margin-bottom: 16px; border-left: 3px solid ${accentColor}; padding-left: 12px;">
                    ${title}
                  </h1>
                  
                  ${contentHtml}

                  ${ctaText && ctaUrl ? `
                    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin-top: 32px; margin-bottom: 16px;">
                      <tr>
                        <td align="center">
                          <a href="${ctaUrl}" target="_blank" style="background-color: ${accentColor}; color: #090d16; font-size: 15px; font-weight: 700; text-decoration: none; padding: 14px 32px; border-radius: 8px; display: inline-block; box-shadow: 0 4px 14px rgba(56, 189, 248, 0.3);">
                            ${ctaText} &rarr;
                          </a>
                        </td>
                      </tr>
                    </table>
                  ` : ''}
                </td>
              </tr>

              <!-- FOOTER -->
              <tr>
                <td style="background-color: #0b1120; padding: 24px 32px; border-top: 1px solid #1e293b; font-size: 12px; color: #64748b; text-align: center;">
                  <p style="margin: 0 0 8px 0; color: #94a3b8; font-size: 12px; font-weight: 600;">
                    Veritus – Deciding in the Dark Knowledge Platform
                  </p>
                  <p style="margin: 0 0 12px 0;">
                    Official Support Contact: <a href="mailto:aamir.fss22@gmail.com" style="color: ${accentColor}; text-decoration: none;">aamir.fss22@gmail.com</a>
                  </p>
                  <div style="font-size: 11px; color: #475569; margin-top: 12px; border-top: 1px solid #1e293b; padding-top: 12px;">
                    Confidential &amp; Proprietary Notice: This email was sent to an authorized Veritus user. © 2026 Veritus Effective RM. All rights reserved.
                  </div>
                </td>
              </tr>

            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;
};

const APP_URL = (process.env.APP_URL || process.env.CLIENT_URL || 'https://veritus-effectiverm.vercel.app').replace(/\/+$/, '');

/**
 * Send Welcome Email to newly registered user
 */
const sendWelcomeEmail = async ({ email, name }) => {
  const recipientName = name || 'Valued Risk Practitioner';
  
  const contentHtml = `
    <p style="margin-top: 0;">Hello <strong>${recipientName}</strong>,</p>
    <p>Welcome to <strong>Veritus Effective RM</strong>. Your executive risk decision-making account has been successfully provisioned and activated.</p>
    
    <div style="background-color: #1e293b; border: 1px solid #334155; padding: 18px; border-radius: 8px; margin: 24px 0;">
      <div style="font-size: 12px; color: #94a3b8; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 6px; font-weight: 700;">Account Profile Summary</div>
      <div style="font-size: 15px; color: #ffffff;"><strong>Registered Email:</strong> ${email}</div>
      <div style="font-size: 14px; color: #38bdf8; margin-top: 4px;"><strong>Account Tier:</strong> Executive Practitioner</div>
    </div>

    <p>With your active account, you gain full access to:</p>
    <ul style="color: #cbd5e1; padding-left: 20px; line-height: 1.8;">
      <li><strong>100 Risk Questions Dataset:</strong> Executive decision frameworks &amp; taxonomy tags.</li>
      <li><strong>AI Risk Copilot:</strong> Interactive organizational risk analysis engine.</li>
      <li><strong>Executive Masterclasses &amp; Digital Library:</strong> Governance templates and video modules.</li>
    </ul>
  `;

  const html = renderExecutiveEmailTemplate({
    title: 'Welcome to Veritus Executive Platform',
    badge: 'Account Active',
    contentHtml,
    ctaText: 'Access Executive Dashboard',
    ctaUrl: `${APP_URL}/dashboard`,
    accentColor: '#38bdf8'
  });

  return sendEmail({
    to: email,
    subject: 'Welcome to Veritus Effective RM Platform',
    text: `Hello ${recipientName},\n\nWelcome to Veritus! Your account (${email}) has been successfully created.`,
    html
  });
};

/**
 * Send Password Reset Email with Token
 */
const sendPasswordResetEmail = async ({ email, resetToken }) => {
  const resetLink = `${APP_URL}/reset-password?token=${resetToken}&email=${encodeURIComponent(email)}`;
  
  const contentHtml = `
    <p style="margin-top: 0;">Hello,</p>
    <p>We received a security request to reset the password for your Veritus Effective RM account (<strong>${email}</strong>).</p>
    
    <div style="background-color: #1e1b2e; border: 1px solid #4c1d95; padding: 16px; border-radius: 8px; margin: 20px 0;">
      <div style="font-size: 13px; color: #c084fc; font-weight: 600;">🔒 Security Verification Link</div>
      <div style="font-size: 13px; color: #94a3b8; margin-top: 4px;">This security link is single-use and will expire in <strong>60 minutes</strong>.</div>
    </div>

    <p>Click the secure button below to set your new password:</p>
  `;

  const html = renderExecutiveEmailTemplate({
    title: 'Password Reset Security Verification',
    badge: 'Security Notice',
    contentHtml,
    ctaText: 'Reset Password Securely',
    ctaUrl: resetLink,
    accentColor: '#f43f5e'
  });

  return sendEmail({
    to: email,
    subject: 'Veritus Account Security: Reset Your Password',
    text: `Hello,\n\nReset your password using this link: ${resetLink}`,
    html
  });
};

/**
 * Send Order Receipt Email
 */
const sendOrderReceiptEmail = async ({ email, name, order }) => {
  const recipientName = name || order.card_holder_name || 'Valued Customer';
  
  const contentHtml = `
    <p style="margin-top: 0;">Hello <strong>${recipientName}</strong>,</p>
    <p>Thank you for your transaction on Veritus. Your order has been successfully processed and your entitlement is unlocked.</p>
    
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #1e293b; border: 1px solid #334155; border-radius: 8px; margin: 24px 0; overflow: hidden;">
      <tr style="background-color: #0f172a; border-bottom: 1px solid #334155;">
        <td style="padding: 12px 16px; font-size: 12px; color: #94a3b8; font-weight: 700; text-transform: uppercase;">Order Summary</td>
        <td align="right" style="padding: 12px 16px; font-size: 12px; color: #10b981; font-weight: 700;">Status: Paid</td>
      </tr>
      <tr>
        <td style="padding: 12px 16px; font-size: 14px; color: #94a3b8;">Order Transaction ID:</td>
        <td align="right" style="padding: 12px 16px; font-size: 14px; color: #ffffff; font-weight: 600;">${order.id}</td>
      </tr>
      <tr style="border-top: 1px solid #334155;">
        <td style="padding: 12px 16px; font-size: 14px; color: #94a3b8;">Purchased Product:</td>
        <td align="right" style="padding: 12px 16px; font-size: 14px; color: #38bdf8; font-weight: 600;">${order.product_title || 'Executive Risk Resource'}</td>
      </tr>
      <tr style="border-top: 1px solid #334155;">
        <td style="padding: 12px 16px; font-size: 14px; color: #94a3b8;">Total Amount Paid:</td>
        <td align="right" style="padding: 12px 16px; font-size: 16px; color: #10b981; font-weight: 800;">$${order.amount} USD</td>
      </tr>
      <tr style="border-top: 1px solid #334155;">
        <td style="padding: 12px 16px; font-size: 13px; color: #94a3b8;">Payment Date:</td>
        <td align="right" style="padding: 12px 16px; font-size: 13px; color: #cbd5e1;">${new Date(order.paid_at || Date.now()).toLocaleString()}</td>
      </tr>
    </table>

    <p>You can access your unlocked digital resource immediately from your executive member dashboard.</p>
  `;

  const html = renderExecutiveEmailTemplate({
    title: 'Order Receipt & Entitlement Confirmed',
    badge: 'Payment Success',
    contentHtml,
    ctaText: 'Access Purchased Content',
    ctaUrl: `${APP_URL}/dashboard`,
    accentColor: '#10b981'
  });

  return sendEmail({
    to: email,
    subject: `Veritus Order Receipt: ${order.product_title || 'Purchase Confirmation'} (${order.id})`,
    text: `Hello ${recipientName},\n\nPayment received for order ${order.id}. Amount: $${order.amount} USD. Product: ${order.product_title}`,
    html
  });
};

/**
 * Send Email Verification Email with Token
 */
const sendVerificationEmail = async ({ email, name, verificationToken }) => {
  const verifyLink = `${APP_URL}/verify-email?token=${verificationToken}`;
  const recipientName = name || 'Risk Practitioner';
  
  const contentHtml = `
    <p style="margin-top: 0;">Hello <strong>${recipientName}</strong>,</p>
    <p>Thank you for registering with <strong>Veritus Effective RM</strong>. Please verify your email address to activate your account.</p>
    
    <div style="background-color: #1e293b; border: 1px solid #334155; padding: 18px; border-radius: 8px; margin: 24px 0;">
      <div style="font-size: 13px; color: #94a3b8; font-weight: 600;">📧 Email Verification Required</div>
      <div style="font-size: 14px; color: #38bdf8; margin-top: 4px;">Click the button below to verify this email address and gain full access to the executive platform.</div>
    </div>
  `;

  const html = renderExecutiveEmailTemplate({
    title: 'Verify Your Email Address',
    badge: 'Action Required',
    contentHtml,
    ctaText: 'Verify Email',
    ctaUrl: verifyLink,
    accentColor: '#38bdf8'
  });

  return sendEmail({
    to: email,
    subject: 'Veritus Account: Verify Your Email',
    text: `Hello ${recipientName},\n\nPlease verify your email by clicking this link: ${verifyLink}`,
    html
  });
};

module.exports = {
  sendEmail,
  sendWelcomeEmail,
  sendPasswordResetEmail,
  sendOrderReceiptEmail,
  sendVerificationEmail,
  renderExecutiveEmailTemplate
};



