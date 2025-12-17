import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface NotificationData {
  id: string;
  type: 'checkpoint-reminder' | 'checkpoint-reached' | 'daily-summary';
  title: string;
  message: string;
  timestamp: number;
}

interface NotificationBannerProps {
  notification: NotificationData;
  onDismiss: (id: string) => void;
}

export default function NotificationBanner({ notification, onDismiss }: NotificationBannerProps) {
  const getNotificationStyle = () => {
    switch (notification.type) {
      case 'checkpoint-reminder':
        return {
          backgroundColor: '#2196F3',
          borderColor: '#1976D2',
          icon: '⏰'
        };
      case 'checkpoint-reached':
        return {
          backgroundColor: notification.message.includes('Great job') ? '#4CAF50' : '#FF9800',
          borderColor: notification.message.includes('Great job') ? '#388E3C' : '#F57C00',
          icon: notification.message.includes('Great job') ? '✅' : '📚'
        };
      case 'daily-summary':
        return {
          backgroundColor: '#9C27B0',
          borderColor: '#7B1FA2',
          icon: '📊'
        };
      default:
        return {
          backgroundColor: '#757575',
          borderColor: '#424242',
          icon: 'ℹ️'
        };
    }
  };

  const style = getNotificationStyle();

  return (
    <View style={[styles.container, { backgroundColor: style.backgroundColor, borderColor: style.borderColor }]}>
      <View style={styles.content}>
        <Text style={styles.icon}>{style.icon}</Text>
        <View style={styles.textContainer}>
          <Text style={styles.title}>{notification.title}</Text>
          <Text style={styles.message}>{notification.message}</Text>
        </View>
        <TouchableOpacity
          style={styles.dismissButton}
          onPress={() => onDismiss(notification.id)}
        >
          <Text style={styles.dismissText}>×</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 20,
    marginVertical: 5,
    borderRadius: 12,
    borderWidth: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 15,
  },
  icon: {
    fontSize: 20,
    marginRight: 12,
    marginTop: 2,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontFamily: 'ChakraPetch_600SemiBold',
    fontSize: 14,
    color: '#FFF',
    marginBottom: 4,
  },
  message: {
    fontFamily: 'ChakraPetch_400Regular',
    fontSize: 12,
    color: '#FFF',
    lineHeight: 16,
  },
  dismissButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  dismissText: {
    fontSize: 16,
    color: '#FFF',
    fontWeight: 'bold',
  },
});