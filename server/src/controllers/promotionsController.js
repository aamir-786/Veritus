const supabase = require('../config/supabase');

exports.getActivePromotion = async (req, res) => {
  try {
    const now = new Date().toISOString();
    
    // Fetch all active promotions (we will filter by date in JS to avoid complex Supabase OR queries if not needed, or just do it in the query)
    const { data: promotions, error } = await supabase
      .from('promotions')
      .select('*')
      .eq('show_banner', true)
      .order('created_at', { ascending: false });

    if (error) throw error;

    // Find the first one that is currently valid
    const promotion = promotions.find(p => {
      const isAfterStart = !p.start_date || now >= p.start_date;
      const isBeforeEnd = !p.end_date || now <= p.end_date;
      return isAfterStart && isBeforeEnd;
    });

    return res.json({
      success: true,
      promotion: promotion || null
    });
  } catch (err) {
    console.error('getActivePromotion Error:', err);
    return res.status(500).json({ success: false, error: 'Failed to fetch active promotion' });
  }
};

// Validate Coupon Code
exports.validateCoupon = async (req, res) => {
  const code = (req.body.promo_code || req.body.coupon_code || req.query.code || '').trim();

  if (!code) {
    return res.status(400).json({ success: false, error: 'Coupon code is required' });
  }

  try {
    const { data: promo, error } = await supabase
      .from('promotions')
      .select('*')
      .ilike('promo_code', code)
      .single();

    if (error || !promo) {
      return res.status(404).json({ success: false, error: 'Invalid coupon code' });
    }

    if (!promo.is_active) {
      return res.status(400).json({ success: false, error: 'This coupon code is inactive' });
    }

    const now = new Date().toISOString();
    if (promo.start_date && now < promo.start_date) {
      return res.status(400).json({ success: false, error: 'This promotion has not started yet' });
    }
    if (promo.end_date && now > promo.end_date) {
      return res.status(400).json({ success: false, error: 'This coupon code has expired' });
    }

    if (promo.max_redemptions && promo.times_redeemed >= promo.max_redemptions) {
      return res.status(400).json({ success: false, error: 'This coupon has reached its maximum redemption limit' });
    }

    return res.json({
      success: true,
      promotion: {
        id: promo.id,
        promo_code: promo.promo_code,
        discount_percentage: promo.discount_percentage || 0,
        banner_message: promo.banner_message
      }
    });
  } catch (err) {
    console.error('validateCoupon Error:', err);
    return res.status(500).json({ success: false, error: 'Failed to validate coupon code' });
  }
};
