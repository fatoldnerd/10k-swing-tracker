# Quick Local User Testing Guide

## 🚀 Fast Setup (5 minutes)

### Option 1: Real Firebase (Recommended - No Java/Emulator Issues!)

**Step 1: Firebase Setup (3 minutes)**
- Follow the detailed guide: **`REAL_FIREBASE_SETUP.md`**
- Creates real Firebase project (free tier)
- No emulator dependencies or Java issues

**Step 2: Local Setup (2 minutes)**
```bash
cp .env.local.example .env.local
# Edit .env.local with your Firebase credentials (from setup guide)
npm run dev
```

**Open**: `http://localhost:3000`

### Option 2: Firebase Emulators (If emulators work on your system)

**Terminal 1: Start Emulators**
```bash
npm run firebase:emulators
```
Wait for: `✓ All emulators ready!`

**Terminal 2: Start App**
```bash
npm run dev
```

**Note:** If emulators don't work (Java issues), use Option 1 instead!

## 🧪 Quick Test (5 minutes)

### Create Test Users
1. **User A**: 
   - Email: `test1@example.com`
   - Password: `TestPass123!`
   - Click "Create Account"

2. **User B**:
   - Logout (click user menu → Logout)
   - Email: `test2@example.com` 
   - Password: `TestPass456!`
   - Click "Create Account"

### Test User Data Isolation

#### As User A:
1. **Login** with `test1@example.com`
2. **Go to Log Workout** (`/log`)
3. **Create a test workout**:
   - Weight: 16kg
   - Exercise: Push-ups
   - Time: 25:30
   - Click "Save Workout"
4. **Check Dashboard** - should see 1 workout

#### As User B:
1. **Logout** and login with `test2@example.com`
2. **Check Dashboard** - should see 0 workouts (empty)
3. **Create different workout**:
   - Weight: 20kg
   - Exercise: Dips
   - Time: 30:15
4. **Check Dashboard** - should see 1 workout (different from User A)

#### Verify Isolation:
1. **Login back as User A** (`test1@example.com`)
2. **Check Dashboard** - should still see only User A's Push-ups workout
3. **User A should NOT see User B's Dips workout**

## ✅ Success Criteria

### Authentication Works If:
- [x] Can create new accounts
- [x] Can login with existing accounts
- [x] Can logout successfully
- [x] Redirected to landing page when not authenticated
- [x] Redirected to dashboard when authenticated

### Data Isolation Works If:
- [x] Each user sees only their own workouts
- [x] User A's data persists when switching to User B
- [x] User B cannot see User A's data
- [x] Data remains isolated across login sessions

### Session Management Works If:
- [x] Login state persists across browser refresh
- [x] Logout clears session completely
- [x] Protected routes require authentication

## 🐛 Troubleshooting

### If emulators don't start:
```bash
firebase --version  # Should show Firebase CLI
npm install -g firebase-tools  # If not installed
```

### If authentication fails:
- Check browser console for errors
- Verify emulators are running (Terminal 1)
- Try incognito/private browsing mode

### If data appears mixed between users:
- Check browser console for Firestore security rule errors
- Clear browser data/cache
- Restart emulators

## 🔍 Advanced Testing

### Test All Features:
1. **Workout Creation** (`/log`)
2. **Workout History** (`/history`) 
3. **Analytics** (`/analytics`)
4. **Achievements** (`/achievements`)
5. **Settings** (if implemented)

### Test Error Scenarios:
- Wrong password
- Invalid email format
- Network disconnection
- Empty form submission

## 📊 Expected Results

### User A Data:
- Workouts: Push-ups workout (16kg, 25:30)
- Analytics: Shows User A's progress only
- History: Shows User A's workouts only

### User B Data:
- Workouts: Dips workout (20kg, 30:15)
- Analytics: Shows User B's progress only  
- History: Shows User B's workouts only

**Total Test Time: ~10 minutes**
**Success Rate Expected: 100% if setup is correct**

---

## Next Steps After Local Testing

1. ✅ **Local testing successful** → Deploy to production
2. ❌ **Issues found** → Check `TESTING.md` for detailed troubleshooting
3. 🔧 **Need Google Auth** → Setup real Firebase credentials