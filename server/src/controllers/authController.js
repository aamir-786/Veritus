// authController.js - Handle Post-Login Welcome Emails
const supabase = require('../config/supabase');
const emailService = require('../services/emailService');

exports.checkAndSendWelcome = async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Fetch the auth user to check metadata
    const { data: { user }, error: userError } = await supabase.auth.admin.getUserById(userId);
    
    if (userError || !user) {
      return res.status(404).json({ success: false, error: 'User not found in Auth system' });
    }

    const hasReceivedWelcome = user.user_metadata?.welcome_email_sent === true;

    if (!hasReceivedWelcome) {
      // Send the Welcome Email
      await emailService.sendWelcomeEmail({
        email: user.email,
        name: req.user.full_name || user.email.split('@')[0]
      });

      // Mark as sent in user_metadata
      await supabase.auth.admin.updateUserById(userId, {
        user_metadata: {
          ...user.user_metadata,
          welcome_email_sent: true
        }
      });

      return res.json({ success: true, message: 'Welcome email sent.' });
    }

    return res.json({ success: true, message: 'Welcome email already sent previously.' });
  } catch (err) {
    console.error('Welcome Email Check Error:', err);
    return res.status(500).json({ success: false, error: 'Failed to process welcome email' });
  }
};
