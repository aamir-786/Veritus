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
      
      // Try to extract a clean filename, or fallback to the template title
      let filename = template.file_path.split('/').pop().split('?')[0];
      if (!filename || filename.length < 3) {
        filename = `${template.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.pdf`;
      }
      
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      return res.send(buffer);
    } else {
      // Fallback for mock templates (which don't have a real URL)
      // Send a dummy payload but with the exact requested filename and extension
      const filename = template.file_path ? template.file_path.split('/').pop() : `template-${template.id}.pdf`;
      
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
