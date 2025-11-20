# Quick Setup Guide

## 1. Install Dependencies

```bash
npm install
```

## 2. Configure Environment Variables

Create a `.env` file in the root directory:

```env
VITE_API_BASE_URL=http://localhost:8002
VITE_FIREBASE_API_KEY=your-api-key-here
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
VITE_FIREBASE_APP_ID=your-app-id
```

### Getting Firebase Credentials

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project (or create a new one)
3. Go to Project Settings (gear icon)
4. Scroll down to "Your apps" section
5. Click on the web app icon (`</>`) or create a new web app
6. Copy the configuration values to your `.env` file

## 3. Enable Firebase Authentication

1. In Firebase Console, go to **Authentication**
2. Click **Get Started**
3. Enable **Email/Password** provider
4. (Optional) Enable **Phone** provider for MFA

## 4. Start Development Server

```bash
npm run dev
```

The app will be available at `http://localhost:5173` (or the port shown in terminal).

## 5. Start Backend API

Make sure your FastAPI backend is running on `http://localhost:8002` (or update `VITE_API_BASE_URL` in `.env`).

## Troubleshooting

### "Firebase: Error (auth/configuration-not-found)"
- Check that all Firebase environment variables are set correctly
- Verify the values match your Firebase project settings

### "Network error" or CORS issues
- Ensure the backend API is running
- Check that `VITE_API_BASE_URL` is correct
- Verify backend CORS settings allow requests from your frontend URL

### "Failed to login" or authentication errors
- Check Firebase Authentication is enabled in Firebase Console
- Verify email/password provider is enabled
- Check browser console for detailed error messages

## Next Steps

1. Create a test account by clicking "Sign up" on the login page
2. Explore the chat interface
3. (Admin only) Try agent mode for RAG-powered queries
4. Add data sources in the Data Sources tab
5. Configure MFA in Settings



