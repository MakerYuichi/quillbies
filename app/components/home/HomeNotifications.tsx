import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import NotificationBanner from '../ui/NotificationBanner';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface HomeNotificationsProps {
  notifications: any;
}

export default function HomeNotifications({ notifications }: HomeNotificationsProps) {
  // Temporarily disabled for performance
  const notificationList: any[] = [];
  
  const dismissNotification = () => {};
  
  return (
    <>
      {notificationList.length > 0 && (
        <View style={styles.notificationContainer}>
          <NotificationBanner
            notifications={notificationList}
            onDismiss={dismissNotification}
          />
        </View>
      )}
    </>
  );
}

const styles = StyleSheet.create({
  notificationContainer: {
    position: 'absolute',
    top: (SCREEN_HEIGHT * 120) / 852,
    left: (SCREEN_WIDTH * 17) / 393,
    right: (SCREEN_WIDTH * 17) / 393,
    zIndex: 30,
  },
});