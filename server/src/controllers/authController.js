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

exports.updateProfile = async (req, res) => {
  const userId = req.user.id;
  const { full_name } = req.body;

  if (!full_name || !full_name.trim()) {
    return res.status(400).json({ success: false, error: 'Full name is required' });
  }

  const trimmedName = full_name.trim();

  try {
    // 1. Update or Upsert in public.profiles table
    const { data: profile, error: dbError } = await supabase
      .from('profiles')
      .upsert({
        id: userId,
        email: req.user.email,
        full_name: trimmedName,
        role: req.user.role || 'student'
      })
      .select()
      .single();

    if (dbError) {
      console.error('Profiles table update error:', dbError);
    }

    // 2. Update user_metadata in Supabase Auth if admin API available
    if (supabase.auth?.admin?.updateUserById) {
      try {
        await supabase.auth.admin.updateUserById(userId, {
          user_metadata: { full_name: trimmedName }
        });
      } catch (e) {
        console.warn('Could not update user_metadata in auth:', e.message);
      }
    }

    return res.json({
      success: true,
      message: 'Profile updated successfully',
      user: {
        ...req.user,
        full_name: trimmedName
      }
    });
  } catch (err) {
    console.error('Update Profile Error:', err);
    return res.status(500).json({ success: false, error: 'Failed to update profile' });
  }
};
