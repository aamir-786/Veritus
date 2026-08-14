const { renderExecutiveEmailTemplate } = require('./server/src/services/emailService');

const contentHtml = `
  <p style="margin-top: 0;">Hello,</p>
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
  ctaUrl: '{{ .ConfirmationURL }}', // Supabase template variable!
  accentColor: '#38bdf8'
});

console.log(html);
