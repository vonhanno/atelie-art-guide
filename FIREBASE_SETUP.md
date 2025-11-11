# Firebase Setup Guide

This project uses Firebase Firestore as the database. Follow these steps to set up Firebase for the Atelie Art Agent project.

## Prerequisites

- Firebase project: **Atelie Art Agent** (Project ID: `atelie-art-agent`)
- Firebase CLI installed (optional, for local emulator)

## Setup Steps

### 1. Create Firebase Service Account

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: **Atelie Art Agent**
3. Navigate to **Project Settings** > **Service Accounts**
4. Click **Generate New Private Key**
5. Download the JSON file (keep it secure!)

### 2. Configure Environment Variables

**For Production Deployment (Cloud Run, App Engine, etc.):**

Use Application Default Credentials (ADC) - no service account needed in env vars:

```bash
# Firebase Configuration for Production
FIREBASE_PROJECT_ID=atelie-art-agent
```

The application will automatically use the service account attached to your Cloud Run/App Engine instance.

**For Local Development or Non-Cloud Environments:**

```bash
# Firebase Configuration
FIREBASE_PROJECT_ID=atelie-art-agent
FIREBASE_SERVICE_ACCOUNT='{"type":"service_account","project_id":"atelie-art-agent",...}'
```

**Getting Service Account JSON:**
1. Go to Firebase Console → Project Settings → Service Accounts
2. Click "Generate New Private Key"
3. Download the JSON file
4. For local dev: Copy entire JSON as a single-line string to `FIREBASE_SERVICE_ACCOUNT`
5. For production: Upload to Secret Manager or use ADC (recommended)

### 3. Initialize Firestore Database

1. In Firebase Console, go to **Firestore Database**
2. Click **Create Database**
3. Choose **Production mode** (or **Test mode** for development)
4. Select a location (choose closest to your users)
5. Click **Enable**

### 4. Set Up Firestore Security Rules (Production)

**Important:** Firebase Admin SDK bypasses security rules. These rules only apply to client SDK access.

**Copy from file (Recommended):**
1. Open the `firestore.rules` file in this project root
2. Copy ALL contents (without any backticks or markdown)
3. Go to Firebase Console → **Firestore Database** → **Rules** tab
4. Delete any existing rules
5. Paste the copied rules
6. Click **Publish**

**Manual copy (Make sure NO backticks are included):**

Go to **Firestore Database** > **Rules** and paste ONLY these lines:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /artworkAnalyses/{document} {
      allow read, write: if false;
    }
  }
}
```

**Why `if false`?** 
- Your application uses Firebase Admin SDK (server-side), which bypasses security rules
- These rules prevent unauthorized client SDK access
- All database operations are handled securely by your backend API

### 5. Create Indexes (if needed)

Firestore may require composite indexes for certain queries. If you see index errors:

1. Click the error link in the console
2. Firebase will generate the index automatically
3. Wait for index creation to complete

Common indexes needed:
- `artworkAnalyses`: `status` (ascending), `createdAt` (descending)
- `artworkAnalyses`: `artworkId` (ascending)

### 6. Verify Setup

Run the following to test the connection:

```bash
# Install dependencies
pnpm install

# The database will initialize automatically when the app starts
# Check logs for Firebase initialization messages
```

## Local Development with Firebase Emulator (Optional)

For local development without hitting production Firebase:

1. Install Firebase CLI:
   ```bash
   npm install -g firebase-tools
   ```

2. Initialize Firebase in your project:
   ```bash
   firebase init firestore
   ```

3. Start the emulator:
   ```bash
   firebase emulators:start --only firestore
   ```

4. Update `.env`:
   ```bash
   FIREBASE_EMULATOR_HOST=localhost:8080
   ```

5. Update `packages/db/index.ts` to connect to emulator when `FIREBASE_EMULATOR_HOST` is set.

## Migration from PostgreSQL

If you're migrating from PostgreSQL:

1. Export existing data from PostgreSQL
2. Convert to Firestore format
3. Import using Firebase Admin SDK or Firebase Console

Example migration script:
```typescript
import { db } from "@atelie/db";
// ... import your PostgreSQL data
// ... convert and write to Firestore
```

## Troubleshooting

### Error: "Firebase Admin initialization failed"
- Check that `FIREBASE_SERVICE_ACCOUNT` is valid JSON
- Verify the service account has Firestore permissions
- Ensure `FIREBASE_PROJECT_ID` matches your project

### Error: "Permission denied"
- Check Firestore security rules
- Verify service account has correct roles (Firebase Admin SDK Admin Service Agent)

### Error: "Index required"
- Create the required index via Firebase Console
- Or click the error link in logs to auto-create

## Production Deployment Checklist

### ✅ Pre-Deployment Steps

1. **Firestore Database**
   - ✅ Created in Production mode
   - ✅ Security rules deployed (`allow read, write: if false`)
   - ✅ Location selected (closest to users)

2. **Firebase Service Account**
   - ✅ Service account created
   - ✅ Has "Firebase Admin SDK Admin Service Agent" role
   - ✅ For Cloud Run/App Engine: Attached to instance (uses ADC)
   - ✅ For other platforms: Use Secret Manager for credentials

3. **Environment Variables**
   ```bash
   FIREBASE_PROJECT_ID=atelie-art-agent
   # For Cloud Run/App Engine: No FIREBASE_SERVICE_ACCOUNT needed (uses ADC)
   # For other platforms: Set FIREBASE_SERVICE_ACCOUNT from Secret Manager
   ```

4. **Firestore Indexes**
   - ✅ Create indexes as needed (Firebase will prompt with links)
   - Common indexes:
     - `artworkAnalyses`: `status` (ascending), `createdAt` (descending)
     - `artworkAnalyses`: `artworkId` (ascending)

### 🚀 Deployment Platforms

**Google Cloud Run / App Engine:**
- Uses Application Default Credentials automatically
- Only need `FIREBASE_PROJECT_ID` environment variable
- Service account attached to instance handles authentication

**Other Platforms (Vercel, Railway, etc.):**
- Store service account JSON in Secret Manager / Environment Secrets
- Set `FIREBASE_SERVICE_ACCOUNT` as environment variable
- Keep credentials secure - never commit to git

### 🔒 Security Notes

- ✅ Firestore rules deny all client access (`if false`)
- ✅ All database operations go through Admin SDK (server-side only)
- ✅ Service account credentials stored securely
- ✅ No client SDK access to Firestore (API handles all operations)

