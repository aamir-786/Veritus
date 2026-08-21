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
