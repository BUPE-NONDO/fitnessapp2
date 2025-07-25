# Complete Onboarding Flow Design

## Overview
Comprehensive 8-step onboarding process that collects user data for personalized fitness plan generation.

## Progress Indicator
```
Step 1/8 ●○○○○○○○ Personal Info
Step 2/8 ●●○○○○○○ Fitness Goals  
Step 3/8 ●●●○○○○○ Fitness Level
Step 4/8 ●●●●○○○○ Preferences
Step 5/8 ●●●●●○○○ Time Commitment
Step 6/8 ●●●●●●○○ Activities
Step 7/8 ●●●●●●●○ Summary
Step 8/8 ●●●●●●●● Plan Generation
```

## Step-by-Step Design

### Step 1: Personal Information
```
Tell us about yourself

┌─────────────────────────────────┐
│ Full Name                       │
└─────────────────────────────────┘
┌─────────────────────────────────┐
│ Age                            │
└─────────────────────────────────┘
┌─────────────────────────────────┐
│ Gender                         │
│ ○ Male  ○ Female  ○ Other      │
└─────────────────────────────────┘
┌─────────────────────────────────┐
│ Weight (lbs/kg)                │
└─────────────────────────────────┘
┌─────────────────────────────────┐
│ Height (ft/cm)                 │
└─────────────────────────────────┘

[Continue]
```

### Step 2: Fitness Goal Selection
```
What's your main fitness goal?

┌─────────────────────────────────┐
│ 🔥 Lose Weight                  │
│ Burn fat and get lean          │
└─────────────────────────────────┘
┌─────────────────────────────────┐
│ 💪 Gain Muscle                  │
│ Build strength and size        │
└─────────────────────────────────┘
┌─────────────────────────────────┐
│ 🏃 Improve Endurance            │
│ Boost cardiovascular fitness   │
└─────────────────────────────────┘
┌─────────────────────────────────┐
│ ⚖️ General Fitness              │
│ Overall health and wellness    │
└─────────────────────────────────┘
┌─────────────────────────────────┐
│ 🎯 Tone & Define                │
│ Sculpt and define muscles      │
└─────────────────────────────────┘

[Back] [Continue]
```

### Step 3: Current Fitness Level
```
What's your current fitness level?

┌─────────────────────────────────┐
│ 🌱 Beginner                     │
│ New to regular exercise         │
│ • 0-6 months experience         │
└─────────────────────────────────┘
┌─────────────────────────────────┐
│ 🚀 Intermediate                 │
│ Some exercise experience        │
│ • 6 months - 2 years           │
└─────────────────────────────────┘
┌─────────────────────────────────┐
│ 💎 Advanced                     │
│ Regular exercise routine        │
│ • 2+ years experience          │
└─────────────────────────────────┘

[Back] [Continue]
```

### Step 4: Workout Preferences
```
Where do you prefer to work out?

Location:
☐ Home (bodyweight, minimal equipment)
☐ Gym (full equipment access)
☐ Outdoor (parks, running trails)

Equipment Access:
☐ No equipment
☐ Basic (dumbbells, resistance bands)
☐ Full gym equipment

Workout Types (select all that apply):
☐ Cardio
☐ Strength Training
☐ Yoga
☐ HIIT
☐ Pilates
☐ Swimming
☐ Running
☐ Cycling

[Back] [Continue]
```

### Step 5: Time Commitment
```
How much time can you commit?

Days per week:
○ 2-3 days  ○ 4-5 days  ○ 6-7 days

Session duration:
○ 15-30 minutes
○ 30-45 minutes  
○ 45-60 minutes
○ 60+ minutes

Best workout times:
☐ Early morning (6-9 AM)
☐ Late morning (9-12 PM)
☐ Afternoon (12-5 PM)
☐ Evening (5-8 PM)
☐ Night (8+ PM)

[Back] [Continue]
```

### Step 6: Activity Preferences
```
Any special interests?

☐ Meditation & Mindfulness
☐ High-Intensity Interval Training
☐ Stretching & Flexibility
☐ Dance Workouts
☐ Martial Arts
☐ Rock Climbing
☐ Swimming
☐ Team Sports

Injury considerations:
☐ No current injuries
☐ Back issues
☐ Knee problems
☐ Shoulder issues
☐ Other: ___________

[Back] [Continue]
```

### Step 7: Summary Screen
```
Let's review your profile

Personal Info:
• Sarah, 28, Female
• 140 lbs, 5'6"

Goals:
• Primary: Lose Weight
• Level: Intermediate

Preferences:
• Location: Home + Gym
• Equipment: Basic
• Types: Cardio, Strength, HIIT

Schedule:
• 4-5 days per week
• 30-45 minutes per session
• Preferred: Evening workouts

[Edit] [Generate My Plan]
```

### Step 8: Plan Generation
```
Creating your personalized plan...

🧠 Analyzing your profile
📊 Calculating optimal workouts  
🎯 Customizing for your goals
💪 Building your routine

[Progress Animation]

Almost ready! This will take just a moment.
```

## Technical Implementation
- Enhance existing `PersonalizedOnboardingFunnel.tsx`
- Add new step components for missing functionality
- Implement data validation with Zod schemas
- Add progress persistence (localStorage backup)
- Smooth animations between steps
- Mobile-responsive design
