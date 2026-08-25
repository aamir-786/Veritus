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

    let userReviewedTemplateIds = new Set();
    if (userId) {
      const { data: userReviews } = await supabase
        .from('reviews')
        .select('product_id')
        .eq('user_id', userId)
        .eq('product_type', 'template');
      userReviewedTemplateIds = new Set((userReviews || []).map(r => r.product_id));
    }

    // Mark if user is entitled to download & user_has_reviewed
    const formatted = items.map(t => {
      const hasPurchased = t.is_free || isAdmin || userEntitlements.includes(t.id);
      return {
        ...t,
        can_download: !!hasPurchased,
        user_has_reviewed: userReviewedTemplateIds.has(t.id)
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

    // Fetch actual file from URL and stream to client
    if (template.file_path && template.file_path.startsWith('http')) {
      const fileRes = await fetch(template.file_path);
      if (!fileRes.ok) {
        throw new Error('Failed to fetch file from storage');
      }
      
      const arrayBuffer = await fileRes.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      
      const contentType = fileRes.headers.get('content-type') || 'application/octet-stream';
      res.setHeader('Content-Type', contentType);
      
      // Extract extension and build filename from template title
      let ext = '.pdf';
      if (template.file_path) {
        const parts = template.file_path.split('?')[0].split('.');
        if (parts.length > 1) ext = '.' + parts.pop().toLowerCase();
      }
      const safeTitle = template.title.replace(/[^a-zA-Z0-9 \-_]/g, '').trim().replace(/\s+/g, '_');
      const filename = `${safeTitle}${ext}`;
      
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      return res.send(buffer);
    } else {
      // Fallback for mock templates (which don't have a real URL)
      let ext = '.pdf';
      if (template.file_path) {
        const parts = template.file_path.split('?')[0].split('.');
        if (parts.length > 1) ext = '.' + parts.pop().toLowerCase();
      }
      const safeTitle = template.title.replace(/[^a-zA-Z0-9 \-_]/g, '').trim().replace(/\s+/g, '_');
      const filename = `${safeTitle}${ext}`;
      
      let contentType = 'application/octet-stream';
      if (filename.endsWith('.pdf')) contentType = 'application/pdf';
      else if (filename.endsWith('.xlsx')) contentType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
      else if (filename.endsWith('.pptx')) contentType = 'application/vnd.openxmlformats-officedocument.presentationml.presentation';
      
      res.setHeader('Content-Type', contentType);
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      return res.send(`Veritus Platform - This is a placeholder file for mock template: ${template.title}`);
    }
  } catch (err) {
    console.error('downloadTemplate Error:', err);
    return res.status(500).json({ success: false, error: 'Failed to initiate download' });
  }
};
