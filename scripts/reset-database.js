const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs, deleteDoc, doc } = require('firebase/firestore');

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAGhmmERHqlE_6f2jFAALXiQFrtpy5fims",
  authDomain: "fitness-app-bupe-staging.firebaseapp.com",
  projectId: "fitness-app-bupe-staging",
  storageBucket: "fitness-app-bupe-staging.firebasestorage.app",
  messagingSenderId: "717122355693",
  appId: "1:717122355693:web:7b224927c57a2cc10b67e4"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Collections to reset (excluding system collections)
const collectionsToReset = [
  'users',
  'goals', 
  'logs',
  'badges'
  // Note: We keep 'badgeDefinitions' and 'metadata' as they are system data
];

async function deleteCollection(collectionName) {
  console.log(`🗑️ Deleting collection: ${collectionName}`);
  
  try {
    const snapshot = await getDocs(collection(db, collectionName));
    const deletePromises = [];
    
    snapshot.docs.forEach((document) => {
      deletePromises.push(deleteDoc(doc(db, collectionName, document.id)));
    });
    
    await Promise.all(deletePromises);
    console.log(`✅ Deleted ${snapshot.docs.length} documents from ${collectionName}`);
    
    return snapshot.docs.length;
  } catch (error) {
    console.error(`❌ Error deleting collection ${collectionName}:`, error);
    return 0;
  }
}

async function resetDatabase() {
  try {
    console.log('🧹 Starting database reset...');
    console.log('⚠️  This will delete all user data, goals, and logs!');
    console.log('📋 System data (badge definitions, metadata) will be preserved.');
    
    let totalDeleted = 0;
    
    for (const collectionName of collectionsToReset) {
      const deletedCount = await deleteCollection(collectionName);
      totalDeleted += deletedCount;
    }
    
    console.log('\n🎉 Database reset completed successfully!');
    console.log(`📊 Summary:`);
    console.log(`  🗑️ Total documents deleted: ${totalDeleted}`);
    console.log(`  📋 Collections reset: ${collectionsToReset.join(', ')}`);
    console.log(`  💾 System collections preserved: badgeDefinitions, metadata`);
    console.log(`🔗 View clean database at: https://console.firebase.google.com/project/fitness-app-bupe-staging/firestore`);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error resetting database:', error);
    process.exit(1);
  }
}

// Confirmation prompt
console.log('⚠️  WARNING: This will delete all user data!');
console.log('Are you sure you want to reset the database? (This action cannot be undone)');
console.log('Type "yes" to continue or press Ctrl+C to cancel:');

// Simple confirmation (in a real app, you'd use a proper prompt library)
const args = process.argv.slice(2);
if (args.includes('--confirm') || args.includes('-y')) {
  resetDatabase();
} else {
  console.log('❌ Reset cancelled. Use --confirm or -y flag to proceed.');
  console.log('Example: node reset-database.js --confirm');
  process.exit(0);
}
