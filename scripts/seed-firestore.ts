import { initializeApp } from 'firebase/app';
import { getFirestore, collection, doc, setDoc, Timestamp } from 'firebase/firestore';

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
    requirements: {
      type: 'streak',
      count: 7
    }
  },
  {
    id: 'goal-achiever',
    name: 'Goal Crusher',
    description: 'Achieved your first goal',
    icon: '🏆',
    category: 'achievement',
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
    requirements: {
      type: 'days_logged',
      count: 30
    }
  },
  {
    id: 'overachiever',
    name: 'Overachiever',
    description: 'Exceeded a goal by 50%',
    icon: '⭐',
    category: 'performance',
    requirements: {
      type: 'goal_exceeded',
      percentage: 150
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

async function seedDatabase() {
  try {
    console.log('🌱 Starting database seeding...');

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

    console.log('🎉 Database seeding completed successfully!');
    console.log(`📊 Seeded ${badgeDefinitions.length} badge definitions`);
    console.log('🔗 Badge definitions can be viewed at: https://console.firebase.google.com/project/fitness-app-bupe-staging/firestore');

  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
}

// Run the seeding
seedDatabase();
