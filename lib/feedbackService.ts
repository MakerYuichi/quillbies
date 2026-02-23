import * as Device from 'expo-device';
import * as Application from 'expo-application';
import { Platform } from 'react-native';

export interface FeedbackData {
  category: string;
  title: string;
  description: string;
  email?: string;
  userName: string;
  deviceId: string;
  appVersion: string;
  timestamp: string;
}

interface ExtendedFeedbackData extends FeedbackData {
  deviceInfo: {
    platform: string;
    osVersion: string;
    deviceModel: string;
    deviceName: string;
    appVersion: string;
    buildNumber: string;
  };
}

/**
 * Submit feedback to your backend or email service
 */
export async function submitFeedback(feedback: FeedbackData): Promise<void> {
  try {
    // Collect device information for debugging
    const deviceInfo = {
      platform: Platform.OS,
      osVersion: Platform.Version.toString(),
      deviceModel: Device.modelName || 'Unknown',
      deviceName: Device.deviceName || 'Unknown',
      appVersion: Application.nativeApplicationVersion || '1.0.0',
      buildNumber: Application.nativeBuildVersion || '1',
    };

    const extendedFeedback: ExtendedFeedbackData = {
      ...feedback,
      deviceInfo,
    };

    console.log('[Feedback] Submitting feedback:', extendedFeedback);

    // OPTION 1: Send to your backend API
    // Uncomment and configure your backend endpoint
    /*
    const response = await fetch('https://your-backend.com/api/feedback', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(extendedFeedback),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    console.log('[Feedback] Submission successful:', result);
    */

    // OPTION 2: Send via email service (e.g., SendGrid, Mailgun)
    // This requires a backend proxy to keep API keys secure
    /*
    const response = await fetch('https://your-backend.com/api/send-feedback-email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(extendedFeedback),
    });

    if (!response.ok) {
      throw new Error(`Email service error! status: ${response.status}`);
    }
    */

    // OPTION 3: Use a third-party feedback service (e.g., Formspree, Google Forms)
    // Example with Formspree (free tier available)
    const formspreeEndpoint = process.env.FORMSPREE_ENDPOINT || 'YOUR_FORMSPREE_ENDPOINT';
    
    if (formspreeEndpoint && formspreeEndpoint !== 'YOUR_FORMSPREE_ENDPOINT') {
      const response = await fetch(formspreeEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          category: feedback.category,
          title: feedback.title,
          description: feedback.description,
          email: feedback.email || 'No email provided',
          userName: feedback.userName,
          deviceId: feedback.deviceId,
          platform: deviceInfo.platform,
          osVersion: deviceInfo.osVersion,
          deviceModel: deviceInfo.deviceModel,
          appVersion: deviceInfo.appVersion,
          timestamp: feedback.timestamp,
        }),
      });

      if (!response.ok) {
        throw new Error(`Formspree error! status: ${response.status}`);
      }

      console.log('[Feedback] Submitted via Formspree successfully');
      return;
    }

    // OPTION 4: Store locally and sync later (fallback)
    // You can implement local storage and batch upload later
    console.log('[Feedback] No backend configured - feedback logged locally');
    console.log('[Feedback] Configure FORMSPREE_ENDPOINT in .env to enable submission');
    
    // For now, just log it (you can implement local storage here)
    // In production, you should store this in AsyncStorage and sync when online
    
  } catch (error) {
    console.error('[Feedback] Submission error:', error);
    throw error;
  }
}

/**
 * Get feedback submission history (if stored locally)
 */
export async function getFeedbackHistory(): Promise<FeedbackData[]> {
  // TODO: Implement local storage retrieval
  return [];
}

/**
 * Clear feedback history
 */
export async function clearFeedbackHistory(): Promise<void> {
  // TODO: Implement local storage clearing
  console.log('[Feedback] History cleared');
}
