# Google Play Console Data Safety Form - Exact Answers

## Complete Form Answers for Quillby App

---

## Section 1: Data Collection

### Question: Does your app collect or share any of the required user data types?
**Answer: YES**

---

## Section 2: Data Encryption

### Question: Is all of the user data collected by your app encrypted in transit?
**Answer: YES**

**Explanation**: 
- All data transmitted between the app and backend uses HTTPS/TLS encryption
- Supabase API calls use encrypted connections
- RevenueCat payment data uses encrypted connections
- No unencrypted data transmission occurs

---

## Section 3: Account Creation

### Question: Which of the following methods of account creation does your app support?
**Answer: My app does not allow users to create an account**

**Explanation**:
- Quillby uses device-based authentication
- No traditional username/password accounts
- No email/phone registration required
- Users are automatically authenticated via device ID
- Data is synced using anonymous device identifier

**Alternative Answer (if you want to describe the system):**
If forced to select an option, choose:
- ☑️ **Other**
- **Description**: "Device-based authentication - Users are automatically authenticated using a secure device identifier. No username, password, or email required. Each device gets a unique anonymous ID for data synchronization."

---

## Section 4: Account Deletion

### Question: Add a link that users can use to request that their account and associated data is deleted

**Answer Options:**

#### Option 1: Create a dedicated deletion page
**URL**: `https://quillby.app/delete-account`

**Page Content Should Include**:
```
Account Deletion Request - Quillby

To delete your Quillby account and all associated data:

1. In-App Method (Recommended):
   - Open Quillby app
   - Go to Settings → Account
   - Tap "Delete Account"
   - Confirm deletion
   - All data will be permanently deleted immediately

2. Email Request:
   - Send email to: privacy@quillby.app
   - Subject: "Account Deletion Request"
   - Include: Your device ID (found in Settings → About)
   - We will process your request within 30 days

Data Deleted:
- All personal information (name, preferences)
- All habit tracking data (sleep, meals, exercise, water)
- All focus session history
- All achievements and progress
- All shop purchases and customizations
- Device authentication tokens

Data Retained:
- Aggregated anonymous analytics (if any) - NO PERSONAL DATA
- Purchase transaction records (required by law for 7 years, anonymized)

Retention Period:
- Personal data: Deleted immediately upon request
- Transaction records: Anonymized and retained for legal compliance only

For questions: privacy@quillby.app
```

#### Option 2: Use support email directly
**URL**: `mailto:privacy@quillby.app?subject=Account%20Deletion%20Request`

**Note**: This is less ideal but acceptable if you don't have a website yet.

---

### Question: Do you provide a way for users to request that some or all of their data is deleted, without requiring them to delete their account?

**Answer: YES**

**Explanation**:
Users can selectively delete data in-app:
- Clear focus session history
- Reset achievements
- Clear habit tracking data
- Remove customizations
- All while keeping their account active

**Implementation Required**:
Add these options to Settings screen:
- "Clear Session History"
- "Reset Progress"
- "Clear Habit Data"
- "Reset Customizations"

---

## Section 5: Additional Badges

### Independent Security Review
**Answer: No** (not applicable for initial launch)

**Future Consideration**: 
- Consider after 100K+ users
- Cost: $5,000-$15,000
- Providers: ioXt, App Defense Alliance

### UPI Payments Verified
**Answer: No** (not applicable)

**Reason**: App uses Google Play billing, not UPI

---

## Complete Data Types Declaration

### Personal Information

#### Name
- ✅ **Collected**: YES
- **Optional**: YES
- **Purpose**: App functionality (personalization)
- **Shared**: NO
- **Ephemeral**: NO
- **Required**: NO
- **User can request deletion**: YES

#### Email Address
- ✅ **Collected**: YES
- **Optional**: YES
- **Purpose**: Developer communications (feedback only)
- **Shared**: NO
- **Ephemeral**: NO
- **Required**: NO
- **User can request deletion**: YES

---

### Health and Fitness

#### Health Info
- ✅ **Collected**: YES
- **Data**: Sleep, meals, water intake, weight goals
- **Optional**: YES (users can disable habits)
- **Purpose**: App functionality
- **Shared**: NO
- **Ephemeral**: NO
- **Required**: NO
- **User can request deletion**: YES

#### Fitness Info
- ✅ **Collected**: YES
- **Data**: Exercise duration, frequency, goals
- **Optional**: YES
- **Purpose**: App functionality
- **Shared**: NO
- **Ephemeral**: NO
- **Required**: NO
- **User can request deletion**: YES

---

### App Activity

#### App Interactions
- ✅ **Collected**: YES
- **Data**: Focus sessions, study time, achievements, streaks
- **Optional**: NO (core functionality)
- **Purpose**: App functionality
- **Shared**: NO
- **Ephemeral**: NO
- **Required**: YES
- **User can request deletion**: YES

---

### Device or Other IDs

#### Device ID
- ✅ **Collected**: YES
- **Data**: Anonymous device identifier
- **Optional**: NO (required for sync)
- **Purpose**: App functionality, authentication
- **Shared**: YES (with Supabase, RevenueCat)
- **Ephemeral**: NO
- **Required**: YES
- **User can request deletion**: YES

---

### Location

#### Approximate Location
- ✅ **Collected**: YES
- **Data**: Country, timezone
- **Optional**: YES
- **Purpose**: App functionality (time-based features)
- **Shared**: NO
- **Ephemeral**: NO
- **Required**: NO
- **User can request deletion**: YES

---

### Financial Info

#### Purchase History
- ✅ **Collected**: YES
- **Data**: In-app purchases, subscriptions
- **Optional**: YES (only if user makes purchases)
- **Purpose**: App functionality
- **Shared**: YES (with RevenueCat)
- **Ephemeral**: NO
- **Required**: NO (only for premium features)
- **User can request deletion**: YES (anonymized after 7 years for legal compliance)

---

## Data Sharing Details

### Third-Party Services

#### RevenueCat
- **Purpose**: Payment processing
- **Data Shared**: Device ID, purchase history
- **Privacy Policy**: https://www.revenuecat.com/privacy

#### Supabase
- **Purpose**: Data storage and sync
- **Data Shared**: All user data
- **Privacy Policy**: https://supabase.com/privacy

---

## Privacy Policy Requirements

### Must Include:
1. ✅ What data is collected
2. ✅ Why data is collected
3. ✅ How data is used
4. ✅ How data is shared
5. ✅ How users can delete data
6. ✅ Contact information
7. ✅ Children's privacy (13+)
8. ✅ Data retention period
9. ✅ Security measures
10. ✅ Changes to policy

### Privacy Policy URL
**Required**: Must be hosted and accessible
**Recommended URL**: `https://quillby.app/privacy`

**Temporary Solution** (if no website):
- Host on GitHub Pages
- Use Google Sites (free)
- Use privacy policy generator + hosting service

---

## Implementation Checklist

### Before Submission:
- [ ] Create privacy policy page
- [ ] Host privacy policy at accessible URL
- [ ] Create account deletion page or email
- [ ] Implement in-app account deletion
- [ ] Implement selective data deletion
- [ ] Test all deletion mechanisms
- [ ] Verify HTTPS encryption on all endpoints
- [ ] Review all third-party SDKs
- [ ] Complete data safety form accurately
- [ ] Add privacy policy link to app
- [ ] Add privacy policy link to Play Store listing

### In-App Requirements:
- [ ] Settings → Privacy → View Privacy Policy
- [ ] Settings → Account → Delete Account
- [ ] Settings → Data → Clear Specific Data
- [ ] Settings → About → Show Device ID
- [ ] Onboarding → Privacy disclosure
- [ ] First launch → Data collection consent

---

## Sample Privacy Policy Structure

```markdown
# Quillby Privacy Policy

Last Updated: [Date]

## Introduction
Quillby ("we", "our", "us") respects your privacy...

## Information We Collect
1. Personal Information (optional)
   - Name
   - Email (for feedback only)

2. Health & Fitness Data
   - Sleep tracking
   - Meal logging
   - Water intake
   - Exercise tracking

3. App Usage Data
   - Focus sessions
   - Study time
   - Achievements
   - Streaks

4. Device Information
   - Anonymous device ID
   - Country and timezone

5. Purchase Information
   - In-app purchases
   - Subscription status

## How We Use Your Information
- Provide app functionality
- Sync data across devices
- Process payments
- Improve user experience
- Respond to feedback

## Data Sharing
We share data with:
- Supabase (data storage)
- RevenueCat (payment processing)

We DO NOT:
- Sell your data
- Use data for advertising
- Share with advertisers
- Track for analytics

## Data Security
- Encrypted in transit (HTTPS/TLS)
- Encrypted at rest
- Secure authentication
- Regular security updates

## Your Rights
- Access your data
- Delete your data
- Export your data
- Opt-out of optional features

## Data Retention
- Active accounts: Retained while active
- Deleted accounts: Removed within 30 days
- Purchase records: Anonymized after 7 years (legal requirement)

## Children's Privacy
- App is for ages 13+
- No data collected from children under 13
- Complies with COPPA

## Contact Us
- Email: privacy@quillby.app
- Support: support@quillby.app

## Changes to Policy
We will notify users of any changes via:
- In-app notification
- Email (if provided)
- Updated policy with new date
```

---

## Quick Reference Card

**For Google Play Console Form:**

| Question | Answer |
|----------|--------|
| Collect data? | YES |
| Encrypted in transit? | YES |
| Account creation method? | My app does not allow users to create an account |
| Deletion URL? | https://quillby.app/delete-account |
| Selective deletion? | YES |
| Security review? | NO |
| UPI verified? | NO |

**Data Types:**
- ✅ Name (optional)
- ✅ Email (optional)
- ✅ Health info
- ✅ Fitness info
- ✅ App interactions
- ✅ Device ID
- ✅ Approximate location
- ✅ Purchase history

**Shared With:**
- RevenueCat (payments)
- Supabase (storage)

---

## Support Email Templates

### Account Deletion Request Response
```
Subject: Account Deletion Confirmation - Quillby

Dear User,

We have received your account deletion request for Quillby.

Your account and all associated data will be permanently deleted within 30 days.

Data to be deleted:
- Personal information
- Habit tracking data
- Focus session history
- Achievements and progress
- Shop purchases and customizations

Data retained (anonymized):
- Purchase transaction records (legal requirement)

If you did not request this deletion, please reply immediately.

Best regards,
Quillby Privacy Team
privacy@quillby.app
```

---

**Document Version**: 1.0  
**Last Updated**: February 24, 2026  
**Next Review**: Before Play Store submission
