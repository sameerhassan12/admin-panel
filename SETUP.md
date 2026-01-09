# Setup Instructions

## Quick Start

1. **Install Dependencies**
   ```bash
   cd admin-panel
   npm install
   ```

2. **Configure Environment Variables**
   
   Create a `.env.local` file in the `admin-panel` directory:
   ```env
   NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyDiBX_-Uw4in7JiTl43kHhx2T49WRKYLfw
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=kazvan-d195c.firebaseapp.com
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=kazvan-d195c
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=kazvan-d195c.firebasestorage.app
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=528654827500
   NEXT_PUBLIC_FIREBASE_APP_ID=1:528654827500:web:343445896d2d55c38bcac9
   ```

3. **Run Development Server**
   ```bash
   npm run dev
   ```

4. **Open Browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## Making a User Admin

1. Go to Firebase Console: https://console.firebase.google.com
2. Select your project: `kazvan-d195c`
3. Go to Firestore Database
4. Navigate to `users` collection
5. Find the user you want to make admin
6. Click on the document
7. Click "Add field"
8. Field name: `isAdmin`
9. Field type: `boolean`
10. Value: `true`
11. Save

## Features

- ✅ Dashboard with statistics
- ✅ Product management (approve/reject/delete)
- ✅ User management (ban/unban, make admin)
- ✅ Reports management
- ✅ Bids viewing
- ✅ Responsive design
- ✅ Secure admin authentication

## Tech Stack

- **Next.js 14** - React framework
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **Firebase** - Backend (same as Flutter app)
- **Lucide React** - Icons


