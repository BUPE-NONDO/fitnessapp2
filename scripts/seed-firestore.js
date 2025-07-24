const { initializeApp } = require('firebase/app');
const { getFirestore, collection, doc, setDoc, addDoc, Timestamp } = require('firebase/firestore');

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

// Badge definitions to seed
const badgeDefinitions = [
  {
    id: 'first-goal',
    name: 'Goal Setter',
    description: 'Created your first fitness goal',
    icon: '🎯',
    category: 'milestone',
    rarity: 'common',
    points: 10,
    requirements: {
      type: 'goal_created',
      count: 1
    }
  },
  {
    id: 'first-log',
    name: 'Getting Started',
    description: 'Logged your first activity',
    icon: '📝',
    category: 'milestone',
    rarity: 'common',
    points: 10,
    requirements: {
      type: 'activity_logged',
      count: 1
    }
  },
  {
    id: 'week-streak',
    name: 'Week Warrior',
    description: 'Maintained a 7-day activity streak',
    icon: '🔥',
    category: 'streak',
    rarity: 'rare',
    points: 50,
    requirements: {
      type: 'streak',
      days: 7
    }
  },
  {
    id: 'goal-achiever',
    name: 'Goal Crusher',
    description: 'Achieved your first goal',
    icon: '🏆',
    category: 'achievement',
    rarity: 'rare',
    points: 25,
    requirements: {
      type: 'goal_achieved',
      count: 1
    }
  },
  {
    id: 'consistent-logger',
    name: 'Consistency King',
    description: 'Logged activities for 30 days',
    icon: '👑',
    category: 'consistency',
    rarity: 'epic',
    points: 100,
    requirements: {
      type: 'days_logged',
      days: 30
    }
  },
  {
    id: 'overachiever',
    name: 'Overachiever',
    description: 'Exceeded a goal by 50%',
    icon: '⭐',
    category: 'performance',
    rarity: 'rare',
    points: 30,
    requirements: {
      type: 'goal_exceeded',
      percentage: 150
    }
  },
  {
    id: 'month-streak',
    name: 'Dedication Master',
    description: 'Maintained a 30-day activity streak',
    icon: '💪',
    category: 'streak',
    rarity: 'epic',
    points: 150,
    requirements: {
      type: 'streak',
      days: 30
    }
  },
  {
    id: 'hundred-logs',
    name: 'Century Club',
    description: 'Logged 100 activities',
    icon: '💯',
    category: 'consistency',
    rarity: 'epic',
    points: 75,
    requirements: {
      type: 'activity_logged',
      count: 100
    }
  },
  {
    id: 'perfectionist',
    name: 'Perfectionist',
    description: 'Exceeded a goal by 100%',
    icon: '🎖️',
    category: 'performance',
    rarity: 'epic',
    points: 100,
    requirements: {
      type: 'goal_exceeded',
      percentage: 200
    }
  },
  {
    id: 'legend',
    name: 'Fitness Legend',
    description: 'Maintained a 100-day streak',
    icon: '🌟',
    category: 'streak',
    rarity: 'legendary',
    points: 500,
    requirements: {
      type: 'streak',
      days: 100
    }
  }
];

// System metadata
const systemMetadata = {
  version: '1.0.0',
  lastUpdated: Timestamp.now(),
  features: {
    goals: true,
    logging: true,
    badges: true,
    analytics: true
  },
  limits: {
    maxGoalsPerUser: 50,
    maxLogsPerDay: 100,
    maxBadgesPerUser: 1000
  }
};

// Dummy users data
const dummyUsers = [
  {
    uid: 'demo-user-1',
    email: 'alex.fitness@example.com',
    displayName: 'Alex Johnson',
    preferences: {
      theme: 'light',
      notifications: true,
      units: 'metric'
    }
  },
  {
    uid: 'demo-user-2',
    email: 'sarah.runner@example.com',
    displayName: 'Sarah Chen',
    preferences: {
      theme: 'dark',
      notifications: true,
      units: 'imperial'
    }
  },
  {
    uid: 'demo-user-3',
    email: 'mike.lifter@example.com',
    displayName: 'Mike Rodriguez',
    preferences: {
      theme: 'system',
      notifications: false,
      units: 'metric'
    }
  }
];

// Goal templates for realistic data
const goalTemplates = [
  { title: 'Morning Run', metric: 'distance', target: 5, frequency: 'daily', description: 'Start each day with a 5km run' },
  { title: 'Push-ups Challenge', metric: 'count', target: 50, frequency: 'daily', description: 'Build upper body strength' },
  { title: 'Meditation', metric: 'duration', target: 20, frequency: 'daily', description: 'Daily mindfulness practice' },
  { title: 'Weight Training', metric: 'duration', target: 60, frequency: 'weekly', description: 'Strength training sessions' },
  { title: 'Cycling', metric: 'distance', target: 25, frequency: 'weekly', description: 'Weekend cycling adventures' },
  { title: 'Yoga Practice', metric: 'duration', target: 45, frequency: 'daily', description: 'Flexibility and balance' },
  { title: 'Swimming Laps', metric: 'distance', target: 1000, frequency: 'weekly', description: 'Pool swimming workout' },
  { title: 'Squats', metric: 'count', target: 100, frequency: 'daily', description: 'Lower body strength' },
  { title: 'Walking Steps', metric: 'count', target: 10000, frequency: 'daily', description: 'Daily step goal' },
  { title: 'Plank Hold', metric: 'duration', target: 2, frequency: 'daily', description: 'Core strength building' }
];

// Helper functions for generating realistic data
function getRandomDate(start, end) {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

function getRandomElement(array) {
  return array[Math.floor(Math.random() * array.length)];
}

function generateRealisticValue(metric, target) {
  const variance = 0.3; // 30% variance
  const min = target * (1 - variance);
  const max = target * (1 + variance);
  const value = min + Math.random() * (max - min);

  switch (metric) {
    case 'count':
      return Math.round(value);
    case 'duration':
      return Math.round(value * 10) / 10; // Round to 1 decimal
    case 'distance':
      return Math.round(value * 100) / 100; // Round to 2 decimals
    case 'weight':
      return Math.round(value * 10) / 10;
    default:
      return Math.round(value);
  }
}

async function seedDatabase() {
  try {
    console.log('🌱 Starting comprehensive database seeding...');

    // Seed badge definitions
    console.log('📋 Seeding badge definitions...');
    for (const badge of badgeDefinitions) {
      await setDoc(doc(db, 'badgeDefinitions', badge.id), {
        ...badge,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      });
      console.log(`✅ Created badge definition: ${badge.name}`);
    }

    // Seed system metadata
    console.log('⚙️ Seeding system metadata...');
    await setDoc(doc(db, 'metadata', 'system'), systemMetadata);
    console.log('✅ Created system metadata');

    // Seed dummy users
    console.log('👥 Seeding dummy users...');
    for (const user of dummyUsers) {
      const joinDate = getRandomDate(new Date(2024, 0, 1), new Date(2024, 6, 1));
      await setDoc(doc(db, 'users', user.uid), {
        email: user.email,
        displayName: user.displayName,
        preferences: user.preferences,
        createdAt: Timestamp.fromDate(joinDate),
        updatedAt: Timestamp.now(),
        stats: {
          totalGoals: 0, // Will be updated as we create goals
          activeGoals: 0,
          totalLogs: 0,
          streakDays: Math.floor(Math.random() * 30),
          joinedDate: Timestamp.fromDate(joinDate)
        }
      });
      console.log(`✅ Created user: ${user.displayName}`);
    }

    console.log('🎉 Basic seeding completed successfully!');
    console.log(`📊 Summary:`);
    console.log(`  👥 Users: ${dummyUsers.length}`);
    console.log(`  🏆 Badge definitions: ${badgeDefinitions.length}`);
    console.log(`🔗 View data at: https://console.firebase.google.com/project/fitness-app-bupe-staging/firestore`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
}

// Run the seeding
seedDatabase();
