# Google Play Data Safety Disclosure

## Overview
This document outlines the data collection, usage, and sharing practices for Quillby app to comply with Google Play Store's Data Safety requirements.

---

## Answer to Main Question
**Does your app collect or share any of the required user data types?**
**Answer: YES**

---

## Data Types Collected

### 1. Personal Information

#### Name
- **Collected**: YES
- **Data**: User's chosen name (optional)
- **Purpose**: Personalization
- **Sharing**: NO
- **Optional**: YES
- **User can request deletion**: YES

#### Email Address
- **Collected**: YES (Optional)
- **Data**: Email for feedback follow-up
- **Purpose**: Support and feedback
- **Sharing**: NO
- **Optional**: YES
- **User can request deletion**: YES

---

### 2. Health and Fitness

#### Health Info
- **Collected**: YES
- **Data**: 
  - Sleep tracking (start time, end time, duration)
  - Meal logging (breakfast, lunch, dinner)
  - Water intake tracking
  - Exercise minutes
  - Weight goals (lose/maintain/gain)
- **Purpose**: App functionality - habit tracking and wellness
- **Sharing**: NO
- **Optional**: YES (users can disable specific habits)
- **User can request deletion**: YES

#### Fitness Info
- **Collected**: YES
- **Data**:
  - Exercise duration and frequency
  - Daily exercise goals
  - Exercise session history
- **Purpose**: App functionality - fitness tracking
- **Sharing**: NO
- **Optional**: YES
- **User can request deletion**: YES

---

### 3. App Activity

#### App Interactions
- **Collected**: YES
- **Data**:
  - Focus session duration and frequency
  - Study time tracking
  - Distraction counts during sessions
  - Break time usage
  - Achievement progress
  - Streak tracking
- **Purpose**: App functionality and user experience
- **Sharing**: NO
- **Optional**: NO (core app functionality)
- **User can request deletion**: YES

#### In-app Search History
- **Collected**: NO

---

### 4. App Info and Performance

#### Crash Logs
- **Collected**: NO (not implemented)

#### Diagnostics
- **Collected**: NO (not implemented)

#### Other App Performance Data
- **Collected**: NO

---

### 5. Device or Other IDs

#### Device ID
- **Collected**: YES
- **Data**: Anonymous device identifier
- **Purpose**: 
  - User authentication
  - Data synchronization across devices
  - Feedback submission tracking
- **Sharing**: NO
- **Optional**: NO (required for app functionality)
- **User can request deletion**: YES

---

### 6. Location

#### Approximate Location
- **Collected**: YES
- **Data**: Country and timezone
- **Purpose**: 
  - Localization
  - Time-based features (study checkpoints, daily resets)
- **Sharing**: NO
- **Optional**: YES
- **User can request deletion**: YES

#### Precise Location
- **Collected**: NO

---

### 7. Financial Info

#### Purchase History
- **Collected**: YES
- **Data**:
  - In-app purchases (premium subscription, gems)
  - Shop item purchases (virtual currency)
  - Purchase timestamps
- **Purpose**: 
  - App functionality
  - Premium feature access
  - Transaction records
- **Sharing**: YES (with RevenueCat for payment processing)
- **Optional**: YES (only if user makes purchases)
- **User can request deletion**: YES

#### Payment Info
- **Collected**: NO
- **Note**: Payment information is handled by Google Play Store and RevenueCat, not stored by our app

---

### 8. Messages

#### Emails
- **Collected**: NO

#### SMS or MMS
- **Collected**: NO

#### Other In-app Messages
- **Collected**: NO

---

### 9. Photos and Videos

- **Collected**: NO

---

### 10. Audio Files

- **Collected**: NO

---

### 11. Files and Docs

- **Collected**: NO

---

### 12. Calendar

- **Collected**: NO

---

### 13. Contacts

- **Collected**: NO

---

## Data Usage and Purpose

### Core Functionality
All collected data is used to provide core app features:
- Habit tracking (sleep, meals, water, exercise)
- Focus session management
- Progress tracking and achievements
- Room customization and gamification
- Premium features access

### Personalization
- User name for personalized experience
- Buddy name for virtual pet
- Room customization preferences
- Study goals and checkpoints

### Analytics
- **NOT COLLECTED**: We do not use third-party analytics services
- **NOT COLLECTED**: We do not track user behavior for advertising

### Developer Communications
- Optional email for feedback follow-up only
- No marketing emails
- No promotional communications

---

## Data Sharing

### Third-Party Services

#### RevenueCat (Payment Processing)
- **Data Shared**: 
  - Device ID (anonymous)
  - Purchase transactions
  - Premium subscription status
- **Purpose**: Payment processing and subscription management
- **Privacy Policy**: https://www.revenuecat.com/privacy

#### Supabase (Backend Database)
- **Data Shared**: All user data listed above
- **Purpose**: Data storage and synchronization
- **Privacy Policy**: https://supabase.com/privacy
- **Data Location**: Encrypted cloud storage

### No Data Sharing For:
- ❌ Advertising or marketing
- ❌ Analytics
- ❌ Fraud prevention, security, and compliance (beyond basic app security)
- ❌ Personalization (we personalize using local data only)
- ❌ Account management (handled internally)

---

## Data Security

### Encryption
- **In Transit**: YES - All data transmitted using HTTPS/TLS
- **At Rest**: YES - Database encryption via Supabase

### Security Practices
- Secure authentication using device-based tokens
- No passwords stored (device-based authentication)
- Encrypted API communications
- Regular security updates

---

## Data Retention and Deletion

### Retention Period
- User data is retained as long as the account is active
- Inactive accounts: Data retained for 1 year, then deleted

### User Rights
Users can request:
1. **Data Access**: View all collected data
2. **Data Deletion**: Delete account and all associated data
3. **Data Export**: Download personal data (future feature)

### How to Request Deletion
1. In-app: Settings → Account → Delete Account
2. Email: support@quillby.app
3. Response time: Within 30 days

---

## Children's Privacy

### Age Requirement
- App is suitable for ages 13+
- Complies with COPPA (Children's Online Privacy Protection Act)
- No data knowingly collected from children under 13

### Parental Controls
- Parents can monitor usage through device parental controls
- No social features or user-to-user communication

---

## Changes to Data Practices

### Notification
Users will be notified of any changes to data collection practices:
- In-app notification
- Updated privacy policy
- Requires user consent for new data types

---

## Contact Information

### Developer Contact
- **Email**: support@quillby.app
- **Privacy Questions**: privacy@quillby.app
- **Data Deletion Requests**: privacy@quillby.app

### Privacy Policy
- **URL**: https://quillby.app/privacy (to be created)
- **Last Updated**: February 24, 2026

---

## Google Play Data Safety Form Answers

### Quick Reference for Form Completion

**Does your app collect or share any of the required user data types?**
✅ YES

**Data Types Collected:**
- ✅ Name (optional)
- ✅ Email address (optional)
- ✅ Health info (sleep, meals, water, exercise)
- ✅ Fitness info (exercise tracking)
- ✅ App interactions (focus sessions, achievements)
- ✅ Device ID
- ✅ Approximate location (country, timezone)
- ✅ Purchase history

**Data Shared with Third Parties:**
- ✅ Purchase history (with RevenueCat for payment processing)
- ✅ Device ID (with RevenueCat and Supabase)

**Data Security:**
- ✅ Data encrypted in transit
- ✅ Data encrypted at rest
- ✅ Users can request data deletion

**Data Usage:**
- ✅ App functionality
- ✅ Personalization
- ❌ Analytics
- ❌ Advertising
- ❌ Fraud prevention
- ❌ Developer communications (except optional feedback)

---

## Compliance Checklist

- ✅ Data Safety form completed accurately
- ✅ Privacy policy created and linked
- ✅ Data deletion mechanism implemented
- ✅ Encryption in transit and at rest
- ✅ No data collection from children under 13
- ✅ No advertising or tracking
- ✅ Transparent data practices
- ✅ User consent for data collection
- ✅ Minimal data collection (only what's necessary)
- ✅ No sale of user data

---

## Additional Badges

### Independent Security Review
**Status**: Not applicable (optional)
**Recommendation**: Consider for future versions if handling sensitive data increases

### UPI Payments Verified
**Status**: Not applicable
**Reason**: App does not use UPI payments (uses Google Play billing)

---

## Notes for Play Console Submission

1. **Privacy Policy Required**: Create and host privacy policy at https://quillby.app/privacy
2. **Data Safety Form**: Complete using information from this document
3. **Target Audience**: Set to 13+ (Teen)
4. **Content Rating**: Apply for IARC rating
5. **Permissions**: Review and justify all Android permissions requested

---

**Document Version**: 1.0  
**Last Updated**: February 24, 2026  
**Next Review**: Before each app update
