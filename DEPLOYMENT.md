# Deployment Guide for Kazvan Admin Panel

## Vercel Deployment Steps

### 1. Prepare Your Project

1. Make sure all files are committed to a Git repository
2. Push your code to GitHub, GitLab, or Bitbucket

### 2. Get Firebase Credentials

From your Flutter app's `lib/firebase_options.dart`, copy these values:
- `apiKey`
- `authDomain`
- `projectId`
- `storageBucket`
- `messagingSenderId`
- `appId`

### 3. Deploy to Vercel

#### Option A: Using Vercel Dashboard

1. Go to [vercel.com](https://vercel.com)
2. Sign up/Login with GitHub
3. Click "New Project"
4. Import your repository
5. Configure project:
   - **Framework Preset**: Next.js
   - **Root Directory**: `admin-panel` (if repo is in root)
   - **Build Command**: `npm run build`
   - **Output Directory**: `.next`
6. Add Environment Variables:
   ```
   NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
   ```
7. Click "Deploy"

#### Option B: Using Vercel CLI

1. Install Vercel CLI:
   ```bash
   npm i -g vercel
   ```

2. Navigate to admin-panel directory:
   ```bash
   cd admin-panel
   ```

3. Login to Vercel:
   ```bash
   vercel login
   ```

4. Deploy:
   ```bash
   vercel
   ```

5. Add environment variables:
   ```bash
   vercel env add NEXT_PUBLIC_FIREBASE_API_KEY
   vercel env add NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
   vercel env add NEXT_PUBLIC_FIREBASE_PROJECT_ID
   vercel env add NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
   vercel env add NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID
   vercel env add NEXT_PUBLIC_FIREBASE_APP_ID
   ```

6. Redeploy:
   ```bash
   vercel --prod
   ```

## Setting Up Admin User

After deployment, you need to make a user an admin:

1. Go to Firebase Console > Firestore
2. Navigate to `users` collection
3. Find the user you want to make admin
4. Edit the document and add field:
   - Field: `isAdmin`
   - Type: `boolean`
   - Value: `true`
5. Save

## Accessing Admin Panel

1. Visit your Vercel deployment URL
2. Login with admin credentials
3. You'll be redirected to the dashboard

## Troubleshooting

### Build Fails
- Check that all environment variables are set
- Verify Firebase config values are correct
- Check build logs in Vercel dashboard

### Authentication Issues
- Ensure user has `isAdmin: true` in Firestore
- Check Firebase Auth is enabled in Firebase Console
- Verify email/password authentication is enabled

### Firestore Permission Errors
- Update Firestore security rules to allow admin access
- Check that admin user has proper permissions

## Firestore Security Rules for Admin

Add these rules to allow admin access:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Helper function to check if user is admin
    function isAdmin() {
      return request.auth != null && 
             get(/databases/$(database)/documents/users/$(request.auth.uid)).data.isAdmin == true;
    }
    
    // Admin can read/write all products
    match /products/{productId} {
      allow read: if true;
      allow write: if isAdmin();
    }
    
    // Admin can read/write all users
    match /users/{userId} {
      allow read, write: if isAdmin();
    }
    
    // Admin can read/write all reports
    match /reports/{reportId} {
      allow read, write: if isAdmin();
    }
    
    // Admin can read all bids
    match /bids/{bidId} {
      allow read: if isAdmin();
    }
  }
}
```


