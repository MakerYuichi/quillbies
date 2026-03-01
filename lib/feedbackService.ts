import * as Device from 'expo-device';
import * as Application from 'expo-application';
import { Platform } from 'react-native';
import { supabase } from './supabase';

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
 * Submit feedback to Supabase
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

    console.log('[Feedback] Submitting feedback to Supabase:', {
      category: feedback.category,
      title: feedback.title,
    });

    // Insert feedback into Supabase
    const { data, error } = await supabase
      .from('feedback')
      .insert([
        {
          category: feedback.category,
          title: feedback.title,
          description: feedback.description,
          email: feedback.email || null,
          user_name: feedback.userName,
          device_id: feedback.deviceId,
          platform: deviceInfo.platform,
          os_version: deviceInfo.osVersion,
          device_model: deviceInfo.deviceModel,
          device_name: deviceInfo.deviceName,
          app_version: deviceInfo.appVersion,
          build_number: deviceInfo.buildNumber,
          timestamp: feedback.timestamp,
          created_at: new Date().toISOString(),
        },
      ])
      .select();

    if (error) {
      console.error('[Feedback] Supabase error:', error);
      throw new Error(`Failed to submit feedback: ${error.message}`);
    }

    console.log('[Feedback] Successfully submitted to Supabase:', data);
  } catch (error) {
    console.error('[Feedback] Submission error:', error);
    throw error;
  }
}

/**
 * Get feedback submission history from Supabase (optional - for admin dashboard)
 */
export async function getFeedbackHistory(deviceId?: string): Promise<FeedbackData[]> {
  try {
    let query = supabase
      .from('feedback')
      .select('*')
      .order('created_at', { ascending: false });

    if (deviceId) {
      query = query.eq('device_id', deviceId);
    }

    const { data, error } = await query.limit(50);

    if (error) {
      console.error('[Feedback] Error fetching history:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('[Feedback] Error fetching history:', error);
    return [];
  }
}
