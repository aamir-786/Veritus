// commerceController.js - Stripe Payments, Checkout & Entitlement Provisioning
const supabase = require('../config/supabase');
const emailService = require('../services/emailService');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

const fs = require('fs');
const path = require('path');

const getDomainPacks = () => {
  try {
    const packsPath = path.join(__dirname, '../data/packs.json');
    const packsData = fs.readFileSync(packsPath, 'utf8');
    const packsList = JSON.parse(packsData);
    const packsMap = {};
    packsList.forEach(pack => {
      packsMap[pack.id] = pack;
    });
    return packsMap;
  } catch (err) {
    console.error('Error loading packs:', err);
    return {};
  }
};

// Initiate Checkout Session (Course or Template)
exports.createCheckoutSession = async (req, res) => {
  const { item_id, item_type, coupon_code } = req.body;
  const userId = req.user ? req.user.id : null;
  const userEmail = req.user ? req.user.email : req.body.customer_email;

  if (!userEmail) {
    return res.status(400).json({ success: false, error: 'User email is required for checkout' });
  }

  try {
    let item = null;
    if (item_type === 'course') {
      const { data } = await supabase.from('courses').select('*').or(`id.eq.${item_id},slug.eq.${item_id}`).single();
      item = data;
    } else if (item_type === 'template') {
      const { data } = await supabase.from('templates').select('*').eq('id', item_id).single();
      item = data;
    } else if (item_type === 'pack') {
      const packs = getDomainPacks();
      item = packs[item_id];
    }

    if (!item) {
      return res.status(404).json({ success: false, error: 'Selected product not found' });
    }

    // Validate Coupon Code if provided
    let validatedPromo = null;
    if (coupon_code) {
      const { data: promo } = await supabase
        .from('promotions')
        .select('*')
        .ilike('promo_code', coupon_code.trim())
        .single();
      
      if (promo && promo.is_active) {
        const now = new Date().toISOString();
        const isStartValid = !promo.start_date || now >= promo.start_date;
        const isEndValid = !promo.end_date || now <= promo.end_date;
        const isLimitValid = !promo.max_redemptions || promo.times_redeemed < promo.max_redemptions;
        if (isStartValid && isEndValid && isLimitValid) {
          validatedPromo = promo;
        }
      }
    }

    const originalAmount = Number(item.price) || 0;
    const discountPercent = validatedPromo ? Number(validatedPromo.discount_percentage || 0) : 0;
    const discountAmount = Math.round((originalAmount * discountPercent / 100) * 100) / 100;
    const finalAmount = Math.max(0, Math.round((originalAmount - discountAmount) * 100) / 100);

    // Create Real Stripe Session without creating pending orders in database
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [{
        price_data: {
          currency: 'usd',
          product_data: {
            name: item.title,
            ...(item.headline || item.description ? { description: item.headline || item.description } : {}),
            ...(item.cover_image ? { images: [item.cover_image] } : {}),
          },
          unit_amount: Math.round(originalAmount * 100),
        },
        quantity: 1,
      }],
      mode: 'payment',
      allow_promotion_codes: true,
      customer_email: userEmail || undefined,
      client_reference_id: userId || undefined,
      metadata: {
        product_id: item.id,
        product_title: item.title,
        original_amount: String(originalAmount),
        user_id: userId || '',
        user_email: userEmail || '',
        coupon_code: validatedPromo ? validatedPromo.promo_code : ''
      },
      success_url: `${req.headers.origin || 'http://localhost:3000'}/payment-verification?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${req.headers.origin || 'http://localhost:3000'}/cart?payment=cancelled`,
    });

    return res.json({
      success: true,
      original_amount: originalAmount,
      discount_amount: discountAmount,
      coupon_code: validatedPromo ? validatedPromo.promo_code : null,
      amount: finalAmount,
      currency: 'USD',
      product_title: item.title,
      checkout_url: session.url
    });
  } catch (err) {
    console.error('createCheckoutSession Error:', err);
    return res.status(500).json({ success: false, error: 'Failed to initiate checkout' });
  }
};

// Multi-Item Real Stripe Checkout Session
exports.createMultiCheckoutSession = async (req, res) => {
  const { items, coupon_code } = req.body;
  const userId = req.user ? req.user.id : null;
  const userEmail = req.user ? req.user.email : req.body.customer_email;

  if (!items || items.length === 0) {
    return res.status(400).json({ success: false, error: 'Cart is empty' });
  }

  try {
    // Validate Coupon Code if provided
    let validatedPromo = null;
    if (coupon_code) {
      const { data: promo } = await supabase
        .from('promotions')
        .select('*')
        .ilike('promo_code', coupon_code.trim())
        .single();
      
      if (promo && promo.is_active) {
        const now = new Date().toISOString();
        const isStartValid = !promo.start_date || now >= promo.start_date;
        const isEndValid = !promo.end_date || now <= promo.end_date;
        const isLimitValid = !promo.max_redemptions || promo.times_redeemed < promo.max_redemptions;
        if (isStartValid && isEndValid && isLimitValid) {
          validatedPromo = promo;
        }
      }
    }

    const line_items = [];
    const itemMetaList = [];

    for (const item of items) {
      let dbItem = null;
      if (item.type === 'Course' || item.type === 'course') {
        const { data } = await supabase.from('courses').select('*').or(`id.eq.${item.id},slug.eq.${item.id}`).single();
        dbItem = data;
      } else if (item.type === 'Template' || item.type === 'template') {
        const { data } = await supabase.from('templates').select('*').eq('id', item.id).single();
        dbItem = data;
      } else if (item.type === 'Pack' || item.type === 'pack' || item.type === 'Domain Pack') {
        const packs = getDomainPacks();
        dbItem = packs[item.id] || { 
          id: item.id, 
          title: item.title || 'Domain Master Pack', 
          price: 49 
        };
      }

      if (!dbItem) continue;

      const originalAmount = Number(dbItem.price) || 0;

      itemMetaList.push(`${dbItem.id}:::${dbItem.title.replace(/[:|]/g, ' ')}:::${originalAmount}`);

      line_items.push({
        price_data: {
          currency: 'usd',
          product_data: {
            name: dbItem.title,
            ...(dbItem.headline || dbItem.description ? { description: dbItem.headline || dbItem.description } : {}),
            ...(dbItem.cover_image ? { images: [dbItem.cover_image] } : {}),
          },
          unit_amount: Math.round(originalAmount * 100),
        },
        quantity: 1,
      });
    }

    if (line_items.length === 0) {
      return res.status(400).json({ success: false, error: 'No valid products found in cart' });
    }

    // Create Stripe Session without writing to DB upfront
    const itemsPayload = itemMetaList.join('|||').slice(0, 480);

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items,
      mode: 'payment',
      allow_promotion_codes: true,
      customer_email: userEmail || undefined,
      client_reference_id: userId || undefined,
      metadata: {
        items_payload: itemsPayload,
        user_id: userId || '',
        user_email: userEmail || '',
        coupon_code: validatedPromo ? validatedPromo.promo_code : ''
      },
      success_url: `${req.headers.origin || 'http://localhost:3000'}/payment-verification?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${req.headers.origin || 'http://localhost:3000'}/cart?payment=cancelled`,
    });

    return res.json({
      success: true,
      checkout_url: session.url
    });
  } catch (err) {
    console.error('createMultiCheckoutSession Error:', err);
    return res.status(500).json({ success: false, error: 'Failed to create checkout session' });
  }
};

// Helper: Extract Stripe Session Discounts and Payment Totals
const extractStripeSessionDiscounts = (session) => {
  const subtotalCents = session.amount_subtotal || session.amount_total || 0;
  const discountCents = session.total_details?.amount_discount || 0;
  const totalCents = session.amount_total || 0;

  const subtotal = subtotalCents / 100;
  const discount = discountCents / 100;
  const paidTotal = totalCents / 100;

  let couponCode = session.metadata?.coupon_code || null;
  if (!couponCode && session.total_details?.breakdown?.discounts?.length > 0) {
    const d = session.total_details.breakdown.discounts[0];
    couponCode = d.discount?.coupon?.name || d.discount?.coupon?.id || d.discount?.promotion_code || null;
  }
  if (!couponCode && session.discounts?.length > 0) {
    const d = session.discounts[0];
    couponCode = d.promotion_code || d.coupon?.name || d.coupon?.id || null;
  }
  if (!couponCode && discount > 0) {
    couponCode = 'STRIPE_PROMO';
  }

  return { subtotal, discount, paidTotal, couponCode };
};

// Helper: Increment redemption counter for used coupon
const incrementCouponRedemption = async (couponCode) => {
  if (!couponCode) return;
  try {
    const { data: promo } = await supabase
      .from('promotions')
      .select('id, times_redeemed')
      .ilike('promo_code', couponCode.trim())
      .single();

    if (promo) {
      await supabase
        .from('promotions')
        .update({ times_redeemed: (promo.times_redeemed || 0) + 1 })
        .eq('id', promo.id);
    }
  } catch (err) {
    console.warn('[Redemption] Failed to increment coupon redemption count:', err.message);
  }
};

// Shared Order Fulfillment Engine for Webhooks and Session Verification
const fulfillStripeSession = async (session) => {
  if (!session || session.payment_status !== 'paid') return false;

  const paymentId = session.payment_intent || session.id;

  // 1. Prevent double fulfillment if order already saved in database
  const { data: existingOrders } = await supabase
    .from('orders')
    .select('id')
    .eq('stripe_payment_intent', paymentId);

  if (existingOrders && existingOrders.length > 0) {
    return true; // Already saved in Supabase
  }

  const { subtotal, discount, couponCode } = extractStripeSessionDiscounts(session);
  let targetEmail = session.metadata?.user_email || session.customer_details?.email || session.customer_email || 'buyer@veritus.com';
  let targetUserId = session.metadata?.user_id || session.client_reference_id || null;

  if (!targetUserId && targetEmail) {
    const { data: profile } = await supabase.from('profiles').select('id').ilike('email', targetEmail).maybeSingle();
    if (profile) targetUserId = profile.id;
  }

  // Handle pre-existing pending orders if metadata contains order_ids
  const metadataOrderIds = session.metadata?.order_ids || session.metadata?.order_id;
  if (metadataOrderIds) {
    const orderIdList = metadataOrderIds.split(',').map(id => id.trim());
    for (const orderId of orderIdList) {
      const { data: order } = await supabase.from('orders').select('*').eq('id', orderId).single();
      if (order && order.status !== 'paid') {
        const orderOriginal = Number(order.original_amount || order.amount) || 0;
        const orderDiscount = subtotal > 0 ? Math.round((orderOriginal / subtotal) * discount * 100) / 100 : (order.discount_amount || 0);
        const orderPaid = Math.max(0, orderOriginal - orderDiscount);
        const appliedCoupon = couponCode || order.coupon_code || null;

        const { data: updatedOrder } = await supabase
          .from('orders')
          .update({
            status: 'paid',
            paid_at: new Date().toISOString(),
            original_amount: orderOriginal,
            discount_amount: orderDiscount,
            amount: orderPaid,
            coupon_code: appliedCoupon,
            stripe_payment_intent: paymentId
          })
          .eq('id', orderId)
          .select()
          .single();

        const uid = order.user_id || targetUserId;
        if (uid) {
          await supabase.from('entitlements').upsert({ user_id: uid, product_id: order.product_id });
        }
        if (appliedCoupon) incrementCouponRedemption(appliedCoupon);

        emailService.sendOrderReceiptEmail({
          email: order.user_email || targetEmail,
          name: session.customer_details?.name || 'Valued Buyer',
          order: updatedOrder || order
        }).catch(err => console.warn('[Fulfill] Receipt email error:', err.message));
      }
    }
    return true;
  }

  // 2. Parse Items from metadata payload OR Stripe Session line items
  let itemsToFulfill = [];

  if (session.metadata?.items_payload) {
    const rawItems = session.metadata.items_payload.split('|||');
    for (const raw of rawItems) {
      const [pid, ptitle, pprice] = raw.split(':::');
      if (pid) {
        itemsToFulfill.push({
          product_id: pid.trim(),
          product_title: ptitle ? ptitle.trim() : pid.trim(),
          original_amount: Number(pprice) || 0
        });
      }
    }
  } else if (session.metadata?.product_id) {
    itemsToFulfill.push({
      product_id: session.metadata.product_id,
      product_title: session.metadata.product_title || session.metadata.product_id,
      original_amount: Number(session.metadata.original_amount) || (subtotal || (session.amount_total / 100))
    });
  }

  // Fallback to line items if metadata item list is missing
  if (itemsToFulfill.length === 0) {
    let lineItems = session.line_items?.data || [];
    if (!lineItems || lineItems.length === 0) {
      try {
        const list = await stripe.checkout.sessions.listLineItems(session.id);
        lineItems = list.data || [];
      } catch (e) {
        console.warn('[Fulfill] Failed to list Stripe line items:', e.message);
      }
    }

    for (const li of lineItems) {
      const pTitle = li.description || 'Purchased Resource';
      const origPrice = ((li.amount_subtotal || li.amount_total) || 0) / 100;
      const slugId = pTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      itemsToFulfill.push({
        product_id: slugId,
        product_title: pTitle,
        original_amount: origPrice
      });
    }
  }

  // 3. Save completed paid order records to Supabase & grant entitlements
  for (const item of itemsToFulfill) {
    const itemOriginal = item.original_amount || 0;
    const itemDiscount = subtotal > 0 ? Math.round((itemOriginal / subtotal) * discount * 100) / 100 : 0;
    const itemPaid = Math.max(0, itemOriginal - itemDiscount);

    const newOrderId = `ord-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const newOrder = {
      id: newOrderId,
      user_id: targetUserId,
      user_email: targetEmail,
      product_id: item.product_id,
      product_title: item.product_title,
      original_amount: itemOriginal,
      discount_amount: itemDiscount,
      coupon_code: couponCode || null,
      amount: itemPaid,
      currency: 'USD',
      status: 'paid',
      paid_at: new Date().toISOString(),
      stripe_payment_intent: paymentId
    };

    const { data: savedOrder, error: insertErr } = await supabase.from('orders').insert([newOrder]).select().single();
    if (insertErr) {
      console.error('[Fulfill] Failed to insert paid order into Supabase:', insertErr.message);
    }

    if (targetUserId) {
      await supabase.from('entitlements').upsert({
        user_id: targetUserId,
        product_id: item.product_id
      });
    }

    if (couponCode) {
      incrementCouponRedemption(couponCode);
    }

    emailService.sendOrderReceiptEmail({
      email: targetEmail,
      name: session.customer_details?.name || 'Valued Buyer',
      order: savedOrder || newOrder
    }).catch(err => console.warn('[Fulfill] Receipt email error:', err.message));
  }

  return true;
};

// Verify Stripe Checkout Session (for Payment Verification page)
exports.verifySession = async (req, res) => {
  const { sessionId } = req.params;
  
  if (!sessionId) {
    return res.status(400).json({ success: false, error: 'Session ID is required' });
  }

  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ['total_details', 'line_items', 'discounts']
    });

    if (session.payment_status === 'paid') {
      await fulfillStripeSession(session);
      return res.json({ success: true, verified: true });
    } else {
      return res.json({ success: true, verified: false });
    }
  } catch (err) {
    console.error('verifySession Error:', err);
    return res.status(500).json({ success: false, error: 'Failed to verify session' });
  }
};

// Complete Payment (Simulated Hosted Stripe Checkout Callback & Webhook)
exports.completeCheckout = async (req, res) => {
  const { order_id, card_holder_name } = req.body;

  try {
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('*')
      .eq('id', order_id)
      .single();

    if (orderError || !order) {
      return res.status(404).json({ success: false, error: 'Order transaction not found' });
    }

    if (order.status === 'paid') {
      return res.json({ success: true, message: 'Order has already been processed', order });
    }

    // Update Order Status to Paid
    const { data: updatedOrder, error: updateError } = await supabase
      .from('orders')
      .update({
        status: 'paid',
        paid_at: new Date().toISOString()
      })
      .eq('id', order_id)
      .select()
      .single();

    if (updateError) throw updateError;
    order.status = 'paid';

    let targetUserId = order.user_id;

    if (!targetUserId) {
      const { data: profile } = await supabase.from('profiles').select('id').ilike('email', order.user_email).maybeSingle();
      if (profile) {
        targetUserId = profile.id;
        await supabase.from('orders').update({ user_id: profile.id }).eq('id', order_id);
      }
    }

    if (targetUserId) {
      const { error: entError } = await supabase.from('entitlements').upsert({
        user_id: targetUserId,
        product_id: order.product_id
      });
      if (entError) console.warn('Entitlement upsert error:', entError.message);
    }

    if (order.coupon_code) {
      incrementCouponRedemption(order.coupon_code);
    }

    emailService.sendOrderReceiptEmail({
      email: order.user_email,
      name: card_holder_name || 'Valued Buyer',
      order: updatedOrder
    }).catch(err => console.warn('[Commerce] Order receipt email error:', err.message));

    return res.json({
      success: true,
      message: 'Payment completed successfully. Entitlement unlocked & receipt email dispatched.',
      order: updatedOrder,
      receipt_sent_to: order.user_email
    });
  } catch (err) {
    console.error('completeCheckout Error:', err);
    return res.status(500).json({ success: false, error: 'Failed to complete checkout' });
  }
};

// Official Production Stripe Webhook Handler (for Render / Deployed Environments)
exports.handleStripeWebhook = async (req, res) => {
  const sig = req.headers['stripe-signature'];
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  let event = req.body;

  try {
    if (webhookSecret && sig && typeof req.body !== 'object') {
      try {
        event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
      } catch (err) {
        console.warn('Stripe signature check skipped, processing event body:', err.message);
      }
    }

    if (event.type === 'checkout.session.completed' || event.type === 'payment_intent.succeeded') {
      const session = event.data.object;
      
      let fullSession = session;
      if (session.id && (!session.total_details || !session.discounts)) {
        try {
          fullSession = await stripe.checkout.sessions.retrieve(session.id, {
            expand: ['total_details', 'line_items', 'discounts']
          });
        } catch (e) {
          fullSession = session;
        }
      }

      await fulfillStripeSession(fullSession);
    }

    return res.json({ received: true });
  } catch (err) {
    console.error('Webhook Error:', err);
    return res.status(500).json({ received: false });
  }
};

// Reconcile Orders Listing for User
exports.getUserOrders = async (req, res) => {
  const userId = req.user.id;
  const userEmail = req.user.email;
  
  try {
    // 1. Fetch user entitlements to see what products the user owns
    const { data: userEntitlements } = await supabase
      .from('entitlements')
      .select('product_id')
      .eq('user_id', userId);
      
    const entitledSet = new Set((userEntitlements || []).map(e => e.product_id));

    // 2. Fetch orders matching user_id OR user_email
    let query = supabase.from('orders').select('*');
    if (userEmail) {
      query = query.or(`user_id.eq.${userId},user_email.ilike.${userEmail}`);
    } else {
      query = query.eq('user_id', userId);
    }

    const { data: userOrders, error } = await query.order('created_at', { ascending: false });

    if (error) throw error;

    // 3. Auto-reconcile: If any order is 'pending' BUT user has entitlement access to product, reconcile status to 'paid'!
    const reconciledOrders = await Promise.all((userOrders || []).map(async (order) => {
      let isUpdated = false;
      const orderCopy = { ...order };

      if (!orderCopy.user_id && userId) {
        orderCopy.user_id = userId;
        isUpdated = true;
      }

      if (orderCopy.status === 'pending' && entitledSet.has(orderCopy.product_id)) {
        orderCopy.status = 'paid';
        orderCopy.paid_at = orderCopy.paid_at || orderCopy.created_at || new Date().toISOString();
        isUpdated = true;
      }

      if (isUpdated) {
        await supabase
          .from('orders')
          .update({
            user_id: orderCopy.user_id,
            status: orderCopy.status,
            paid_at: orderCopy.paid_at
          })
          .eq('id', orderCopy.id);
      }

      return orderCopy;
    }));

    return res.json({
      success: true,
      orders: reconciledOrders
    });
  } catch (err) {
    console.error('getUserOrders Error:', err);
    return res.status(500).json({ success: false, error: 'Failed to fetch orders' });
  }
};

// User Request Refund (3-Day Policy Enforcement)
exports.requestRefund = async (req, res) => {
  const { id } = req.params;
  const { reason } = req.body;
  const userId = req.user.id;
  const userEmail = req.user.email;

  if (!reason || !reason.trim()) {
    return res.status(400).json({ success: false, error: 'Reason for refund is required' });
  }

  try {
    const { data: order, error: fetchErr } = await supabase
      .from('orders')
      .select('*')
      .eq('id', id)
      .single();

    if (fetchErr || !order) {
      return res.status(404).json({ success: false, error: 'Order transaction not found' });
    }

    // Verify ownership
    const isOwner = order.user_id === userId || (order.user_email && order.user_email.toLowerCase() === (userEmail || '').toLowerCase());
    if (!isOwner) {
      return res.status(403).json({ success: false, error: 'Unauthorized to request refund for this order' });
    }

    if (order.status !== 'paid') {
      return res.status(400).json({ success: false, error: `Cannot request refund for order in status '${order.status}'` });
    }

    // Enforce 3-day refund window (72 hours from paid_at or created_at)
    const orderDate = new Date(order.paid_at || order.created_at).getTime();
    const now = Date.now();
    const diffHours = (now - orderDate) / (1000 * 60 * 60);

    if (diffHours > 72) {
      return res.status(400).json({ 
        success: false, 
        error: 'Refund window has expired. Refunds can only be requested within 3 days (72 hours) of purchase.' 
      });
    }

    // Update Order to refund_requested
    const { data: updatedOrder, error: updateErr } = await supabase
      .from('orders')
      .update({
        status: 'refund_requested',
        refund_reason: reason.trim(),
        refund_requested_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (updateErr) throw updateErr;

    return res.json({
      success: true,
      message: 'Refund request submitted successfully. Administrator will review your request.',
      order: updatedOrder
    });
  } catch (err) {
    console.error('requestRefund Error:', err);
    return res.status(500).json({ success: false, error: 'Failed to submit refund request' });
  }
};
