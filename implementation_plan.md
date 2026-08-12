# Comprehensive Email Integration & Documentation Plan

Integrate Nodemailer transactional email delivery (`emailService.js`) across all platform workflows: User Registration, Password Reset, Commerce Order Confirmation, and Google OAuth Sign-Up, as requested by the user. In addition, create full documentation in `docs/EMAIL_INTEGRATION.md` and verify end-to-end authentication and checkout flows.

## Proposed Changes

### Backend Controllers

#### [MODIFY] [authController.js](file:///d:/Veritus2/server/src/controllers/authController.js)
- **User Registration (`register`)**: Trigger a styled Welcome & Verification Email to newly registered users containing their account details and verification confirmation.
- **Password Reset (`resetPassword`)**: Generate a secure password reset token link and send a Password Reset Email to the user's registered email address.
- **Google Sign-In (`googleLogin`)**: Send a Welcome Email when a user signs up for the first time via Google OAuth.

#### [MODIFY] [commerceController.js](file:///d:/Veritus2/server/src/controllers/commerceController.js)
- **Complete Checkout (`completeCheckout`)**: Send an Order Receipt & Entitlement Access Email to `order.user_email` containing item title, transaction amount, order ID, and access link.
- **Stripe Webhook (`handleStripeWebhook`)**: Trigger the Order Receipt Email upon successful payment webhook events.

#### [MODIFY] [emailService.js](file:///d:/Veritus2/server/src/services/emailService.js)
- Add specialized HTML email template helper functions for:
  - `sendWelcomeEmail(user)`
  - `sendPasswordResetEmail(user, resetToken)`
  - `sendOrderReceiptEmail(order, item)`

---

### Documentation

#### [NEW] [EMAIL_INTEGRATION.md](file:///d:/Veritus2/docs/EMAIL_INTEGRATION.md)
- Create a dedicated `docs/` folder in project root.
- Document all email integration points, trigger events, recipient logic, email body templates, environment configurations, and failover behavior.

---

## Verification Plan

### Automated / End-to-End Script Verification
1. Run API test scripts using Node to test:
   - User Registration (`POST /api/auth/register`) $\rightarrow$ Verify welcome email dispatched.
   - Password Reset (`POST /api/auth/reset-password`) $\rightarrow$ Verify password reset email dispatched.
   - Order Checkout (`POST /api/checkout/complete`) $\rightarrow$ Verify order receipt email dispatched.
   - Contact Form (`POST /api/contact`) $\rightarrow$ Verify contact inquiry email dispatched.
2. Verify all emails arrive successfully via SMTP using the verified credentials (`aamir.fss22@gmail.com`).
