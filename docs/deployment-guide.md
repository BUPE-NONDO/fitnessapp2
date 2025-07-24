# 🚀 FitnessApp Deployment Guide

## 📋 Overview

This guide covers deploying the FitnessApp to various hosting platforms including Firebase Hosting, Vercel, Netlify, and others.

## 🏗️ Build Process

### Prerequisites
- Node.js 18+ installed
- npm or pnpm package manager
- Firebase CLI (for Firebase deployment)

### 1. Install Dependencies
```bash
# Using npm
npm install

# Using pnpm (recommended)
pnpm install
```

### 2. Build the Application
```bash
# Build web app only
cd apps/web
npm run build

# Or build all packages
npm run build
```

The built files will be in `apps/web/dist/`

## 🔥 Firebase Hosting Deployment

### Setup Firebase CLI
```bash
# Install Firebase CLI globally
npm install -g firebase-tools

# Login to Firebase
firebase login

# Initialize project (if not already done)
firebase init hosting
```

### Deploy to Firebase
```bash
# Deploy to staging
firebase deploy --only hosting

# Deploy to production (if configured)
firebase deploy --only hosting:production
```

### Firebase Configuration
The project is already configured with:
- **Project ID**: `fitness-app-bupe-staging`
- **Hosting Directory**: `apps/web/dist`
- **Public URL**: `https://fitness-app-bupe-staging.web.app`

## ⚡ Vercel Deployment

### Option 1: Vercel CLI
```bash
# Install Vercel CLI
npm install -g vercel

# Deploy from apps/web directory
cd apps/web
vercel --prod
```

### Option 2: GitHub Integration
1. Connect your GitHub repository to Vercel
2. Set build settings:
   - **Framework**: Vite
   - **Root Directory**: `apps/web`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`

## 🌐 Netlify Deployment

### Option 1: Netlify CLI
```bash
# Install Netlify CLI
npm install -g netlify-cli

# Deploy from apps/web directory
cd apps/web
npm run build
netlify deploy --prod --dir=dist
```

### Option 2: Drag & Drop
1. Build the app: `cd apps/web && npm run build`
2. Go to [Netlify](https://netlify.com)
3. Drag the `apps/web/dist` folder to deploy

### Option 3: GitHub Integration
1. Connect repository to Netlify
2. Set build settings:
   - **Base Directory**: `apps/web`
   - **Build Command**: `npm run build`
   - **Publish Directory**: `apps/web/dist`

## 🐳 Docker Deployment

### Dockerfile
```dockerfile
# Build stage
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
COPY apps/web/package*.json ./apps/web/
RUN npm install
COPY . .
RUN cd apps/web && npm run build

# Production stage
FROM nginx:alpine
COPY --from=builder /app/apps/web/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

### Build and Run
```bash
# Build Docker image
docker build -t fitness-app .

# Run container
docker run -p 80:80 fitness-app
```

## 🔧 Environment Configuration

### Environment Variables
Create `.env` files for different environments:

**apps/web/.env.production**
```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_domain
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

### Firebase Configuration
Update `apps/web/src/lib/firebase.ts` with production config:
```typescript
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};
```

## 🚀 Quick Deploy Commands

### Firebase (Current Setup)
```bash
# 1. Build the app
cd apps/web && npm run build

# 2. Deploy to Firebase
firebase deploy --only hosting
```

### Vercel
```bash
# 1. Install and build
cd apps/web
npm install
npm run build

# 2. Deploy
npx vercel --prod
```

### Netlify
```bash
# 1. Build
cd apps/web && npm run build

# 2. Deploy
npx netlify-cli deploy --prod --dir=dist
```

## 📊 Current Deployment Status

### ✅ Ready for Deployment
- **Build System**: Vite configured and working
- **Firebase Config**: Project setup complete
- **Environment**: Production environment configured
- **Assets**: Static assets optimized
- **Routing**: SPA routing configured

### 🔧 Pre-built Application
The application is already built and ready in `apps/web/dist/`:
- `index.html` - Main HTML file
- `assets/` - Optimized CSS and JS bundles
- Static assets and images

### 🌐 Live URLs
Once deployed, the app will be available at:
- **Firebase**: `https://fitness-app-bupe-staging.web.app`
- **Custom Domain**: Configure in Firebase Hosting settings

## 🔍 Troubleshooting

### Common Issues

**Build Errors**
```bash
# Clear cache and rebuild
rm -rf node_modules dist
npm install
npm run build
```

**Firebase Deploy Issues**
```bash
# Re-authenticate
firebase logout
firebase login

# Check project
firebase projects:list
firebase use fitness-app-bupe-staging
```

**Environment Variables**
- Ensure all required environment variables are set
- Check `.env` file format and naming
- Verify Firebase configuration

### Performance Optimization
- Enable gzip compression
- Configure CDN caching
- Optimize images and assets
- Enable service worker for caching

## 📈 Monitoring & Analytics

### Firebase Analytics
- User engagement tracking
- Performance monitoring
- Error reporting

### Custom Metrics
- Goal completion rates
- User retention
- Feature usage analytics

---

## 🎯 Next Steps

1. **Deploy to Firebase Hosting** (recommended)
2. **Set up custom domain** (optional)
3. **Configure CI/CD pipeline** for automated deployments
4. **Set up monitoring** and error tracking
5. **Performance optimization** and caching

The FitnessApp is production-ready and can be deployed to any modern hosting platform! 🚀
