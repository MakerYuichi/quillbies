import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  Animated,
  Dimensions,
} from 'react-native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface PremiumUnlockedModalProps {
  visible: boolean;
  onClose: () => void;
  expiresAt?: string | null; // ISO string — null means permanent
  onGoToShop?: () => void; // Optional callback to navigate to shop themes
}

const UNLOCKED_FEATURES = [
  {
    icon: '🌌',
    title: 'Galaxy Theme',
    description: 'Stunning galaxy vista for your room',
    color: '#7E57C2',
    bg: '#F3E5F5',
  },
  {
    icon: '🏯',
    title: 'Japanese Zen Theme',
    description: 'Tranquil zen garden atmosphere',
    color: '#5C6BC0',
    bg: '#E8EAF6',
  },
  {
    icon: '🌊',
    title: 'Ocean Theme',
    description: 'Underwater paradise for your space',
    color: '#0288D1',
    bg: '#E1F5FE',
  },
  {
    icon: '⏰',
    title: 'Extended Focus Sessions',
    description: 'Study for up to 120 minutes per session',
    color: '#2E7D32',
    bg: '#E8F5E9',
  },
  {
    icon: '☕',
    title: 'Premium Coffee Boost',
    description: '+15 focus boost, 5-min duration per session',
    color: '#6D4C41',
    bg: '#EFEBE9',
  },
  {
    icon: '🍎',
    title: 'Premium Apple Boost',
    description: '+10 focus boost, once per session',
    color: '#C62828',
    bg: '#FFEBEE',
  },
  {
    icon: '🚫',
    title: 'No Interstitial Ads',
    description: 'Study without interruptions',
    color: '#E65100',
    bg: '#FFF3E0',
  },
  {
    icon: '🎁',
    title: 'Early Access',
    description: 'First to get new features and content',
    color: '#AD1457',
    bg: '#FCE4EC',
  },
];

function formatExpiry(iso: string): string {
  const date = new Date(iso);
  return date.toLocaleDateString(undefined, { day: 'numeric', month: 'long', year: 'numeric' });
}

export default function PremiumUnlockedModal({ visible, onClose, expiresAt, onGoToShop }: PremiumUnlockedModalProps) {
  const scaleAnim = useRef(new Animated.Value(0.7)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const starAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 60,
          friction: 7,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 250,
          useNativeDriver: true,
        }),
        Animated.loop(
          Animated.sequence([
            Animated.timing(starAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
            Animated.timing(starAnim, { toValue: 0, duration: 800, useNativeDriver: true }),
          ])
        ),
      ]).start();
    } else {
      scaleAnim.setValue(0.7);
      opacityAnim.setValue(0);
      starAnim.setValue(0);
    }
  }, [visible]);

  const starOpacity = starAnim.interpolate({ inputRange: [0, 1], outputRange: [0.5, 1] });

  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={onClose}>
      <Animated.View style={[styles.overlay, { opacity: opacityAnim }]}>
        <Animated.View style={[styles.modal, { transform: [{ scale: scaleAnim }] }]}>

          {/* Header */}
          <View style={styles.header}>
            <Animated.Text style={[styles.crownEmoji, { opacity: starOpacity }]}>👑</Animated.Text>
            <Text style={styles.title}>Premium Unlocked!</Text>
            <Text style={styles.subtitle}>
              {expiresAt
                ? `Active until ${formatExpiry(expiresAt)}`
                : 'You now have full access to all premium features'}
            </Text>
          </View>

          {/* Features list */}
          <ScrollView
            style={styles.featuresList}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.featuresContent}
          >
            {UNLOCKED_FEATURES.map((feature, i) => (
              <View key={i} style={[styles.featureRow, { backgroundColor: feature.bg }]}>
                <Text style={styles.featureIcon}>{feature.icon}</Text>
                <View style={styles.featureText}>
                  <Text style={[styles.featureTitle, { color: feature.color }]}>{feature.title}</Text>
                  <Text style={styles.featureDesc}>{feature.description}</Text>
                </View>
                <Text style={styles.checkmark}>✓</Text>
              </View>
            ))}
          </ScrollView>

          {/* CTAs */}
          <View style={styles.btnRow}>
            <TouchableOpacity
              style={styles.shopBtn}
              onPress={() => { onGoToShop?.(); onClose(); }}
              activeOpacity={0.85}
            >
              <Text style={styles.shopBtnText}>🛍️ Browse Premium Items</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.laterBtn} onPress={onClose} activeOpacity={0.85}>
              <Text style={styles.laterBtnText}>Later</Text>
            </TouchableOpacity>
          </View>

          {expiresAt && (
            <Text style={styles.expiryNote}>
              Premium expires on {formatExpiry(expiresAt)}. Subscribe to keep access.
            </Text>
          )}
        </Animated.View>
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  modal: {
    width: '100%',
    maxHeight: '88%',
    backgroundColor: '#FFF',
    borderRadius: 24,
    overflow: 'hidden',
  },
  header: {
    alignItems: 'center',
    paddingTop: 28,
    paddingBottom: 16,
    paddingHorizontal: 20,
    background: 'linear-gradient(180deg, #FFF8E1 0%, #FFF 100%)',
    backgroundColor: '#FFF8E1',
    borderBottomWidth: 1,
    borderBottomColor: '#FFE082',
  },
  crownEmoji: {
    fontSize: 52,
    marginBottom: 8,
  },
  title: {
    fontSize: SCREEN_WIDTH * 0.065,
    fontFamily: 'ChakraPetch_700Bold',
    color: '#E65100',
    marginBottom: 6,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: SCREEN_WIDTH * 0.033,
    fontFamily: 'ChakraPetch_400Regular',
    color: '#888',
    textAlign: 'center',
  },
  featuresList: {
    maxHeight: SCREEN_WIDTH * 1.1,
  },
  featuresContent: {
    padding: 16,
    gap: 10,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 14,
    gap: 12,
  },
  featureIcon: {
    fontSize: 26,
    width: 34,
    textAlign: 'center',
  },
  featureText: {
    flex: 1,
  },
  featureTitle: {
    fontSize: SCREEN_WIDTH * 0.036,
    fontFamily: 'ChakraPetch_700Bold',
    marginBottom: 2,
  },
  featureDesc: {
    fontSize: SCREEN_WIDTH * 0.029,
    fontFamily: 'ChakraPetch_400Regular',
    color: '#666',
  },
  checkmark: {
    fontSize: 18,
    color: '#4CAF50',
    fontWeight: '700',
  },
  btnRow: {
    margin: 16,
    marginTop: 12,
    gap: 10,
  },
  shopBtn: {
    backgroundColor: '#FF9800',
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    shadowColor: '#FF9800',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 5,
  },
  shopBtnText: {
    fontSize: SCREEN_WIDTH * 0.042,
    fontFamily: 'ChakraPetch_700Bold',
    color: '#FFF',
    letterSpacing: 0.5,
  },
  laterBtn: {
    paddingVertical: 10,
    alignItems: 'center',
  },
  laterBtnText: {
    fontSize: SCREEN_WIDTH * 0.035,
    fontFamily: 'ChakraPetch_400Regular',
    color: '#AAA',
  },
  expiryNote: {
    fontSize: SCREEN_WIDTH * 0.028,
    fontFamily: 'ChakraPetch_400Regular',
    color: '#AAA',
    textAlign: 'center',
    paddingHorizontal: 20,
    paddingBottom: 16,
    marginTop: -4,
  },
});
