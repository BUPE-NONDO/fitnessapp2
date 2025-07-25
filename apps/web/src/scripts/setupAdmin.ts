/**
 * Admin Setup Script
 * 
 * This script initializes the admin system with default admin users.
 * Run this once to set up the admin portal.
 * 
 * Usage:
 * 1. Open browser console on your app
 * 2. Copy and paste this script
 * 3. Call setupAdminUsers()
 */

import { AdminSetupService } from '../services/adminSetupService';

declare global {
  interface Window {
    setupAdminUsers: () => Promise<void>;
    checkAdminStatus: () => Promise<void>;
  }
}

/**
 * Set up admin users
 */
async function setupAdminUsers() {
  try {
    console.log('🚀 Starting admin setup...');
    
    // Check if setup is allowed
    const canSetup = await AdminSetupService.canPerformSetup();
    if (!canSetup) {
      console.log('⚠️ Admin users already exist. Setup not required.');
      return;
    }

    // Initialize admin users
    await AdminSetupService.initializeAdminUsers();
    
    console.log('✅ Admin setup complete!');
    console.log('📋 Default admin accounts created:');
    console.log('   Super Admin: admin@fitnessapp.com / admin123');
    console.log('   Admin: manager@fitnessapp.com / manager123');
    console.log('   Moderator: mod@fitnessapp.com / mod123');
    console.log('   Support: support@fitnessapp.com / support123');
    console.log('');
    console.log('🔐 Please change default passwords after first login!');
    console.log('🌐 Access admin portal at: /admin');
    
  } catch (error) {
    console.error('❌ Admin setup failed:', error);
  }
}

/**
 * Check admin status
 */
async function checkAdminStatus() {
  try {
    const status = await AdminSetupService.getSetupStatus();
    
    console.log('📊 Admin System Status:');
    console.log(`   Admin Count: ${status.adminCount}`);
    console.log(`   Setup Complete: ${status.isSetupComplete ? 'Yes' : 'No'}`);
    console.log(`   Has Admins: ${status.hasAdmins ? 'Yes' : 'No'}`);
    
    if (status.isSetupComplete) {
      console.log('✅ Admin system is ready!');
      console.log('🌐 Access admin portal at: /admin');
    } else {
      console.log('⚠️ Admin setup required. Run setupAdminUsers()');
    }
    
  } catch (error) {
    console.error('❌ Failed to check admin status:', error);
  }
}

// Make functions available globally for console access
if (typeof window !== 'undefined') {
  window.setupAdminUsers = setupAdminUsers;
  window.checkAdminStatus = checkAdminStatus;
}

export { setupAdminUsers, checkAdminStatus };

// Auto-run status check when script loads
if (typeof window !== 'undefined') {
  console.log('🔧 Admin Setup Script Loaded');
  console.log('📋 Available commands:');
  console.log('   setupAdminUsers() - Initialize admin system');
  console.log('   checkAdminStatus() - Check current status');
  console.log('');
  
  // Auto-check status
  checkAdminStatus();
}
