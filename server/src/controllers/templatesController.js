// templatesController.js - Digital Template Library & Gated Downloads
const supabase = require('../config/supabase');

// Get Digital Templates List with Filters
exports.getTemplates = async (req, res) => {
  const { category, search } = req.query;

  try {
    let query = supabase.from('templates').select('*');

    if (category && category !== 'All') {
      query = query.eq('category', category);
    }

    if (search) {
      const q = search.toLowerCase();
      query = query.or(`title.ilike.%${q}%,description.ilike.%${q}%`);
    }

    const { data: items, error } = await query;
    if (error) throw error;

    const userId = req.user ? req.user.id : null;
    const isAdmin = req.user && req.user.role === 'admin';

    let userEntitlements = [];
    if (userId && !isAdmin) {
      const { data: entitlements } = await supabase
        .from('entitlements')
        .select('product_id')
        .eq('user_id', userId);
      userEntitlements = (entitlements || []).map(e => e.product_id);
    }

    // Mark if user is entitled to download
    const formatted = items.map(t => {
      const hasPurchased = t.is_free || isAdmin || userEntitlements.includes(t.id);
      return {
        ...t,
        can_download: !!hasPurchased
      };
    });

    return res.json({
      success: true,
      total: formatted.length,
      templates: formatted
    });
  } catch (err) {
    console.error('getTemplates Error:', err);
    return res.status(500).json({ success: false, error: 'Database error fetching templates' });
  }
};

// Access Gated Template Download File
exports.downloadTemplate = async (req, res) => {
  const { templateId } = req.params;

  try {
    const { data: template, error } = await supabase
      .from('templates')
      .select('*')
      .eq('id', templateId)
      .single();

    if (error || !template) {
      return res.status(404).json({ success: false, error: 'Template not found' });
    }

    const userId = req.user ? req.user.id : null;
    const isAdmin = req.user && req.user.role === 'admin';

    let hasPurchased = template.is_free || isAdmin;
    if (!hasPurchased && userId) {
      const { data: entitlement } = await supabase
        .from('entitlements')
        .select('id')
        .eq('user_id', userId)
        .eq('product_id', template.id)
        .maybeSingle();
      if (entitlement) hasPurchased = true;
    }

    if (!hasPurchased) {
      return res.status(403).json({
        success: false,
        error: 'Access Gated: Premium template purchase required.',
        requires_purchase: true
      });
    }

    // Increment download counter
    await supabase.from('templates').update({ downloads_count: template.downloads_count + 1 }).eq('id', template.id);

    // Provide downloadable asset content stream
    res.setHeader('Content-Type', 'application/octet-stream');
    res.setHeader('Content-Disposition', `attachment; filename="${template.file_path}"`);
    return res.send(`Veritus / Deciding in the Dark - Official Template Artifact\n\nTitle: ${template.title}\nCategory: ${template.category}\nDownloaded by: ${req.user ? req.user.email : 'Free Subscriber'}\nDate: ${new Date().toISOString()}\n\n---\nFramework Guidance & Content Asset Placeholder\n---`);
  } catch (err) {
    console.error('downloadTemplate Error:', err);
    return res.status(500).json({ success: false, error: 'Failed to initiate download' });
  }
};
