const supabase = require('../config/supabase');

// Fetch recent featured reviews for the landing page
exports.getLandingPageReviews = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('reviews')
      .select('id, product_type, product_id, rating, comment, created_at, profiles(full_name)')
      .eq('is_featured', true)
      .order('created_at', { ascending: false })
      .limit(6); // Fetch top 6 recent featured reviews

    if (error) throw error;

    return res.json({ success: true, reviews: data });
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
