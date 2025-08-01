# Java Setup for Firebase Emulators

## Issue
Firebase emulators require Java to run. You're getting this error:
```
Please make sure Java is installed and on your system PATH.
```

## Quick Fix Options

### Option 1: Install Java (Recommended)
```bash
# Install Java via Homebrew (easiest on Mac)
brew install openjdk@11

# Add to PATH (add to ~/.zshrc or ~/.bash_profile)
echo 'export PATH="/opt/homebrew/opt/openjdk@11/bin:$PATH"' >> ~/.zshrc
source ~/.zshrc

# Verify installation
java -version
```

### Option 2: Test with Real Firebase (Skip Emulators)
If you don't want to install Java right now:

1. **Setup Firebase credentials**:
   ```bash
   cp .env.local.example .env.local
   # Edit .env.local with your actual Firebase project credentials
   ```

2. **Disable emulators**:
   Add to `.env.local`:
   ```
   NEXT_PUBLIC_USE_FIREBASE_EMULATOR_DISABLED=true
   ```

3. **Start testing**:
   ```bash
   npm run dev
   ```

### Option 3: Docker Alternative (Advanced)
```bash
# Use Firebase emulators in Docker (if you have Docker)
docker run --rm -p 4000:4000 -p 8080:8080 -p 9099:9099 \
  -v $(pwd):/workspace -w /workspace \
  andreysenov/firebase-tools emulators:start
```

## Testing Without Emulators

You can still test user authentication using **Option 2** above:

1. **Create real Firebase project** (free tier)
2. **Enable Authentication** in Firebase Console
3. **Add your domain** to authorized domains
4. **Get project config** and add to `.env.local`
5. **Test with real Firebase** (still free for testing)

## Benefits of Each Option

### Emulators (Requires Java):
- ✅ Completely offline testing
- ✅ No Firebase usage charges
- ✅ Isolated test environment
- ✅ Can test without internet

### Real Firebase (No Java needed):
- ✅ Production-like environment
- ✅ Google Sign-in works
- ✅ No Java installation required
- ✅ Persistent test data

## Quick Test Ready!

Once you choose an option above, you can use the testing guide in `LOCAL_USER_TESTING.md` to create and test local users immediately!