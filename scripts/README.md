# 🌱 Database Seeding Scripts

This directory contains scripts for seeding the FitnessApp database with sample data for development, testing, and demonstration purposes.

## 📋 Available Scripts

### Basic Seeding
```bash
npm run seed:basic
```
- Seeds badge definitions and system metadata
- Creates 3 demo users with realistic profiles
- Sets up the foundation for the application

### Advanced Seeding
```bash
npm run seed:advanced
```
- **Requires basic seeding to be run first**
- Creates 3-6 realistic goals per user
- Generates hundreds of activity logs with realistic patterns
- Updates user statistics based on generated data

### Full Seeding
```bash
npm run seed:full
```
- Runs both basic and advanced seeding in sequence
- Complete database population for demonstration

### Development Seeding
```bash
npm run seed:dev
```
- Lightweight seeding for development environment
- Creates test users with known credentials
- Supports Firestore emulator
- Minimal but functional dataset

### Database Reset
```bash
npm run db:reset --confirm
```
- Clears all user data, goals, and logs
- Preserves system data (badge definitions, metadata)
- **Requires confirmation flag for safety**

## 🎯 Seeding Data Overview

### Users Created
- **Alex Johnson** (alex.fitness@example.com) - Metric units, light theme
- **Sarah Chen** (sarah.runner@example.com) - Imperial units, dark theme  
- **Mike Rodriguez** (mike.lifter@example.com) - Metric units, system theme

### Goal Types
- **Cardio**: Running, cycling, swimming
- **Strength**: Push-ups, squats, weight training
- **Wellness**: Meditation, yoga, sleep tracking
- **Daily Habits**: Water intake, step counting

### Activity Patterns
- **Realistic variance**: ±30% from target values
- **Frequency-based logging**: Daily goals logged 60-90% of days
- **Chronological progression**: Logs distributed over time since goal creation
- **Motivational notes**: Random encouraging comments

### Badge System
- **Milestone badges**: First goal, first log, achievements
- **Streak badges**: Consistency tracking
- **Performance badges**: Exceeding targets

## 🛠️ Development Usage

### For Local Development
```bash
# Start with fresh database
npm run db:reset:confirm

# Seed development data
npm run seed:dev

# Or for full demo data
npm run seed:full
```

### For Testing
```bash
# Reset before each test suite
npm run db:reset:confirm

# Seed minimal test data
npm run seed:basic
```

### For Demos
```bash
# Full realistic dataset
npm run seed:full
```

## 🔧 Configuration

### Environment Variables
- `NODE_ENV=development` - Enables emulator connection for dev seeding
- Use `--emulator` flag to force emulator connection

### Firebase Configuration
- Production scripts use real Firebase project credentials
- Development script can connect to local emulator
- All scripts respect Firebase security rules

## 📊 Data Statistics

After running `npm run seed:full`:
- **Users**: 3 realistic profiles
- **Goals**: 9-18 diverse fitness goals
- **Logs**: 200-500 activity entries
- **Time Range**: Data spanning 6+ months
- **Completion Rate**: 60-90% realistic logging frequency

## 🔒 Security Notes

- Scripts use Firebase Admin SDK patterns
- All data respects Firestore security rules
- User isolation maintained (users can only see their own data)
- No authentication bypass - follows proper data ownership

## 🚀 Production Considerations

- **Never run seeding scripts on production databases**
- Use `db:reset` with extreme caution
- Badge definitions and metadata are preserved during resets
- Consider backup before running any destructive operations

## 📝 Customization

### Adding New Goal Templates
Edit `goalTemplates` array in seeding scripts:
```javascript
{
  title: 'Custom Goal',
  metric: 'count|duration|distance|weight',
  target: 50,
  frequency: 'daily|weekly|monthly',
  description: 'Goal description'
}
```

### Modifying User Profiles
Edit `dummyUsers` array to add/modify test users:
```javascript
{
  uid: 'unique-id',
  email: 'user@example.com',
  displayName: 'User Name',
  preferences: { theme: 'light', units: 'metric', notifications: true }
}
```

### Adjusting Data Patterns
- Modify `logFrequency` for different completion rates
- Adjust `variance` for more/less realistic value spread
- Change date ranges for different time spans

## 🐛 Troubleshooting

### Common Issues
1. **"No users found"** - Run basic seeding first
2. **Permission denied** - Check Firebase project configuration
3. **Emulator connection failed** - Ensure emulator is running on port 8080

### Debug Mode
Add console logging to scripts for detailed execution info:
```javascript
console.log('Debug:', { goalData, logData });
```

## 📈 Performance

- Basic seeding: ~10 seconds
- Advanced seeding: ~30-60 seconds (depends on log volume)
- Full seeding: ~60-90 seconds total
- Reset operation: ~5-15 seconds

Seeding performance scales with the amount of historical data generated.
