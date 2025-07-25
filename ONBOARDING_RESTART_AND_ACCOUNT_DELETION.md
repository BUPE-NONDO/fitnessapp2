# Onboarding Restart & Account Deletion Implementation

## Overview
Successfully implemented the ability for users to restart their onboarding process to adjust preferences and complete account deletion functionality with proper security measures.

## ✅ **Features Implemented**

### 1. **Restart Onboarding Functionality**

#### **Service Layer (`onboardingService.ts`)**
- **`restartOnboarding(userId)`** - Resets user's onboarding status
- **Clears onboarding data** - Removes previous preferences and plans
- **Marks user as new** - Sets `isNewUser: true` for fresh experience
- **Clears localStorage** - Removes any saved progress

#### **Hook Integration (`useOnboarding.ts`)**
- **`restartOnboarding()`** function added to hook
- **Updates user profile** to reflect restart
- **Opens onboarding wizard** automatically
- **Error handling** with loading states

#### **Dashboard Integration (`ProgressDashboard.tsx`)**
- **Restart button** in welcome section for completed users
- **Confirmation dialog** before restarting
- **Loading state** during restart process
- **Settings button** for additional account management

### 2. **Account Deletion System**

#### **Account Management Service (`accountManagementService.ts`)**
- **Complete account deletion** with data cleanup
- **Reauthentication** for security (email/password or Google)
- **Firestore data deletion** across all collections
- **Audit logging** for deletion tracking
- **Data export** option before deletion

#### **Security Features:**
- **Reauthentication required** before deletion
- **Confirmation input** - user must type "DELETE"
- **Password verification** for email/password users
- **Google OAuth** reauthentication for Google users

#### **Data Cleanup:**
- **User profile** and stats deletion
- **Goals, workouts, check-ins** removal
- **Activity logs** and badges cleanup
- **User-specific collections** cleared
- **Firebase Auth user** deletion

### 3. **Account Management UI**

#### **AccountManagement Component (`AccountManagement.tsx`)**
- **Account information** display
- **Restart onboarding** action
- **Export user data** functionality
- **Sign out** option
- **Account deletion** with confirmation modal

#### **Settings Page (`SettingsPage.tsx`)**
- **Tabbed interface** (Profile, Preferences, Account)
- **Profile management** with fitness data
- **App preferences** (theme, units, notifications)
- **Privacy settings** (visibility, sharing)
- **Account management** integration

## 🔄 **Restart Onboarding Flow**

### User Experience:
1. **User clicks "Restart Onboarding"** in dashboard
2. **Confirmation dialog** appears with warning
3. **User confirms** → System resets onboarding status
4. **Onboarding wizard opens** automatically
5. **User goes through fresh onboarding** with updated preferences
6. **New plan generated** based on updated goals
7. **Dashboard updated** with new plan

### Technical Flow:
```typescript
// 1. User confirmation
const confirmed = window.confirm('Are you sure you want to restart...');

// 2. Reset onboarding status
await onboardingService.restartOnboarding(userId);

// 3. Update user profile
await updateProfile({
  onboardingCompleted: false,
  onboardingStarted: false,
  onboardingData: null,
  generatedPlan: null,
  workoutPlan: null,
  isNewUser: true,
});

// 4. Open onboarding wizard
setIsOnboardingOpen(true);
```

## 🗑️ **Account Deletion Flow**

### User Experience:
1. **User navigates to Settings** → Account tab
2. **Clicks "Delete Account"** in danger zone
3. **Confirmation modal** with warning message
4. **User types "DELETE"** to confirm
5. **Enters password** (if email/password user)
6. **System reauthenticates** user
7. **All data deleted** from Firestore
8. **Firebase Auth user deleted**
9. **User automatically signed out**

### Security Measures:
- **Reauthentication required** (recent login)
- **Explicit confirmation** (typing "DELETE")
- **Password verification** for security
- **Audit logging** for compliance
- **Data export option** before deletion

### Data Deletion Scope:
```typescript
const collectionsToDelete = [
  'users',           // User profile
  'user_stats',      // Progress statistics
  'goals',           // User goals
  'workout_sessions', // Workout history
  'check_ins',       // Check-in logs
  'user_badges',     // Earned badges
  'activity_logs',   // Activity history
  'workout_routines', // Custom routines
];
```

## 🎯 **Key Benefits**

### For Users:
- **Flexibility** - Can adjust goals and preferences anytime
- **Fresh start** - Complete onboarding reset when needed
- **Data control** - Can export data before deletion
- **Privacy** - Complete account removal when desired
- **Security** - Protected deletion process

### For Business:
- **User retention** - Users can restart instead of leaving
- **Data compliance** - GDPR/CCPA compliant deletion
- **Security** - Proper authentication for sensitive actions
- **Audit trail** - Deletion logging for compliance
- **User satisfaction** - Control over their data

## 📱 **UI Components**

### Dashboard Integration:
- **Restart Onboarding button** in welcome section
- **Settings button** for account management
- **Confirmation dialogs** for user safety

### Settings Page:
- **Tabbed interface** for organization
- **Profile management** section
- **App preferences** configuration
- **Account actions** with clear descriptions
- **Danger zone** for destructive actions

### Account Management:
- **Account information** display
- **Action cards** with descriptions
- **Export data** functionality
- **Secure deletion** with multiple confirmations

## 🔧 **Technical Implementation**

### Files Created:
- `apps/web/src/services/accountManagementService.ts`
- `apps/web/src/components/account/AccountManagement.tsx`
- `apps/web/src/components/settings/SettingsPage.tsx`

### Files Modified:
- `apps/web/src/services/onboardingService.ts` - Added restart functionality
- `apps/web/src/hooks/useOnboarding.ts` - Added restart hook
- `apps/web/src/components/dashboard/ProgressDashboard.tsx` - Added restart button

### Key Methods:
```typescript
// Restart onboarding
onboardingService.restartOnboarding(userId)
useOnboarding().restartOnboarding()

// Account deletion
AccountManagementService.deleteAccount(password)
AccountManagementService.exportUserData(userId)
```

## 🚀 **Usage Instructions**

### To Restart Onboarding:
1. **Complete initial onboarding** first
2. **Go to dashboard** and look for "Restart Onboarding" button
3. **Click and confirm** the restart
4. **Go through onboarding** with updated preferences
5. **Get new personalized plan** based on changes

### To Delete Account:
1. **Go to Settings** (⚙️ button in dashboard)
2. **Navigate to Account tab**
3. **Scroll to Danger Zone**
4. **Click "Delete Account"**
5. **Type "DELETE"** in confirmation
6. **Enter password** (if required)
7. **Confirm deletion** - account permanently removed

### To Export Data:
1. **Go to Settings** → Account tab
2. **Click "Export"** in Export Data section
3. **JSON file downloads** with all user data
4. **Save file** before account deletion if desired

## ⚠️ **Important Notes**

### Security:
- **Account deletion requires reauthentication**
- **Password verification** for email users
- **Google OAuth** for Google users
- **Audit logging** for all deletions

### Data:
- **Restart preserves account** but resets preferences
- **Deletion is permanent** and cannot be undone
- **Export available** before deletion
- **All user data removed** from Firestore

### UX:
- **Clear confirmations** for destructive actions
- **Loading states** for all operations
- **Error handling** with user-friendly messages
- **Success feedback** for completed actions

The implementation provides users with complete control over their onboarding experience and account data while maintaining security and compliance standards! 🎯
