// authController.js - Handle Post-Login Welcome Emails
const supabase = require('../config/supabase');
const emailService = require('../services/emailService');

exports.checkAndSendWelcome = async (req, res) => {
  try {
    const userId = req.user.id;
    const userEmail = req.user.email;
    const userName = req.user.full_name || userEmail?.split('@')[0] || 'Practitioner';
    
    let hasReceivedWelcome = false;
    let authUser = null;

    try {
      if (supabase.auth?.admin?.getUserById) {
        const { data } = await supabase.auth.admin.getUserById(userId);
        authUser = data?.user;
        hasReceivedWelcome = authUser?.user_metadata?.welcome_email_sent === true;
      }
    } catch (e) {
      console.warn('Could not query admin user_metadata, proceeding with fallback email check:', e.message);
    }

    if (!hasReceivedWelcome && userEmail) {
      // Send the Welcome Email
      const emailRes = await emailService.sendWelcomeEmail({
        email: userEmail,
        name: userName
      });

      // Mark as sent in user_metadata if admin API is available
      if (authUser && supabase.auth?.admin?.updateUserById) {
        try {
          await supabase.auth.admin.updateUserById(userId, {
            user_metadata: {
              ...authUser.user_metadata,
              welcome_email_sent: true
            }
          });
        } catch (e) {
          console.warn('Could not update welcome_email_sent metadata:', e.message);
        }
      }

      return res.json({ success: true, message: 'Welcome email sent.', emailResult: emailRes });
    }

    return res.json({ success: true, message: 'Welcome email already sent previously.' });
  } catch (err) {
    console.error('Welcome Email Check Error:', err);
    return res.status(500).json({ success: false, error: 'Failed to process welcome email' });
  }
};
