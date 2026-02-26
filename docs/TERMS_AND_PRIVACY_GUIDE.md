# Terms & Conditions and Privacy Policy Guide

## Overview
Quillby includes comprehensive Terms & Conditions and Privacy Policy that users must accept before using the app. This document explains how to view and manage these legal documents.

## How to View Terms & Privacy Policy

### During Onboarding
1. Open Quillby for the first time
2. On the Welcome screen, tap "Let's Begin"
3. A modal appears with a checkbox
4. Tap on the blue underlined text "Terms & Conditions" or "Privacy Policy"
5. A full-screen modal opens with the complete text
6. Scroll through to read all content
7. Tap "Close" to return to the checkbox
8. Check the box to agree
9. Tap "Accept & Continue"

### After Onboarding
Users can view the terms anytime by:
1. Going to Settings
2. Scrolling to "Human Stuff" section
3. Tapping the "Tutorial" book (which includes terms reference)
4. Or contacting support@quillby.app for a copy

## Content Included

### Privacy Policy Covers:
- What data we collect
- How we use your data
- Data storage and security
- Your rights under DPDPA 2023 (India)
- Children's privacy
- Contact information
- Grievance redressal process

### Key Privacy Points:
- ✅ No email collection
- ✅ No password required
- ✅ Device-based authentication
- ✅ Data stored on Supabase (encrypted)
- ✅ No data selling or sharing with advertisers
- ✅ Location used once for timezone only
- ✅ Right to deletion (30-day grace period)
- ✅ GDPR and CCPA compliant

### Terms & Conditions Cover:
- Service description
- User responsibilities
- Intellectual property
- Limitation of liability
- Governing law (India)
- Dispute resolution
- Refund policy (7-day window)

## Troubleshooting

### Issue: Can't see the terms text

**Solution 1: Check Modal State**
- Make sure you tapped on the blue underlined text
- The full terms modal should slide up from bottom
- If not appearing, try restarting the app

**Solution 2: Check ScrollView**
- The terms are in a scrollable view
- Try scrolling down to see more content
- The text should be visible on a light gray background

**Solution 3: Check Device**
- Ensure your device has enough screen space
- Try rotating to landscape mode
- Check if any accessibility settings are interfering

### Issue: Modal appears but content is blank

**Possible Causes:**
1. Text rendering issue
2. ScrollView not initialized
3. Modal overlay blocking content

**Solutions:**
1. Close and reopen the modal
2. Restart the app
3. Update to latest version
4. Contact support if issue persists

## Technical Implementation

### Component Structure
```
TermsModal
├── Compact Modal (Checkbox)
│   ├── Header
│   ├── Checkbox with links
│   └── Accept/Decline buttons
└── Full Terms Modal (Scrollable)
    ├── Header with close button
    ├── ScrollView with content
    └── Close button
```

### Content Display
- Font size: 13px
- Line height: 20px
- Background: Light gray (#FAFAFA)
- Padding: 16px
- Scrollable with indicator

### Modal Behavior
- Compact modal shows first
- Tapping links opens full modal
- Full modal overlays compact modal
- Closing full modal returns to compact
- Must check box to enable "Accept"

## For Developers

### Viewing Terms in Code
The complete terms text is in:
```
quillby-app/app/components/modals/TermsModal.tsx
```

### Updating Terms
1. Edit the `termsText` content in TermsModal.tsx
2. Update the "Effective Date" at the bottom
3. Test the modal displays correctly
4. Notify users of changes (if material)

### Testing Checklist
- [ ] Modal appears on first launch
- [ ] Links are clickable and blue
- [ ] Full modal slides up smoothly
- [ ] Content is readable and scrollable
- [ ] Close button works
- [ ] Checkbox can be toggled
- [ ] Accept button enables after checking
- [ ] Decline button works

## Legal Compliance

### Required by Law
- DPDPA 2023 (India) - Digital Personal Data Protection Act
- IT Act 2000 - Information Technology Act
- Consumer Protection Act 2019
- Google Play Store policies
- Apple App Store guidelines (if applicable)

### User Rights
Users have the right to:
- ✅ Access their data
- ✅ Correct their data
- ✅ Delete their data (30-day grace period)
- ✅ Port their data
- ✅ Withdraw consent
- ✅ File grievances

### Contact for Legal Matters
- Email: support@quillby.app
- Grievance Officer: MakerYuichii
- Response time: 7 days acknowledgment, 30 days resolution

## Updates and Changes

### When Terms Change
1. Update the content in TermsModal.tsx
2. Update "Effective Date"
3. Show in-app notification (for material changes)
4. Give users 14 days notice before enforcement
5. Require re-acceptance if changes are significant

### Version History
- v1.0.0 (Feb 24, 2026) - Initial release
- Includes account deletion feature
- DPDPA 2023 compliant
- GDPR and CCPA ready

## Support

### For Users
If you have questions about the terms or privacy policy:
- Email: support@quillby.app
- Response time: Within 48 hours
- Available in English

### For Developers
If you need to modify or update the terms:
1. Review legal requirements
2. Consult with legal counsel if needed
3. Update TermsModal.tsx
4. Test thoroughly
5. Deploy with proper notifications

## Best Practices

### For Users
- ✅ Read the full terms before accepting
- ✅ Understand what data is collected
- ✅ Know your rights
- ✅ Contact support with questions
- ✅ Keep a copy for your records

### For Developers
- ✅ Keep terms up to date
- ✅ Make terms easily accessible
- ✅ Use clear, simple language
- ✅ Highlight important points
- ✅ Provide contact information
- ✅ Respond to user inquiries promptly

## Accessibility

### Making Terms Accessible
- Font size is readable (13px minimum)
- High contrast text (#333 on #FAFAFA)
- Scrollable for all content
- Close buttons clearly labeled
- Links are underlined and blue
- Touch targets are large enough

### Screen Reader Support
- All text is readable by screen readers
- Buttons have descriptive labels
- Modal announces when opened
- Scroll position is maintained

## Frequently Asked Questions

### Q: Do I have to accept the terms?
A: Yes, accepting the terms is required to use Quillby. If you decline, you cannot proceed with onboarding.

### Q: Can I use the app without accepting?
A: No, the terms must be accepted to use any features of the app.

### Q: Where can I read the full terms?
A: Tap on the blue underlined text in the checkbox modal to view the complete terms.

### Q: How long are the terms?
A: The complete privacy policy and terms are approximately 3000 words and take about 10-15 minutes to read.

### Q: Can I get a copy of the terms?
A: Yes, email support@quillby.app and we'll send you a PDF copy.

### Q: What if I don't agree with the terms?
A: If you don't agree, you can decline and the app will not proceed. You can also contact us with specific concerns.

### Q: Will the terms change?
A: Terms may be updated occasionally. Material changes will be communicated with 14 days notice.

### Q: Is my data really safe?
A: Yes, we use enterprise-grade encryption and follow industry best practices. See the Privacy Policy for details.

## Summary

The Terms & Conditions and Privacy Policy are:
- ✅ Comprehensive and clear
- ✅ Legally compliant (India, GDPR, CCPA)
- ✅ Easily accessible in the app
- ✅ User-friendly and readable
- ✅ Regularly updated
- ✅ Backed by responsive support

For any questions or concerns, contact: support@quillby.app

---

**Last Updated:** December 2024  
**Version:** 1.0.0  
**Compliance:** DPDPA 2023, GDPR, CCPA
