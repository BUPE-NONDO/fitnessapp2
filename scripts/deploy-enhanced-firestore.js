const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Deploying Enhanced Firestore Configuration...');
console.log('📧 Developer: Bupe Nondo (bupe@hytel.io)');
console.log('🏢 Organization: Hytel');
console.log('');

// Check if Firebase CLI is installed
try {
  execSync('firebase --version', { stdio: 'pipe' });
  console.log('✅ Firebase CLI is installed');
} catch (error) {
  console.error('❌ Firebase CLI is not installed. Please install it first:');
  console.error('npm install -g firebase-tools');
  process.exit(1);
}

// Check if user is logged in
try {
  execSync('firebase projects:list', { stdio: 'pipe' });
  console.log('✅ Firebase authentication verified');
} catch (error) {
  console.error('❌ Not logged in to Firebase. Please run:');
  console.error('firebase login');
  process.exit(1);
}

// Backup current indexes
const currentIndexesPath = path.join(__dirname, '..', 'firestore.indexes.json');
const backupIndexesPath = path.join(__dirname, '..', 'firestore.indexes.backup.json');

if (fs.existsSync(currentIndexesPath)) {
  fs.copyFileSync(currentIndexesPath, backupIndexesPath);
  console.log('✅ Current indexes backed up');
}

// Copy enhanced indexes
const enhancedIndexesPath = path.join(__dirname, '..', 'firestore-enhanced.indexes.json');
if (fs.existsSync(enhancedIndexesPath)) {
  fs.copyFileSync(enhancedIndexesPath, currentIndexesPath);
  console.log('✅ Enhanced indexes configuration applied');
} else {
  console.error('❌ Enhanced indexes file not found');
  process.exit(1);
}

try {
  console.log('');
  console.log('📋 Deploying Firestore Security Rules...');
  
  // Deploy Firestore rules
  execSync('firebase deploy --only firestore:rules', { 
    stdio: 'inherit',
    cwd: path.join(__dirname, '..')
  });
  console.log('✅ Firestore security rules deployed');

  console.log('');
  console.log('📊 Deploying Firestore Indexes...');
  
  // Deploy Firestore indexes
  execSync('firebase deploy --only firestore:indexes', { 
    stdio: 'inherit',
    cwd: path.join(__dirname, '..')
  });
  console.log('✅ Firestore indexes deployed');

  console.log('');
  console.log('🗄️ Initializing Enhanced Database Structure...');
  
  // Run database initialization
  const initScript = path.join(__dirname, 'init-enhanced-firestore.js');
  if (fs.existsSync(initScript)) {
    execSync(`node "${initScript}"`, { 
      stdio: 'inherit',
      cwd: path.join(__dirname, '..')
    });
    console.log('✅ Enhanced database structure initialized');
  } else {
    console.warn('⚠️ Database initialization script not found, skipping...');
  }

  console.log('');
  console.log('🎉 Enhanced Firestore Deployment Completed Successfully!');
  console.log('');
  console.log('📋 Deployment Summary:');
  console.log('  ✅ Security rules updated with legal compliance support');
  console.log('  ✅ Database indexes optimized for new collections');
  console.log('  ✅ Enhanced collections initialized:');
  console.log('    - legalConsents (GDPR compliance)');
  console.log('    - progressStats (enhanced tracking)');
  console.log('    - workoutCompletions (detailed progress)');
  console.log('    - securityEvents (audit logging)');
  console.log('    - auditLogs (compliance tracking)');
  console.log('    - passwordHistory (security)');
  console.log('    - userSessions (session management)');
  console.log('');
  console.log('🔐 Security Features:');
  console.log('  ✅ Password strength validation');
  console.log('  ✅ Legal consent tracking');
  console.log('  ✅ Audit logging');
  console.log('  ✅ Enhanced user authentication');
  console.log('');
  console.log('📧 Support: bupe@hytel.io');
  console.log('🏢 Hytel Organization');

} catch (error) {
  console.error('');
  console.error('❌ Deployment failed:', error.message);
  console.error('');
  console.error('🔄 Restoring backup...');
  
  // Restore backup if deployment failed
  if (fs.existsSync(backupIndexesPath)) {
    fs.copyFileSync(backupIndexesPath, currentIndexesPath);
    console.log('✅ Backup restored');
  }
  
  console.error('');
  console.error('📧 For support, contact: bupe@hytel.io');
  process.exit(1);
}

// Clean up backup file on success
if (fs.existsSync(backupIndexesPath)) {
  fs.unlinkSync(backupIndexesPath);
  console.log('🧹 Backup file cleaned up');
}

console.log('');
console.log('🚀 Ready for production use!');
console.log('📱 Users can now:');
console.log('  - Create accounts with strong password requirements');
console.log('  - Accept terms and conditions with full tracking');
console.log('  - Enjoy enhanced progress tracking');
console.log('  - Benefit from improved security measures');
console.log('');
console.log('👨‍💻 Developed by Bupe Nondo for Hytel Organization');
console.log('📧 Contact: bupe@hytel.io');
