# Stripe Verification and Checkout Gate Flow

This implementation plan addresses the two main requirements regarding the Stripe payment process.

## Goal Description
1. **Login Gate Before Checkout**: Ensure that users cannot proceed to the Stripe payment page without being logged in. If a guest user attempts to checkout, they will be redirected to the login/registration page, and upon successful authentication, they will seamlessly continue to Stripe.
2. **Payment Verification Page**: After a successful Stripe payment, the user will be redirected to a dedicated verification page instead of directly to the dashboard. This page will display a loader and poll the server to verify the payment. Once verified, it will display a success message and a button to proceed to the Dashboard learning page.

## Proposed Changes

### Backend Changes

#### [MODIFY] `server/src/routes/api.js`
- Add a new route `GET /commerce/verify-session/:sessionId` mapped to `commerceController.verifySession`.

#### [MODIFY] `server/src/controllers/commerceController.js`
- Update `createMultiCheckoutSession` to set the Stripe `success_url` to `${req.headers.origin}/payment-verification?session_id={CHECKOUT_SESSION_ID}`.
- Create a new method `verifySession(req, res)`:
  - Retrieves the checkout session from Stripe using the provided `sessionId`.
  - Checks if `session.payment_status === 'paid'`.
  - If paid, it executes the same fulfillment logic (updating order status to 'paid' and granting entitlements) just in case the webhook hasn't processed it yet, ensuring instant access.
  - Returns `{ success: true, verified: true }` if paid, or `verified: false` if still processing.

### Frontend Changes

#### [MODIFY] `client/src/App.jsx`
- Add the new route: `<Route path="/payment-verification" element={<PaymentVerification />} />`.

#### [NEW] `client/src/pages/PaymentVerification.jsx`
- A new page component that reads the `session_id` from the URL query parameters.
- Implements a polling mechanism (e.g., every 3 seconds) calling the new backend `/api/v1/commerce/verify-session/:sessionId` endpoint.
- Displays a prominent loading spinner and text: "Verifying your secure payment...".
- Upon receiving `verified: true`, changes the UI to a success state displaying "Payment Verified" and a button "Go to Dashboard Learning Page" which navigates to `/dashboard`.

#### [MODIFY] `client/src/components/CartDrawer.jsx`
- Update the `handleCheckout` function to check if `user` exists from `useAuth()`.
- If `!user`, it will call `closeCart()` and `navigate('/login?redirect=checkout')`.

#### [MODIFY] `client/src/pages/Login.jsx` & `client/src/pages/Register.jsx`
- Update the post-authentication logic.
- After a successful login/registration, check if `searchParams.get('redirect') === 'checkout'`.
- If true, directly invoke the backend `createMultiCheckoutSession` using the `cartItems` (from `CartContext`) and automatically redirect the user to the Stripe checkout URL.
- If false, proceed with the normal redirect to `/dashboard`.

## Verification Plan

### Automated/Manual Verification
- **Checkout Gate:** Add an item to the cart as a guest and click checkout. Verify it redirects to `/login?redirect=checkout`.
- **Seamless Flow:** Log in from that page and verify that immediately after login, the app redirects to the Stripe hosted checkout.
- **Verification Page:** Complete a test payment on Stripe. Verify that Stripe redirects back to `/payment-verification?session_id=...`.
- **Polling & Success:** Verify the loader displays, successfully polls the backend, provisions the item, and shows the "Payment Verified" success screen.
- Verify clicking the button correctly redirects to the dashboard and the purchased items are accessible.
