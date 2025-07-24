const { initializeApp } = require('firebase/app');
const { getFirestore, collection, doc, setDoc, addDoc, updateDoc, getDocs, query, where, Timestamp } = require('firebase/firestore');

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
  { title: 'Plank Hold', metric: 'duration', target: 2, frequency: 'daily', description: 'Core strength building' },
  { title: 'Water Intake', metric: 'count', target: 8, frequency: 'daily', description: 'Glasses of water per day' },
  { title: 'Sleep Hours', metric: 'duration', target: 8, frequency: 'daily', description: 'Quality sleep time' }
];

// Helper functions
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

function getRandomNotes() {
  const notes = [
    'Great workout!',
    'Feeling strong today',
    'Pushed through the challenge',
    'New personal best!',
    'Steady progress',
    'Challenging but rewarding',
    'Perfect weather for this',
    'Exceeded my expectations',
    'Tough but worth it',
    'Feeling energized',
    'Good form today',
    'Consistent effort',
    '',
    '',
    '' // Empty notes are common
  ];
  return getRandomElement(notes);
}

async function seedAdvancedData() {
  try {
    console.log('🚀 Starting advanced data seeding (goals and logs)...');

    // Get all users
    const usersSnapshot = await getDocs(collection(db, 'users'));
    const users = usersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    
    if (users.length === 0) {
      console.log('❌ No users found. Please run basic seeding first.');
      process.exit(1);
    }

    console.log(`👥 Found ${users.length} users`);

    let totalGoals = 0;
    let totalLogs = 0;

    // Seed goals and logs for each user
    for (const user of users) {
      console.log(`\n🎯 Creating goals for ${user.displayName}...`);
      
      // Create 3-6 goals per user
      const numGoals = 3 + Math.floor(Math.random() * 4);
      const userGoals = [];
      
      // Select random goal templates
      const selectedTemplates = [];
      while (selectedTemplates.length < numGoals) {
        const template = getRandomElement(goalTemplates);
        if (!selectedTemplates.find(t => t.title === template.title)) {
          selectedTemplates.push(template);
        }
      }
      
      for (const template of selectedTemplates) {
        const createdDate = getRandomDate(new Date(2024, 6, 1), new Date());
        
        const goalData = {
          userId: user.id,
          title: template.title,
          description: template.description,
          metric: template.metric,
          target: template.target,
          frequency: template.frequency,
          isActive: Math.random() > 0.15, // 85% chance of being active
          createdAt: Timestamp.fromDate(createdDate),
          updatedAt: Timestamp.now()
        };

        const goalRef = await addDoc(collection(db, 'goals'), goalData);
        userGoals.push({ id: goalRef.id, ...goalData, createdDate });
        totalGoals++;
        console.log(`  ✅ Created goal: ${template.title}`);
      }

      // Create logs for each goal
      console.log(`📝 Creating activity logs for ${user.displayName}...`);
      let userTotalLogs = 0;
      
      for (const goal of userGoals) {
        const startDate = goal.createdDate;
        const endDate = new Date();
        const daysDiff = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24));
        
        // Create logs for random days (50-90% of days based on goal frequency)
        let logFrequency;
        switch (goal.frequency) {
          case 'daily':
            logFrequency = 0.6 + Math.random() * 0.3; // 60-90%
            break;
          case 'weekly':
            logFrequency = 0.3 + Math.random() * 0.4; // 30-70%
            break;
          case 'monthly':
            logFrequency = 0.2 + Math.random() * 0.3; // 20-50%
            break;
          default:
            logFrequency = 0.5;
        }
        
        const numLogs = Math.floor(daysDiff * logFrequency);
        
        // Generate logs with realistic patterns
        const logDates = [];
        for (let i = 0; i < numLogs; i++) {
          logDates.push(getRandomDate(startDate, endDate));
        }
        logDates.sort((a, b) => a - b); // Sort chronologically
        
        for (const logDate of logDates) {
          const value = generateRealisticValue(goal.metric, goal.target);
          const notes = getRandomNotes();
          
          const logData = {
            userId: user.id,
            goalId: goal.id,
            date: Timestamp.fromDate(logDate),
            value: value,
            notes: notes,
            createdAt: Timestamp.fromDate(logDate),
            updatedAt: Timestamp.fromDate(logDate)
          };

          await addDoc(collection(db, 'logs'), logData);
          totalLogs++;
          userTotalLogs++;
        }
        
        console.log(`    📊 Created ${numLogs} logs for ${goal.title}`);
      }

      // Update user stats
      const activeGoals = userGoals.filter(g => g.isActive).length;
      const streakDays = Math.floor(Math.random() * 45); // Random streak up to 45 days
      
      await updateDoc(doc(db, 'users', user.id), {
        'stats.totalGoals': userGoals.length,
        'stats.activeGoals': activeGoals,
        'stats.totalLogs': userTotalLogs,
        'stats.streakDays': streakDays,
        updatedAt: Timestamp.now()
      });
      
      console.log(`  📈 Updated stats: ${userGoals.length} goals, ${userTotalLogs} logs, ${streakDays} day streak`);
    }

    console.log('\n🎉 Advanced seeding completed successfully!');
    console.log(`📊 Final Summary:`);
    console.log(`  👥 Users processed: ${users.length}`);
    console.log(`  🎯 Total goals created: ${totalGoals}`);
    console.log(`  📝 Total logs created: ${totalLogs}`);
    console.log(`  📈 Average goals per user: ${Math.round(totalGoals / users.length)}`);
    console.log(`  📊 Average logs per user: ${Math.round(totalLogs / users.length)}`);
    console.log(`🔗 View data at: https://console.firebase.google.com/project/fitness-app-bupe-staging/firestore`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Error in advanced seeding:', error);
    process.exit(1);
  }
}

// Run the advanced seeding
seedAdvancedData();
