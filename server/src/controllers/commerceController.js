// commerceController.js - Stripe Payments, Checkout & Entitlement Provisioning
const db = require('../data/dbStore');
const emailService = require('../services/emailService');

// Initiate Checkout Session (Course or Template)
exports.createCheckoutSession = (req, res) => {
  const { item_id, item_type } = req.body;
  const userId = req.user ? req.user.id : null;
  const userEmail = req.user ? req.user.email : req.body.customer_email;

  if (!userEmail) {
    return res.status(400).json({ success: false, error: 'User email is required for checkout' });
  }

  let item = null;
  if (item_type === 'course') {
    item = db.courses.find(c => c.id === item_id || c.slug === item_id);
  } else if (item_type === 'template') {
    item = db.templates.find(t => t.id === item_id);
  }

  if (!item) {
    return res.status(404).json({ success: false, error: 'Selected product not found' });
  }

  // Create Order Record in Pending State
  const orderId = `ord-${Date.now()}`;
  const newOrder = {
    id: orderId,
    user_id: userId || `guest-${Date.now()}`,
    user_email: userEmail,
    product_id: item.id,
    product_title: item.title,
    amount: item.price,
    currency: 'USD',
    status: 'pending',
    created_at: new Date().toISOString()
  };

  db.orders.push(newOrder);

  // Return Hosted Checkout URL / Modal details
  return res.json({
    success: true,
    order_id: orderId,
    amount: item.price,
    currency: 'USD',
    product_title: item.title,
    checkout_url: `/checkout/pay/${orderId}`
  });
};

// Complete Payment (Simulated Hosted Stripe Checkout Callback & Webhook)
exports.completeCheckout = (req, res) => {
  const { order_id, card_holder_name } = req.body;
  const order = db.orders.find(o => o.id === order_id);

  if (!order) {
    return res.status(404).json({ success: false, error: 'Order transaction not found' });
  }

  if (order.status === 'paid') {
    return res.json({ success: true, message: 'Order has already been processed', order });
  }

  // Update Order Status to Paid
  order.status = 'paid';
  order.card_holder_name = card_holder_name || 'Authorized Buyer';
  order.paid_at = new Date().toISOString();

  // Provision Entitlement for User
  let targetUser = db.users.find(u => u.email.toLowerCase() === order.user_email.toLowerCase());
  if (!targetUser) {
    // Auto-create user account if guest purchased
    targetUser = {
      id: order.user_id,
      email: order.user_email,
      password: 'changeMe123',
      full_name: card_holder_name || 'Member',
      role: 'student',
      created_at: new Date().toISOString()
    };
    db.users.push(targetUser);
  }

  const entitlementId = `ent-${Date.now()}`;
  db.entitlements.push({
    id: entitlementId,
    user_id: targetUser.id,
    product_id: order.product_id,
    access_granted_at: new Date().toISOString()
  });

  // Dispatch Order Receipt & Entitlement Access Email
  emailService.sendOrderReceiptEmail({
    email: order.user_email,
    name: targetUser.full_name,
    order
  }).catch(err => console.warn('[Commerce] Order receipt email error:', err.message));

  return res.json({
    success: true,
    message: 'Payment completed successfully. Entitlement unlocked & receipt email dispatched.',
    order,
    receipt_sent_to: order.user_email
  });
};

// Official Production Stripe Webhook Handler (for Render / Deployed Environments)
exports.handleStripeWebhook = (req, res) => {
  const sig = req.headers['stripe-signature'];
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  let event = req.body;

  // Handle Event Type
  if (event.type === 'checkout.session.completed' || event.type === 'payment_intent.succeeded') {
    const session = event.data.object;
    const orderId = session.metadata?.order_id || session.client_reference_id;

    if (orderId) {
      const order = db.orders.find(o => o.id === orderId);
      if (order && order.status !== 'paid') {
        order.status = 'paid';
        order.paid_at = new Date().toISOString();
        db.entitlements.push({
          id: `ent-${Date.now()}`,
          user_id: order.user_id,
          product_id: order.product_id,
          access_granted_at: new Date().toISOString()
        });

        emailService.sendOrderReceiptEmail({
          email: order.user_email,
          name: order.card_holder_name || 'Valued Buyer',
          order
        }).catch(err => console.warn('[Stripe Webhook] Receipt email error:', err.message));
      }
    }
  }

  return res.json({ received: true });
};


// Reconcile Orders Listing for User
exports.getUserOrders = (req, res) => {
  const userId = req.user.id;
  const userOrders = db.orders.filter(o => o.user_id === userId || o.user_email === req.user.email);

  return res.json({
    success: true,
    orders: userOrders
  });
};
