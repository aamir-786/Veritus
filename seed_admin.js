const supabase = require('./server/src/config/supabase');

async function seedAdmin() {
  console.log('Seeding admin user into Supabase...');

  const adminEmail = 'admin@veritus.com';
  const adminPassword = 'AdminPassword123!';
  const adminName = 'Veritus Admin';

  try {
    // 1. Create the user in auth.users
    const { data: user, error: createUserError } = await supabase.auth.admin.createUser({
      email: adminEmail,
      password: adminPassword,
      email_confirm: true, // Auto-confirm email so they can log in immediately
      user_metadata: {
        full_name: adminName
      }
    });

    if (createUserError) {
      if (createUserError.message.includes('already exists')) {
        console.log(`Admin user ${adminEmail} already exists. Attempting to update role...`);
        
        // Fetch the user ID
        const { data: { users } } = await supabase.auth.admin.listUsers();
        const existingAdmin = users.find(u => u.email === adminEmail);
        
        if (existingAdmin) {
          await makeUserAdmin(existingAdmin.id);
        }
      } else {
        throw createUserError;
      }
    } else {
      console.log(`Successfully created admin user: ${adminEmail}`);
      
      // Wait a moment for the Postgres trigger to create the public.profiles record
      await new Promise(resolve => setTimeout(resolve, 2000));

      await makeUserAdmin(user.user.id);
    }
  } catch (err) {
    console.error('Failed to seed admin:', err);
  }
}

async function makeUserAdmin(userId) {
  console.log(`Updating role to 'admin' in public.profiles for user ${userId}...`);
  
  const { error: updateError } = await supabase
    .from('profiles')
    .update({ role: 'admin' })
    .eq('id', userId);

  if (updateError) {
    console.error('Failed to update profile role:', updateError);
  } else {
    console.log('Successfully set admin role!');
    console.log('\n--- ADMIN CREDENTIALS ---');
    console.log('Email: admin@veritus.com');
    console.log('Password: AdminPassword123!');
    console.log('-------------------------');
  }
}

seedAdmin();
