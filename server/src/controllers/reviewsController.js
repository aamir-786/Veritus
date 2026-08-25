const supabase = require('../config/supabase');

// Fetch recent featured reviews for the landing page (with fallback to recent reviews)
exports.getLandingPageReviews = async (req, res) => {
  try {
    let { data, error } = await supabase
      .from('reviews')
      .select('id, product_type, product_id, rating, comment, created_at, profiles(full_name)')
      .eq('is_featured', true)
      .order('created_at', { ascending: false })
      .limit(6);

    if (error) throw error;

    // Fallback: If no featured reviews exist yet, fetch recent reviews
    if (!data || data.length === 0) {
      const { data: recent, error: recentErr } = await supabase
        .from('reviews')
        .select('id, product_type, product_id, rating, comment, created_at, profiles(full_name)')
        .order('created_at', { ascending: false })
        .limit(6);

      if (!recentErr && recent) {
        data = recent;
      }
    }

    // Enrich reviews with product titles
    const enrichedReviews = await Promise.all((data || []).map(async (r) => {
      let productTitle = null;
      try {
        if (r.product_type === 'course' || r.product_type === 'masterclass') {
          const { data: course } = await supabase.from('courses').select('title').or(`id.eq.${r.product_id},slug.eq.${r.product_id}`).maybeSingle();
          if (course) productTitle = course.title;
        } else if (r.product_type === 'question') {
          const { data: q } = await supabase.from('questions').select('title, question_number').eq('id', r.product_id).maybeSingle();
          if (q) productTitle = `Q${q.question_number}: ${q.title}`;
        } else if (r.product_type === 'template') {
          const { data: t } = await supabase.from('templates').select('title').eq('id', r.product_id).maybeSingle();
          if (t) productTitle = t.title;
        }
      } catch (e) {
        // Fallback
      }

      return {
        ...r,
        product_title: productTitle || (r.product_type === 'course' ? 'Executive Masterclass' : r.product_type === 'question' ? 'Taxonomy Question' : 'Digital Template')
      };
    }));

    return res.json({ success: true, reviews: enrichedReviews });
  } catch (err) {
    console.error('Error fetching reviews:', err);
    return res.status(500).json({ success: false, error: 'Failed to fetch reviews' });
  }
};

// Create a new review
exports.createReview = async (req, res) => {
  const { product_type, product_id, rating, comment } = req.body;
  
  if (!product_type || !product_id || !rating) {
    return res.status(400).json({ success: false, error: 'Product type, product ID, and rating are required' });
  }

  try {
    // Check if user has already reviewed this product
    const { data: existingReview } = await supabase
      .from('reviews')
      .select('id')
      .eq('user_id', req.user.id)
      .eq('product_type', product_type)
      .eq('product_id', product_id)
      .maybeSingle();

    if (existingReview) {
      return res.status(400).json({ success: false, error: 'You have already submitted a review for this masterclass.' });
    }

    const { data, error } = await supabase
      .from('reviews')
      .insert([
        {
          user_id: req.user.id,
          product_type,
          product_id,
          rating,
          comment
        }
      ])
      .select();

    if (error) throw error;

    return res.json({ success: true, review: data[0] });
  } catch (err) {
    console.error('Error creating review:', err);
    return res.status(500).json({ success: false, error: 'Failed to submit review' });
  }
};
