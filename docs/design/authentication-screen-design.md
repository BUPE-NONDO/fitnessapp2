# Authentication Screen Design

## Overview
Streamlined authentication with multiple sign-in options and clear user experience.

## Design Specifications

### Layout Structure
```
[Back Arrow] FitnessApp [Skip]

Welcome Back! / Join FitnessApp
Ready to start your fitness journey?

┌─────────────────────────────────┐
│  📧 Continue with Email         │
└─────────────────────────────────┘

┌─────────────────────────────────┐
│  🔍 Continue with Google        │
└─────────────────────────────────┘

┌─────────────────────────────────┐
│  🍎 Continue with Apple         │
└─────────────────────────────────┘

────── or ──────

Email Form (if email option selected)
┌─────────────────────────────────┐
│ Email Address                   │
└─────────────────────────────────┘
┌─────────────────────────────────┐
│ Password                        │
└─────────────────────────────────┘
┌─────────────────────────────────┐
│ Full Name (Sign Up only)        │
└─────────────────────────────────┘

[Continue Button]

Already have an account? Sign In
Don't have an account? Sign Up
```

### Enhanced Features
- **Social Authentication Priority**: Google and Apple prominently displayed
- **Progressive Disclosure**: Email form appears only when email option selected
- **Smart Validation**: Real-time email/password validation
- **Loading States**: Clear feedback during authentication
- **Error Handling**: User-friendly error messages

### Technical Implementation
- Enhance existing `LoginForm.tsx` and `GoogleSignInButton.tsx`
- Add Apple Sign-In integration (using Firebase Auth)
- Implement form validation with Zod schemas
- Add loading animations and error states
- Support for password reset flow

### Security Features
- Password strength indicator
- Email verification flow
- Rate limiting for failed attempts
- Secure token handling

## User Flow
1. **Email Option** → Show email form → Validate → Authenticate
2. **Google Sign-In** → OAuth popup → Profile creation if new user
3. **Apple Sign-In** → OAuth flow → Profile creation if new user
4. **Success** → Navigate to Personal Information step
