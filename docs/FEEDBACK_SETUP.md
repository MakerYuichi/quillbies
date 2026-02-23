# Feedback System Setup Guide

The Quillby app includes a built-in feedback system that allows users to submit bug reports, feature requests, and other feedback directly from the app.

## Features

- **5 Feedback Categories**: Bug Report, Feature Request, Improvement, Praise, Other
- **Rich Feedback Form**: Title, description (1000 chars), optional email for follow-up
- **Device Information**: Automatically collects device info for debugging
- **User-Friendly UI**: Beautiful modal with category selection and validation

## Setup Options

### Option 1: Formspree (Recommended - Free & Easy)

Formspree is a free service that converts form submissions into emails. Perfect for getting started quickly.

1. **Sign up at [Formspree.io](https://formspree.io/)**
   - Free tier: 50 submissions/month
   - No credit card required

2. **Create a new form**
   - Click "New Form"
   - Name it "Quillby Feedback"
   - Copy the form endpoint URL (looks like `https://formspree.io/f/xyzabc123`)

3. **Add to your .env file**
   ```bash
   FORMSPREE_ENDPOINT=https://formspree.io/f/your_form_id
   ```

4. **Configure email notifications**
   - In Formspree dashboard, set your email address
   - You'll receive an email for each feedback submission

5. **Test it**
   - Open the app → Settings → Feedback button
   - Submit a test feedback
   - Check your email inbox

### Option 2: Your Own Backend API

If you have your own backend, you can send feedback directly to your API.

1. **Update `lib/feedbackService.ts`**
   ```typescript
   const response = await fetch('https://your-backend.com/api/feedback', {
     method: 'POST',
     headers: {
       'Content-Type': 'application/json',
       'Authorization': 'Bearer YOUR_API_KEY', // If needed
     },
     body: JSON.stringify(extendedFeedback),
   });
   ```

2. **Backend endpoint should accept**:
   ```json
   {
     "category": "bug|feature|improvement|praise|other",
     "title": "Brief summary",
     "description": "Detailed description",
     "email": "user@example.com (optional)",
     "userName": "User's name",
     "deviceId": "unique-device-id",
     "appVersion": "1.0.0",
     "timestamp": "2024-01-01T00:00:00.000Z",
     "deviceInfo": {
       "platform": "ios|android",
       "osVersion": "17.0",
       "deviceModel": "iPhone 14 Pro",
       "deviceName": "User's iPhone",
       "appVersion": "1.0.0",
       "buildNumber": "1"
     }
   }
   ```

3. **Backend should return**:
   - Success: `200 OK` with JSON response
   - Error: `4xx/5xx` with error message

### Option 3: Email Service (SendGrid, Mailgun, etc.)

Use an email service API to send feedback as emails.

1. **Sign up for an email service**
   - [SendGrid](https://sendgrid.com/) - 100 emails/day free
   - [Mailgun](https://www.mailgun.com/) - 5,000 emails/month free
   - [AWS SES](https://aws.amazon.com/ses/) - 62,000 emails/month free

2. **Create a backend proxy** (required to keep API keys secure)
   - Never put email service API keys in the mobile app
   - Create a simple serverless function (Vercel, Netlify, AWS Lambda)
   - Example with Vercel:
   
   ```typescript
   // api/send-feedback.ts
   import { sendEmail } from '@sendgrid/mail';
   
   export default async function handler(req, res) {
     if (req.method !== 'POST') {
       return res.status(405).json({ error: 'Method not allowed' });
     }
     
     const feedback = req.body;
     
     await sendEmail({
       to: 'your-email@example.com',
       from: 'feedback@quillby.app',
       subject: `[${feedback.category}] ${feedback.title}`,
       html: `
         <h2>New Feedback from Quillby</h2>
         <p><strong>Category:</strong> ${feedback.category}</p>
         <p><strong>Title:</strong> ${feedback.title}</p>
         <p><strong>Description:</strong></p>
         <p>${feedback.description}</p>
         <p><strong>User:</strong> ${feedback.userName}</p>
         <p><strong>Email:</strong> ${feedback.email || 'Not provided'}</p>
         <hr>
         <p><strong>Device Info:</strong></p>
         <pre>${JSON.stringify(feedback.deviceInfo, null, 2)}</pre>
       `,
     });
     
     res.status(200).json({ success: true });
   }
   ```

3. **Update `lib/feedbackService.ts`** to call your proxy endpoint

### Option 4: Local Storage (Offline Mode)

Store feedback locally and sync later when online.

1. **Implement in `lib/feedbackService.ts`**:
   ```typescript
   import AsyncStorage from '@react-native-async-storage/async-storage';
   
   // Store feedback locally
   const storedFeedback = await AsyncStorage.getItem('pending_feedback');
   const feedbackList = storedFeedback ? JSON.parse(storedFeedback) : [];
   feedbackList.push(extendedFeedback);
   await AsyncStorage.setItem('pending_feedback', JSON.stringify(feedbackList));
   ```

2. **Create a sync function** to upload when online:
   ```typescript
   export async function syncPendingFeedback() {
     const storedFeedback = await AsyncStorage.getItem('pending_feedback');
     if (!storedFeedback) return;
     
     const feedbackList = JSON.parse(storedFeedback);
     for (const feedback of feedbackList) {
       try {
         await submitFeedback(feedback);
       } catch (error) {
         console.error('Failed to sync feedback:', error);
       }
     }
     
     await AsyncStorage.removeItem('pending_feedback');
   }
   ```

## Feedback Data Structure

Each feedback submission includes:

- **User Input**:
  - `category`: Bug Report, Feature Request, Improvement, Praise, Other
  - `title`: Brief summary (max 100 chars)
  - `description`: Detailed description (max 1000 chars)
  - `email`: Optional email for follow-up
  
- **Automatic Data**:
  - `userName`: User's name from profile
  - `deviceId`: Unique device identifier
  - `appVersion`: App version number
  - `timestamp`: ISO 8601 timestamp
  - `deviceInfo`:
    - `platform`: ios or android
    - `osVersion`: OS version
    - `deviceModel`: Device model name
    - `deviceName`: User's device name
    - `appVersion`: Native app version
    - `buildNumber`: Build number

## Testing

1. **Open the app**
2. **Go to Settings tab**
3. **Tap the "📝 Feedback" button** (green book on the bookshelf)
4. **Fill out the form**:
   - Select a category
   - Enter a title
   - Write a description
   - Optionally add your email
5. **Submit**
6. **Check your configured destination** (email, backend, etc.)

## Troubleshooting

### "Submission Failed" Error

- Check your internet connection
- Verify the `FORMSPREE_ENDPOINT` in `.env` is correct
- Check Formspree dashboard for errors
- Look at app logs: `console.log('[Feedback]')`

### Not Receiving Emails

- Check Formspree email settings
- Check spam folder
- Verify email address in Formspree dashboard
- Test with Formspree's test mode

### Form Validation Issues

- Title and description are required
- Category must be selected
- Description max 1000 characters
- Email validation is basic (optional field)

## Customization

### Add More Categories

Edit `FeedbackModal.tsx`:

```typescript
const FEEDBACK_CATEGORIES = [
  { id: 'bug', label: '🐛 Bug Report', emoji: '🐛' },
  { id: 'feature', label: '💡 Feature Request', emoji: '💡' },
  { id: 'custom', label: '🎨 Custom Category', emoji: '🎨' }, // Add here
];
```

### Change Character Limits

Edit `FeedbackModal.tsx`:

```typescript
maxLength={100}  // Title limit
maxLength={1000} // Description limit
```

### Customize Email Template

If using your own backend, customize the email HTML in your backend code.

## Privacy & Security

- **No sensitive data**: Feedback system doesn't collect passwords or payment info
- **Optional email**: Users can choose to provide email or stay anonymous
- **Device info**: Only collected for debugging purposes
- **GDPR compliant**: Users are informed about data collection
- **Secure transmission**: All data sent over HTTPS

## Best Practices

1. **Respond to feedback**: Users appreciate knowing their feedback was read
2. **Categorize properly**: Use categories to prioritize bug fixes vs features
3. **Follow up**: If user provides email, follow up on their feedback
4. **Track trends**: Look for common issues or feature requests
5. **Thank users**: Show appreciation for taking time to provide feedback

## Support

If you need help setting up the feedback system:

1. Check the [Formspree documentation](https://help.formspree.io/)
2. Review the code in `lib/feedbackService.ts`
3. Check app logs for error messages
4. Test with a simple curl command to verify your endpoint

## Future Enhancements

Potential improvements to the feedback system:

- [ ] Screenshot attachment
- [ ] Video recording for bug reproduction
- [ ] In-app feedback history
- [ ] Upvoting existing feedback
- [ ] Public roadmap integration
- [ ] Automatic crash reporting
- [ ] Analytics integration
- [ ] Sentiment analysis
- [ ] Auto-categorization with AI
- [ ] Multi-language support
