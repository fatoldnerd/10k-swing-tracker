# Firebase Network Error Debug Guide

## ✅ Fixed Issues in .env.local
1. **Removed quotes** from all environment variables
2. **Fixed typo**: `NEXT_PULLIC_` → `NEXT_PUBLIC_`
3. **Enabled real Firebase**: Set emulator disabled to `true`

## 🔍 Firebase Console Checks

### 1. Project Access & Status
- [ ] Go to: https://console.firebase.google.com/project/k-swing-challenge-tracker
- [ ] Verify project is **Active** (not suspended/disabled)
- [ ] Check project **Overview** for any alerts or issues

### 2. Authentication Setup
- [ ] Go to **Authentication** → **Sign-in method**
- [ ] Verify **Email/Password** is **Enabled**
- [ ] Check **Authorized domains** includes:
  - [ ] `localhost` 
  - [ ] `k-swing-challenge-tracker.firebaseapp.com`
  - [ ] `k-swing-challenge-tracker.web.app`

### 3. API Key Restrictions
- [ ] Go to **Google Cloud Console**: https://console.cloud.google.com/
- [ ] Select project: `k-swing-challenge-tracker`
- [ ] Go to **APIs & Services** → **Credentials**
- [ ] Find your API key: `AIzaSyCOA_gwevXZFi2AKZCN-Jbpp2XWfO7JdCg`
- [ ] Click **Edit** (pencil icon)
- [ ] Check **Application restrictions**:
  - [ ] Should be **None** OR **HTTP referrers** with `localhost:*` allowed
- [ ] Check **API restrictions**:
  - [ ] Should include **Identity and Access Management (IAM) API**
  - [ ] Should include **Firebase Authentication API**

### 4. Firestore Database
- [ ] Go to **Firestore Database**
- [ ] Verify database is **created** and **active**
- [ ] Check **Rules** tab - should be in **test mode**:
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if true; // Test mode
    }
  }
}
```

## 🧪 Test Firebase Connection

### Quick Test Script
Restart your dev server with debug info:

```bash
# Stop current server (Ctrl+C)
npm run dev
```

### Check Browser Console
1. **Open browser**: http://localhost:3000
2. **Open Developer Tools** (F12)
3. **Go to Console tab**
4. **Look for Firebase messages**:
   - ✅ Should see: "Connected to real Firebase" or similar
   - ❌ Should NOT see: "network-request-failed"

### Network Tab Debug
1. **Open Network tab** in Developer Tools
2. **Try to create an account**
3. **Look for Firebase requests**:
   - Should see requests to `identitytoolkit.googleapis.com`
   - Check if they're **failing** (red) or **succeeding** (green)
   - Click on failed requests to see exact error details

## 🚨 Common Fixes

### If API Key Issues:
1. **Generate new API key** in Google Cloud Console
2. **Update .env.local** with new key
3. **Restart dev server**

### If Domain Issues:
1. **Add localhost to authorized domains** in Firebase Auth settings
2. **Wait 5-10 minutes** for changes to propagate
3. **Try in incognito mode**

### If Project Issues:
1. **Check billing** (shouldn't be needed for free tier)
2. **Verify project ownership** (you have admin access)
3. **Check project quotas** (shouldn't be exceeded)

## 🔧 Emergency Fallback

If nothing works, create a **new Firebase project**:
1. **New project**: `kettlebell-test-2024`
2. **Copy exact same setup steps**
3. **Get new credentials**
4. **Test with fresh project**

## ⚡ Quick Resolution Steps

Try these in order:
1. **Restart dev server**: `npm run dev`
2. **Clear browser cache**: Hard refresh (Ctrl+Shift+R)
3. **Try incognito mode**: Rules out browser cache issues
4. **Check Firebase status**: https://status.firebase.google.com/
5. **Test different network**: Try mobile hotspot

Expected result: **No more `auth/network-request-failed` errors**