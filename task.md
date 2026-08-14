# Stripe Verification and Checkout Gate Task List

- [x] Update `server/src/controllers/commerceController.js` to change `success_url` and add `verifySession` method.
- [x] Update `server/src/routes/api.js` to add the `GET /commerce/verify-session/:sessionId` route.
- [x] Create `client/src/pages/PaymentVerification.jsx` page with polling logic and UI.
- [x] Update `client/src/App.jsx` to register the new `/payment-verification` route.
- [x] Update `client/src/components/CartDrawer.jsx` to redirect to `/login?redirect=checkout` if user is not logged in.
- [x] Update `client/src/pages/Login.jsx` to trigger checkout immediately after successful login if `redirect=checkout`.
- [x] Update `client/src/pages/Register.jsx` to forward the `redirect=checkout` query parameter to the Login page.
