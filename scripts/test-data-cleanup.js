/**
 * Test script for data cleanup functionality
 * Run this script to test the isolated onboarding system
 */

import { initializeApp } from 'firebase/app';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';
import { UserDataCleanupService } from '../apps/web/src/services/userDataCleanupService.js';

// Firebase config (use your actual config)
const firebaseConfig = {
  // Add your Firebase config here
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Connect to emulator if running locally
if (process.env.NODE_ENV === 'development') {
  connectFirestoreEmulator(db, 'localhost', 8080);
}

async function testDataCleanup() {
  console.log('🧪 Testing Data Cleanup System...\n');

  try {
    // 1. Get current stats
    console.log('📊 Getting current database stats...');
    const initialStats = await UserDataCleanupService.getCleanupStats();
    console.log('Initial stats:', initialStats);
    console.log('');

    // 2. Test user data isolation verification
    console.log('🔍 Testing user data isolation...');
    const testUserId = 'test-user-123';
    const isolationResult = await UserDataCleanupService.verifyUserDataIsolation(testUserId);
    console.log('Isolation check result:', isolationResult);
    console.log('');

    // 3. Create a fresh test user
    console.log('🆕 Creating fresh test user...');
    await UserDataCleanupService.createFreshUser(testUserId, {
      email: 'test@example.com',
      displayName: 'Test User',
      photoURL: null
    });
    console.log('✅ Fresh test user created');
    console.log('');

    // 4. Verify isolation after creation
    console.log('🔍 Verifying isolation after user creation...');
    const postCreationIsolation = await UserDataCleanupService.verifyUserDataIsolation(testUserId);
    console.log('Post-creation isolation:', postCreationIsolation);
    console.log('');

    // 5. Get updated stats
    console.log('📊 Getting updated database stats...');
    const updatedStats = await UserDataCleanupService.getCleanupStats();
    console.log('Updated stats:', updatedStats);
    console.log('');

    // 6. Clean up test user
    console.log('🧹 Cleaning up test user...');
    await UserDataCleanupService.deleteUserData(testUserId);
    console.log('✅ Test user cleaned up');
    console.log('');

    // 7. Final stats
    console.log('📊 Final database stats...');
    const finalStats = await UserDataCleanupService.getCleanupStats();
    console.log('Final stats:', finalStats);
    console.log('');

    console.log('🎉 All tests completed successfully!');

  } catch (error) {
    console.error('❌ Test failed:', error);
    process.exit(1);
  }
}

async function testCompleteCleanup() {
  console.log('⚠️  WARNING: This will delete ALL user data!');
  console.log('This should only be run in development/testing environments.');
  console.log('');

  // Uncomment the following lines to actually perform cleanup
  // console.log('🗑️  Performing complete data cleanup...');
  // await UserDataCleanupService.deleteAllUserData();
  // console.log('✅ Complete cleanup finished');

  console.log('Complete cleanup test skipped (safety measure)');
  console.log('Uncomment the lines in the script to actually run cleanup');
}

// Main execution
async function main() {
  const testType = process.argv[2] || 'isolation';

  switch (testType) {
    case 'isolation':
      await testDataCleanup();
      break;
    case 'cleanup':
      await testCompleteCleanup();
      break;
    default:
      console.log('Usage: node test-data-cleanup.js [isolation|cleanup]');
      console.log('  isolation: Test user data isolation (safe)');
      console.log('  cleanup: Test complete data cleanup (destructive)');
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}

export { testDataCleanup, testCompleteCleanup };
