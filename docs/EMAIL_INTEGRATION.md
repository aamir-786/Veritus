# Veritus Effective RM - Email Integration Documentation

This document outlines the end-to-end transactional email integration within the Veritus Platform. The email system uses **Nodemailer** with an intelligent failover mechanism to ensure high deliverability across production and sandbox environments.

## 1. System Architecture & Failover

The email service (`server/src/services/emailService.js`) employs a cascading transport strategy:

1.  **Gmail OAuth2 (Primary)**: Attempts to use Google OAuth2 tokens (`GMAIL_CLIENT_ID`, `GMAIL_CLIENT_SECRET`, `GMAIL_REFRESH_TOKEN`). Highly secure but requires active token refresh.
2.  **Standard SMTP (Fallback)**: If OAuth2 fails or is unconfigured, falls back to standard SSL SMTP (`SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`). Currently configured to use an App Password on Port 465.
3.  **Ethereal Sandbox (Development/Fail-Safe)**: If all real authentication fails (e.g., expired credentials), the system automatically provisions a temporary Ethereal test account. This prevents the application from crashing and outputs a preview URL to the console, ensuring seamless development and testing.

## 2. Configuration Setup

The email credentials must be set in the backend environment variables (`server/.env`). For cloud deployments (e.g., Render, Vercel Serverless), these must be added to the hosting provider's dashboard.

```env
# Required for Standard SMTP (Active Configuration)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=465
SMTP_USER=aamir.fss22@gmail.com
SMTP_PASS=your_16_character_app_password
FROM_EMAIL=aamir.fss22@gmail.com
```

> [!IMPORTANT]  
> The `SMTP_PASS` must be a 16-character **Google App Password**, *not* your standard Google account password.

## 3. Email Triggers and Workflows

The platform integrates email notifications across critical user touchpoints. All emails utilize the `renderExecutiveEmailTemplate` engine for a consistent, premium dark-themed design matching the Veritus brand.

### A. User Registration & Google OAuth (Welcome Email)
*   **Controller**: `authController.register` and `authController.googleLogin`
*   **Trigger**: When a new user successfully creates an account manually or logs in via Google for the first time.
*   **Function**: `sendWelcomeEmail({ email, name })`
*   **Content**: Welcome message, account profile summary (Email, Tier), and details of their unlocked access (100 Risk Questions, AI Copilot, etc.). Includes a CTA to access the dashboard.

### B. Password Reset (Security Verification)
*   **Controller**: `authController.resetPassword`
*   **Trigger**: When a user requests a password reset.
*   **Function**: `sendPasswordResetEmail({ email, resetToken })`
*   **Content**: Security notice, account identifier, and a secure, time-sensitive (1 hour) CTA link to reset the password.

### C. Commerce & Checkout (Order Receipt)
*   **Controller**: `commerceController.completeCheckout` and `commerceController.handleStripeWebhook`
*   **Trigger**: When a user completes a simulated hosted checkout OR when a production Stripe Webhook (`checkout.session.completed` / `payment_intent.succeeded`) is received.
*   **Function**: `sendOrderReceiptEmail({ email, name, order })`
*   **Content**: Payment confirmation, detailed order summary table (Order ID, Item Title, Amount Paid, Date), and a CTA to access the newly unlocked digital entitlement.

### D. Enterprise Contact Inquiry
*   **Controller**: `api.js` (`POST /contact`)
*   **Trigger**: When a user submits the public contact form.
*   **Function**: Uses generic `sendEmail` directly.
*   **Content**: Forwards the user's name, email, company, and message to the platform administrator (`FROM_EMAIL`).

## 4. Design & Templates

The master renderer (`renderExecutiveEmailTemplate`) ensures every outgoing email features:
*   **Dark Executive Theme**: `#070b14` background with a glassmorphic `#0f172a` primary card.
*   **Header Branding**: The "VERITUS | EFFECTIVE RM" logo layout with a context-specific category badge (e.g., "Account Active", "Security Notice").
*   **Structured Content**: Clean typography with dynamic accent colors based on context (Blue for Welcome, Red for Security, Green for Commerce).
*   **Actionable CTA**: Prominent, highly visible buttons directing the user back to the application (`https://veritus-r8pb.onrender.com`).
*   **Compliance Footer**: Standardized support contact and copyright/confidentiality notices.
