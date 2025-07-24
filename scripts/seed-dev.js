const { initializeApp } = require('firebase/app');
const { getFirestore, connectFirestoreEmulator, collection, doc, setDoc, addDoc, Timestamp } = require('firebase/firestore');

// Firebase configuration for development
const firebaseConfig = {
  apiKey: "demo-api-key",
  authDomain: "demo-project.firebaseapp.com",
  projectId: "demo-project",
  storageBucket: "demo-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:demo"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Connect to emulator if running locally
const isEmulator = process.env.NODE_ENV === 'development' || process.argv.includes('--emulator');
if (isEmulator) {
  try {
    connectFirestoreEmulator(db, 'localhost', 8080);
    console.log('🔧 Connected to Firestore emulator');
  } catch (error) {
    console.log('⚠️ Could not connect to emulator, using production database');
  }
}

// Development users (with known UIDs for testing)
const devUsers = [
  {
    uid: 'dev-user-1',
    email: 'test@example.com',
    displayName: 'Test User',
    preferences: {
      theme: 'light',
      notifications: true,
      units: 'metric'
    }
  },
  {
    uid: 'dev-user-2',
    email: 'demo@example.com', 
    displayName: 'Demo User',
    preferences: {
      theme: 'dark',
      notifications: false,
      units: 'imperial'
    }
  }
];

// Simple goal templates for development
const devGoalTemplates = [
  { title: 'Daily Run', metric: 'distance', target: 5, frequency: 'daily' },
  { title: 'Push-ups', metric: 'count', target: 20, frequency: 'daily' },
  { title: 'Meditation', metric: 'duration', target: 10, frequency: 'daily' },
  { title: 'Weekly Gym', metric: 'duration', target: 60, frequency: 'weekly' }
];

// Badge definitions for development
const devBadges = [
  {
    id: 'first-goal',
    name: 'Goal Setter',
    description: 'Created your first goal',
    icon: '🎯',
    category: 'milestone'
  },
  {
    id: 'first-log',
    name: 'Getting Started',
    description: 'Logged your first activity',
    icon: '📝',
    category: 'milestone'
  },
  {
    id: 'week-streak',
    name: 'Week Warrior',
    description: 'Maintained a 7-day streak',
    icon: '🔥',
    category: 'streak'
  }
];

function getRandomValue(metric, target) {
  const variance = 0.2; // 20% variance for dev data
  const min = target * (1 - variance);
  const max = target * (1 + variance);
  const value = min + Math.random() * (max - min);
  
  switch (metric) {
    case 'count':
      return Math.round(value);
    case 'duration':
      return Math.round(value * 10) / 10;
    case 'distance':
      return Math.round(value * 100) / 100;
    default:
      return Math.round(value);
  }
}

async function seedDevelopmentData() {
  try {
    console.log('🛠️ Starting development environment seeding...');
    
    if (isEmulator) {
      console.log('🔧 Using Firestore emulator');
    } else {
      console.log('☁️ Using production Firestore');
    }

    // Seed badge definitions
    console.log('📋 Seeding badge definitions...');
    for (const badge of devBadges) {
      await setDoc(doc(db, 'badgeDefinitions', badge.id), {
        ...badge,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      });
      console.log(`✅ Created badge: ${badge.name}`);
    }

    // Seed development users
    console.log('👥 Seeding development users...');
    for (const user of devUsers) {
      await setDoc(doc(db, 'users', user.uid), {
        email: user.email,
        displayName: user.displayName,
        preferences: user.preferences,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
        stats: {
          totalGoals: 0,
          activeGoals: 0,
          totalLogs: 0,
          streakDays: 0,
          joinedDate: Timestamp.now()
        }
      });
      console.log(`✅ Created user: ${user.displayName} (${user.email})`);
    }

    // Seed goals for first user
    console.log('🎯 Seeding sample goals...');
    const firstUser = devUsers[0];
    const userGoals = [];
    
    for (const template of devGoalTemplates) {
      const goalData = {
        userId: firstUser.uid,
        title: template.title,
        description: `Sample ${template.title.toLowerCase()} goal for development`,
        metric: template.metric,
        target: template.target,
        frequency: template.frequency,
        isActive: true,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      };

      const goalRef = await addDoc(collection(db, 'goals'), goalData);
      userGoals.push({ id: goalRef.id, ...goalData });
      console.log(`✅ Created goal: ${template.title}`);
    }

    // Seed some sample logs
    console.log('📝 Seeding sample activity logs...');
    let totalLogs = 0;
    
    for (const goal of userGoals) {
      // Create 3-5 logs per goal
      const numLogs = 3 + Math.floor(Math.random() * 3);
      
      for (let i = 0; i < numLogs; i++) {
        const daysAgo = Math.floor(Math.random() * 7); // Last 7 days
        const logDate = new Date();
        logDate.setDate(logDate.getDate() - daysAgo);
        
        const logData = {
          userId: firstUser.uid,
          goalId: goal.id,
          date: Timestamp.fromDate(logDate),
          value: getRandomValue(goal.metric, goal.target),
          notes: i === 0 ? 'First log entry!' : '',
          createdAt: Timestamp.fromDate(logDate),
          updatedAt: Timestamp.fromDate(logDate)
        };

        await addDoc(collection(db, 'logs'), logData);
        totalLogs++;
      }
      
      console.log(`  📊 Created ${numLogs} logs for ${goal.title}`);
    }

    // Update user stats
    await setDoc(doc(db, 'users', firstUser.uid), {
      email: firstUser.email,
      displayName: firstUser.displayName,
      preferences: firstUser.preferences,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
      stats: {
        totalGoals: userGoals.length,
        activeGoals: userGoals.length,
        totalLogs: totalLogs,
        streakDays: 3,
        joinedDate: Timestamp.now()
      }
    });

    console.log('\n🎉 Development seeding completed successfully!');
    console.log(`📊 Summary:`);
    console.log(`  👥 Users: ${devUsers.length}`);
    console.log(`  🏆 Badge definitions: ${devBadges.length}`);
    console.log(`  🎯 Goals: ${userGoals.length}`);
    console.log(`  📝 Activity logs: ${totalLogs}`);
    console.log(`\n🔑 Test Credentials:`);
    console.log(`  Email: ${firstUser.email}`);
    console.log(`  UID: ${firstUser.uid}`);
    
    if (isEmulator) {
      console.log(`\n🔧 Emulator URLs:`);
      console.log(`  Firestore: http://localhost:4000/firestore`);
      console.log(`  Auth: http://localhost:4000/auth`);
    }

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding development data:', error);
    process.exit(1);
  }
}

// Run development seeding
seedDevelopmentData();
