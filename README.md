# Kazvan Admin Panel

Web-based admin panel for Kazvan marketplace application.

## Features

- 📊 **Dashboard**: Statistics and analytics
- 📦 **Product Management**: Approve, reject, edit, delete products
- 👥 **User Management**: View users, manage accounts, ban/unban
- 🚨 **Reports Management**: Handle reported products
- 💰 **Bid Management**: View and manage bids
- 🔔 **Notifications**: Send notifications to users

## Tech Stack

- **Framework**: Next.js 14 (React)
- **Styling**: Tailwind CSS
- **Database**: Firebase Firestore
- **Authentication**: Firebase Auth
- **Deployment**: Vercel

## Setup Instructions

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Configure Firebase**
   - Copy your Firebase config from the Flutter app
   - Update `lib/firebase/config.ts` with your Firebase credentials

3. **Set Environment Variables**
   Create a `.env.local` file:
   ```env
   NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
   ```

4. **Run Development Server**
   ```bash
   npm run dev
   ```

5. **Build for Production**
   ```bash
   npm run build
   ```

## Deployment on Vercel

1. Push this folder to a GitHub repository
2. Import the project in Vercel
3. Add environment variables in Vercel dashboard
4. Deploy!

## Admin Access

To make a user admin:
1. Go to Firebase Console > Firestore
2. Find the user document in `users` collection
3. Add field: `isAdmin: true`

## Project Structure

```
admin-panel/
├── app/                 # Next.js app directory
│   ├── dashboard/       # Dashboard page
│   ├── products/        # Product management
│   ├── users/           # User management
│   ├── reports/         # Reports management
│   └── layout.tsx       # Root layout
├── components/          # React components
├── lib/                 # Utilities and Firebase config
├── hooks/               # Custom React hooks
└── types/               # TypeScript types
```


