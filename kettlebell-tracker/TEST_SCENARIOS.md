# Authentication Test Scenarios

## Quick Test Scenarios

### Scenario 1: New User Registration (Email/Password)
1. **Navigate** to landing page
2. **Click** "Create Account" or toggle to signup form
3. **Enter** email: `test1@example.com`, password: `TestPass123`
4. **Submit** form
5. **Expected**: User is created and redirected to dashboard
6. **Verify**: Navigation shows user email, dashboard loads

### Scenario 2: Existing User Login
1. **Navigate** to landing page (logout if needed)
2. **Enter** credentials from Scenario 1
3. **Click** "Sign In"
4. **Expected**: User is authenticated and sees dashboard
5. **Verify**: Same dashboard state as before

### Scenario 3: Google Authentication
1. **Navigate** to landing page
2. **Click** "Continue with Google"
3. **Complete** Google OAuth flow
4. **Expected**: User is authenticated and redirected to dashboard
5. **Note**: Requires real Firebase (won't work with emulators)

### Scenario 4: Route Protection
1. **Logout** if authenticated
2. **Try accessing** `localhost:3000/workout` directly
3. **Expected**: Redirected to landing page
4. **Login** and try again
5. **Expected**: Access granted to workout page

### Scenario 5: User Data Isolation
1. **Login** as User A, create a test workout
2. **Logout** and create User B account
3. **Check** User B doesn't see User A's workout
4. **Login** back as User A
5. **Verify** User A's workout is still there

### Scenario 6: Session Persistence
1. **Login** to the app
2. **Refresh** the browser page
3. **Expected**: Still logged in, no redirect to landing
4. **Close** browser tab and reopen
5. **Expected**: Still logged in

## Error Scenarios to Test

### Invalid Credentials
- **Test**: Wrong password for existing user
- **Expected**: Error message displayed
- **Test**: Login with non-existent email
- **Expected**: Appropriate error message

### Network Issues
- **Test**: Disconnect internet while signing up
- **Expected**: Graceful error handling
- **Test**: Slow network simulation
- **Expected**: Loading states shown

### Form Validation
- **Test**: Submit empty email field
- **Expected**: Validation error
- **Test**: Submit weak password
- **Expected**: Password requirements shown
- **Test**: Submit invalid email format
- **Expected**: Email format error

## Performance Test Scenarios

### Load Testing
1. **Build** production version: `npm run build`
2. **Start** production server: `npm run start`
3. **Test** authentication flows in production mode
4. **Verify** performance is acceptable

### Browser Compatibility
- **Test** in Chrome, Firefox, Safari, Edge
- **Test** on mobile devices
- **Verify** authentication works consistently

## Data Integrity Tests

### User-Specific Data
1. **Create** User A with some workouts and settings
2. **Create** User B with different data
3. **Switch** between users multiple times
4. **Verify** each user only sees their own data
5. **Check** Firestore console to confirm data separation

### Security Rules Validation
1. **Open** browser developer tools
2. **Attempt** to access another user's data programmatically
3. **Expected**: Firebase security rules block unauthorized access
4. **Check** console for security rule errors

## Quick Smoke Test (5 minutes)

Use this for rapid validation:

1. ✅ **Landing page loads**
2. ✅ **Can create account**
3. ✅ **Can login**
4. ✅ **Dashboard loads after auth**
5. ✅ **Can logout**
6. ✅ **Protected routes work**
7. ✅ **Can create test workout**
8. ✅ **User data persists**

## Test Data

### Test User Accounts
- **User A**: `testuser1@example.com` / `TestPass123!`
- **User B**: `testuser2@example.com` / `TestPass456!`
- **User C**: `testuser3@example.com` / `TestPass789!`

### Test Workout Data
```javascript
// Sample workout for testing
{
  date: new Date(),
  strengthExercise: 'Push-ups',
  kettlebellWeight: 16,
  totalTimeMinutes: 25,
  totalTimeSeconds: 30,
  completed: true,
  notes: 'Test workout for user isolation'
}
```

## Troubleshooting Common Issues

### "Mock Firebase Configuration" Warning
- **Solution**: Check `.env.local` file exists and has correct values
- **Alternative**: Use emulators for testing

### Google Sign-in Popup Blocked
- **Solution**: Allow popups for localhost in browser settings
- **Alternative**: Test with incognito/private mode

### Emulator Connection Failed
- **Solution**: Ensure Firebase CLI is installed and emulators are running
- **Check**: Firebase console for proper project setup

### TypeScript Errors
- **Solution**: Run `npm run type-check` to identify issues
- **Fix**: Update type definitions or fix type mismatches

## Success Criteria

### ✅ Authentication System is Ready When:
- All test scenarios pass
- No TypeScript build errors
- Security rules are properly configured
- User data is properly isolated
- Session management works correctly
- Error handling is graceful
- Performance is acceptable

### 🚀 Ready for Deployment When:
- All smoke tests pass
- Production build works
- Firebase security rules deployed
- Environment variables configured
- Google OAuth domain authorized
- All team members can successfully test