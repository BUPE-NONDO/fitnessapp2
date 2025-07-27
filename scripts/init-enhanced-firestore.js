const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');

// Initialize Firebase Admin
if (!admin.apps.length) {
  // Try to load service account key
  const serviceAccountPath = path.join(__dirname, '..', 'firebase-service-account.json');
  
  if (fs.existsSync(serviceAccountPath)) {
    const serviceAccount = require(serviceAccountPath);
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      projectId: serviceAccount.project_id
    });
  } else {
    // Use default credentials (for deployed environments)
    admin.initializeApp();
  }
}

const db = admin.firestore();

async function initializeEnhancedFirestore() {
  console.log('🚀 Initializing Enhanced Firestore Database...');

  try {
    // Create system metadata document
    await db.collection('metadata').doc('system').set({
      version: '2.0.0',
      lastUpdated: admin.firestore.FieldValue.serverTimestamp(),
      features: {
        passwordSecurity: true,
        legalCompliance: true,
        enhancedTracking: true,
        auditLogging: true
      },
      developer: {
        name: 'Bupe Nondo',
        email: 'bupe@hytel.io',
        organization: 'Hytel'
      },
      termsVersion: '1.0.0',
      privacyVersion: '1.0.0'
    });
    console.log('✅ System metadata initialized');

    // Create legal compliance templates
    await db.collection('legalTemplates').doc('terms').set({
      version: '1.0.0',
      title: 'Terms and Conditions',
      lastUpdated: admin.firestore.FieldValue.serverTimestamp(),
      content: 'Terms and Conditions content...',
      mandatory: true
    });

    await db.collection('legalTemplates').doc('privacy').set({
      version: '1.0.0',
      title: 'Privacy Policy',
      lastUpdated: admin.firestore.FieldValue.serverTimestamp(),
      content: 'Privacy Policy content...',
      mandatory: true
    });
    console.log('✅ Legal compliance templates created');

    // Create password security configuration
    await db.collection('securityConfig').doc('passwordPolicy').set({
      minLength: 8,
      requireUppercase: true,
      requireLowercase: true,
      requireNumbers: true,
      requireSpecialChars: true,
      maxLength: 128,
      preventCommonPasswords: true,
      passwordHistoryCount: 5,
      lastUpdated: admin.firestore.FieldValue.serverTimestamp()
    });
    console.log('✅ Password security configuration created');

    // Create badge definitions for enhanced achievements
    const badgeDefinitions = [
      {
        id: 'password_security_champion',
        name: 'Security Champion',
        description: 'Created account with strong password security',
        icon: '🔒',
        category: 'security',
        points: 50,
        requirements: {
          type: 'account_creation',
          strongPassword: true
        }
      },
      {
        id: 'terms_acceptor',
        name: 'Terms Acceptor',
        description: 'Read and accepted terms and conditions',
        icon: '📋',
        category: 'compliance',
        points: 25,
        requirements: {
          type: 'legal_compliance',
          acceptedTerms: true
        }
      },
      {
        id: 'privacy_aware',
        name: 'Privacy Aware',
        description: 'Read and understood privacy policy',
        icon: '🛡️',
        category: 'compliance',
        points: 25,
        requirements: {
          type: 'legal_compliance',
          readPrivacyPolicy: true
        }
      },
      {
        id: 'workout_streak_7',
        name: '7-Day Streak',
        description: 'Completed workouts for 7 consecutive days',
        icon: '🔥',
        category: 'fitness',
        points: 100,
        requirements: {
          type: 'workout_streak',
          days: 7
        }
      },
      {
        id: 'workout_streak_30',
        name: '30-Day Streak',
        description: 'Completed workouts for 30 consecutive days',
        icon: '💪',
        category: 'fitness',
        points: 500,
        requirements: {
          type: 'workout_streak',
          days: 30
        }
      }
    ];

    for (const badge of badgeDefinitions) {
      await db.collection('badgeDefinitions').doc(badge.id).set({
        ...badge,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      });
    }
    console.log('✅ Enhanced badge definitions created');

    // Create exercise database with enhanced metadata
    const exercises = [
      {
        id: 'push_ups',
        name: 'Push-ups',
        category: 'strength',
        muscle: 'chest',
        equipment: 'none',
        difficulty: 'beginner',
        instructions: 'Start in plank position, lower body to ground, push back up',
        tips: ['Keep core tight', 'Full range of motion', 'Control the movement'],
        calories_per_minute: 8,
        safety_notes: ['Avoid if you have wrist issues', 'Modify on knees if needed']
      },
      {
        id: 'squats',
        name: 'Squats',
        category: 'strength',
        muscle: 'legs',
        equipment: 'none',
        difficulty: 'beginner',
        instructions: 'Stand with feet shoulder-width apart, lower hips back and down',
        tips: ['Keep chest up', 'Weight in heels', 'Knees track over toes'],
        calories_per_minute: 6,
        safety_notes: ['Avoid if you have knee problems', 'Start with bodyweight only']
      },
      {
        id: 'plank',
        name: 'Plank',
        category: 'core',
        muscle: 'core',
        equipment: 'none',
        difficulty: 'beginner',
        instructions: 'Hold plank position with straight line from head to heels',
        tips: ['Engage core', 'Breathe normally', 'Keep hips level'],
        calories_per_minute: 4,
        safety_notes: ['Avoid if you have lower back issues', 'Start with shorter holds']
      }
    ];

    for (const exercise of exercises) {
      await db.collection('exercises').doc(exercise.id).set({
        ...exercise,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      });
    }
    console.log('✅ Enhanced exercise database created');

    // Create goal templates
    const goalTemplates = [
      {
        id: 'lose_weight',
        name: 'Lose Weight',
        description: 'Sustainable weight loss through exercise and healthy habits',
        category: 'weight_loss',
        defaultDuration: 12, // weeks
        milestones: [
          { week: 2, description: 'Establish workout routine' },
          { week: 4, description: 'First fitness assessment' },
          { week: 8, description: 'Mid-point evaluation' },
          { week: 12, description: 'Goal achievement review' }
        ]
      },
      {
        id: 'build_muscle',
        name: 'Build Muscle',
        description: 'Increase muscle mass and strength through progressive training',
        category: 'muscle_gain',
        defaultDuration: 16, // weeks
        milestones: [
          { week: 2, description: 'Learn proper form' },
          { week: 6, description: 'Increase training intensity' },
          { week: 10, description: 'Strength assessment' },
          { week: 16, description: 'Muscle gain evaluation' }
        ]
      }
    ];

    for (const template of goalTemplates) {
      await db.collection('goalTemplates').doc(template.id).set({
        ...template,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      });
    }
    console.log('✅ Goal templates created');

    // Create system audit log
    await db.collection('auditLogs').add({
      action: 'database_initialization',
      details: {
        version: '2.0.0',
        features: ['password_security', 'legal_compliance', 'enhanced_tracking'],
        developer: 'Bupe Nondo',
        organization: 'Hytel'
      },
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
      userId: 'system',
      ipAddress: 'localhost',
      userAgent: 'Firebase Admin SDK'
    });
    console.log('✅ System audit log created');

    console.log('🎉 Enhanced Firestore Database initialization completed successfully!');
    console.log('📧 Contact: bupe@hytel.io for support');

  } catch (error) {
    console.error('❌ Error initializing enhanced Firestore database:', error);
    throw error;
  }
}

// Run the initialization
if (require.main === module) {
  initializeEnhancedFirestore()
    .then(() => {
      console.log('✅ Database initialization completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Database initialization failed:', error);
      process.exit(1);
    });
}

module.exports = { initializeEnhancedFirestore };
