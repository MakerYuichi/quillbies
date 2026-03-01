import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { playTabSound } from '../../lib/soundManager';
import { useState, useEffect } from 'react';
import { useQuillbyStore } from '../state/store-modular';
import AchievementUnlockedModal from '../components/modals/AchievementUnlockedModal';
import { ACHIEVEMENTS } from '../core/achievements';
import { Achievement } from '../core/types';
import { getThemeColors } from '../utils/themeColors';

export default function TabLayout() {
  const insets = useSafeAreaInsets();
  const [showCelebration, setShowCelebration] = useState(false);
  const [celebrationAchievement, setCelebrationAchievement] = useState<Achievement | null>(null);
  const userData = useQuillbyStore((state) => state.userData);
  
  // Get theme colors
  const themeType = userData.roomCustomization?.themeType;
  const themeColors = getThemeColors(themeType);
  
  const handleTabPress = () => {
    playTabSound();
  };
  
  // Listen for achievement unlocks
  useEffect(() => {
    console.log('[Achievements] 🎧 Setting up achievement listener...');
    
    // Use regular subscribe with manual comparison
    let prevAchievements = useQuillbyStore.getState().userData.achievements || {};
    
    const unsubscribe = useQuillbyStore.subscribe((state) => {
      const newAchievements = state.userData.achievements;
      
      if (!newAchievements) {
        console.log('[Achievements] ⚠️ Missing achievements data');
        return;
      }
      
      // Check for newly unlocked achievements
      Object.keys(newAchievements).forEach(id => {
        const wasUnlocked = prevAchievements[id]?.unlocked;
        const isNowUnlocked = newAchievements[id]?.unlocked;
        
        if (isNowUnlocked && !wasUnlocked) {
          // Achievement just unlocked!
          console.log('[Achievements] 🎉 Showing celebration for:', id);
          const achievement = ACHIEVEMENTS[id];
          setCelebrationAchievement(achievement);
          setShowCelebration(true);
        }
      });
      
      prevAchievements = newAchievements;
    });
    
    console.log('[Achievements] ✅ Listener setup complete');
    return unsubscribe;
  }, []);
  
  return (
    <>
      <Tabs
        screenOptions={{
          tabBarActiveTintColor: themeType ? themeColors.tabBarActive : '#FF9800',
          tabBarInactiveTintColor: themeType ? (themeColors.isDark ? 'rgba(255, 255, 255, 0.8)' : 'rgba(0, 0, 0, 0.6)') : '#666',
          tabBarStyle: {
            backgroundColor: themeType ? themeColors.tabBar : '#FFFFFF',
            borderTopWidth: 1,
            borderTopColor: themeType ? (themeColors.isDark ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.1)') : '#EEE',
            height: 60 + insets.bottom,
            paddingBottom: insets.bottom > 0 ? insets.bottom : 8,
            paddingTop: 8,
          },
          headerShown: false,
        }}
        screenListeners={{
          tabPress: handleTabPress,
        }}
      >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="focus"
        options={{
          title: 'Focus',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="book" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="shop"
        options={{
          title: 'Shop',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="cart" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="stats"
        options={{
          title: 'Stats',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="stats-chart" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="settings" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
    
    {/* Achievement Celebration Modal */}
    <AchievementUnlockedModal
      visible={showCelebration}
      achievement={celebrationAchievement}
      onClose={() => {
        setShowCelebration(false);
        setCelebrationAchievement(null);
      }}
    />
    </>
  );
}
