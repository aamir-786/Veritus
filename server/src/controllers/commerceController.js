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

    // Create Order Record in Pending State
    const orderId = `ord-${Date.now()}`;
    const newOrder = {
      id: orderId,
      user_id: userId, // Supabase Auth UUID, null if guest
      user_email: userEmail,
      product_id: item.id,
      product_title: item.title,
      original_amount: originalAmount,
      discount_amount: discountAmount,
      coupon_code: validatedPromo ? validatedPromo.promo_code : null,
      amount: finalAmount, // Remaining amount after coupon applied
      currency: 'USD',
      status: 'pending'
    };

    const { error } = await supabase.from('orders').insert([newOrder]);
    if (error) throw error;

    // Return Hosted Checkout URL / Modal details
    return res.json({
      success: true,
      order_id: orderId,
      original_amount: originalAmount,
      discount_amount: discountAmount,
      coupon_code: validatedPromo ? validatedPromo.promo_code : null,
      amount: finalAmount,
      currency: 'USD',
      product_title: item.title,
      checkout_url: `/checkout/pay/${orderId}`
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

    const discountPercent = validatedPromo ? Number(validatedPromo.discount_percentage || 0) : 0;
    const line_items = [];
    const orderIds = [];
    const createdOrders = [];

    for (const item of items) {
      // Validate item exists in DB to prevent price spoofing
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
      const discountAmount = Math.round((originalAmount * discountPercent / 100) * 100) / 100;
      const finalAmount = Math.max(0, Math.round((originalAmount - discountAmount) * 100) / 100);

      const orderId = `ord-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
      orderIds.push(orderId);

      createdOrders.push({
        id: orderId,
        user_id: userId,
        user_email: userEmail || 'guest@veritus.com',
        product_id: dbItem.id,
        product_title: dbItem.title,
        original_amount: originalAmount,
        discount_amount: discountAmount,
        coupon_code: validatedPromo ? validatedPromo.promo_code : null,
        amount: finalAmount, // Remaining amount after coupon deduction distributed to item
        currency: 'USD',
        status: 'pending'
      });

      line_items.push({
        price_data: {
          currency: 'usd',
          product_data: {
            name: dbItem.title,
            ...(dbItem.headline || dbItem.description ? { description: dbItem.headline || dbItem.description } : {}),
            ...(dbItem.cover_image ? { images: [dbItem.cover_image] } : {}),
          },
          unit_amount: Math.round(finalAmount * 100), // Stripe expects cents of remaining discounted amount
        },
        quantity: 1,
      });
    }

    if (line_items.length === 0) {
      return res.status(400).json({ success: false, error: 'No valid products found in cart' });
    }

    // Insert pending orders
    const { error } = await supabase.from('orders').insert(createdOrders);
    if (error) throw error;

    // Create Stripe Session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items,
      mode: 'payment',
      allow_promotion_codes: true,
      customer_email: userEmail || undefined,
      client_reference_id: userId || undefined,
      metadata: {
        order_ids: orderIds.join(','), // We store a comma-separated list of order IDs
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

// Verify Stripe Checkout Session (for Payment Verification page)
exports.verifySession = async (req, res) => {
  const { sessionId } = req.params;
  
  if (!sessionId) {
    return res.status(400).json({ success: false, error: 'Session ID is required' });
  }

  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (session.payment_status === 'paid') {
      const metadataOrderIds = session.metadata?.order_ids || session.client_reference_id;
      
      if (metadataOrderIds) {
        const orderIdList = metadataOrderIds.split(',');
        for (const orderId of orderIdList) {
          const { data: order } = await supabase.from('orders').select('*').eq('id', orderId.trim()).single();
          
          if (order && order.status !== 'paid') {
            // Fulfill the order if it hasn't been fulfilled by webhook yet
            const { data: updatedOrder } = await supabase
              .from('orders')
              .update({ status: 'paid', paid_at: new Date().toISOString() })
              .eq('id', orderId.trim())
              .select()
              .single();

            if (order.user_id || session.client_reference_id) {
              await supabase.from('entitlements').upsert({
                user_id: order.user_id || session.client_reference_id,
                product_id: order.product_id
              });
            }

            if (order.coupon_code) {
              incrementCouponRedemption(order.coupon_code);
            }

            emailService.sendOrderReceiptEmail({
              email: order.user_email || session.customer_details?.email,
              name: session.customer_details?.name || 'Valued Buyer',
              order: updatedOrder || order
            }).catch(err => console.warn('[Verification] Receipt email error:', err.message));
          }
        }
      }
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
    order.status = 'paid'; // Keep local copy updated

    let targetUserId = order.user_id;

    if (!targetUserId) {
      // Find if a profile exists with this email
      const { data: profile } = await supabase.from('profiles').select('id').ilike('email', order.user_email).maybeSingle();
      if (profile) {
        targetUserId = profile.id;
        // Link the order to the found user
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

    // Dispatch Order Receipt & Entitlement Access Email
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
    // Handle Event Type
    if (event.type === 'checkout.session.completed' || event.type === 'payment_intent.succeeded') {
      const session = event.data.object;
      const metadataOrderIds = session.metadata?.order_ids || session.metadata?.order_id || session.client_reference_id;

      if (metadataOrderIds) {
        const orderIdList = metadataOrderIds.split(',');

        for (const orderId of orderIdList) {
          const { data: order } = await supabase.from('orders').select('*').eq('id', orderId.trim()).single();
          
            if (order && order.status !== 'paid') {
              const { data: updatedOrder } = await supabase
                .from('orders')
                .update({ 
                  status: 'paid', 
                  paid_at: new Date().toISOString(),
                  stripe_payment_intent: session.payment_intent || null 
                })
              .eq('id', orderId.trim())
              .select()
              .single();

            if (order.user_id || session.client_reference_id) {
              await supabase.from('entitlements').upsert({
                user_id: order.user_id || session.client_reference_id,
                product_id: order.product_id
              });
            }

            if (order.coupon_code) {
              incrementCouponRedemption(order.coupon_code);
            }

            emailService.sendOrderReceiptEmail({
              email: order.user_email || session.customer_email || session.customer_details?.email,
              name: session.customer_details?.name || 'Valued Buyer',
              order: updatedOrder || order
            }).catch(err => console.warn('[Stripe Webhook] Receipt email error:', err.message));
          }
        }
      }
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
  
  try {
    const { data: userOrders, error } = await supabase
      .from('orders')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return res.json({
      success: true,
      orders: userOrders
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
