// templatesController.js - Digital Template Library & Gated Downloads
const db = require('../data/dbStore');

// Get Digital Templates List with Filters
exports.getTemplates = (req, res) => {
  const { category, search } = req.query;
  let items = [...db.templates];

  if (category && category !== 'All') {
    items = items.filter(t => t.category === category);
  }

  if (search) {
    const q = search.toLowerCase();
    items = items.filter(t => 
      t.title.toLowerCase().includes(q) || 
      t.description.toLowerCase().includes(q)
    );
  }

  const userId = req.user ? req.user.id : null;
  const user = userId ? db.users.find(u => u.id === userId) : null;
  const isAdmin = user && user.role === 'admin';

  // Mark if user is entitled to download
  const formatted = items.map(t => {
    const hasPurchased = t.is_free || isAdmin || (userId && db.entitlements.some(e => e.user_id === userId && e.product_id === t.id));
    return {
      ...t,
      can_download: hasPurchased
    };
  });

  return res.json({
    success: true,
    total: formatted.length,
    templates: formatted
  });
};

// Access Gated Template Download File
exports.downloadTemplate = (req, res) => {
  const { templateId } = req.params;
  const template = db.templates.find(t => t.id === templateId);

  if (!template) {
    return res.status(404).json({ success: false, error: 'Template not found' });
  }

  const userId = req.user ? req.user.id : null;
  const user = userId ? db.users.find(u => u.id === userId) : null;
  const isAdmin = user && user.role === 'admin';

  const hasPurchased = template.is_free || isAdmin || (userId && db.entitlements.some(e => e.user_id === userId && e.product_id === template.id));

  if (!hasPurchased) {
    return res.status(403).json({
      success: false,
      error: 'Access Gated: Premium template purchase required.',
      requires_purchase: true
    });
  }

  // Increment download counter
  template.downloads_count += 1;

  // Provide downloadable asset content stream
  res.setHeader('Content-Type', 'application/octet-stream');
  res.setHeader('Content-Disposition', `attachment; filename="${template.file_path}"`);
  return res.send(`Veritus / Deciding in the Dark - Official Template Artifact\n\nTitle: ${template.title}\nCategory: ${template.category}\nDownloaded by: ${req.user ? req.user.email : 'Free Subscriber'}\nDate: ${new Date().toISOString()}\n\n---\nFramework Guidance & Content Asset Placeholder\n---`);
};
