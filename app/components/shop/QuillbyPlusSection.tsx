import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Dimensions, Modal } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface TierCardProps {
  title: string;
  coins: number;
  price: string;
  features: string[];
  icon: string;
  isPopular?: boolean;
  onPress: () => void;
}

function TierCard({ title, coins, price, features, icon, isPopular, onPress }: TierCardProps) {
  return (
    <TouchableOpacity
      style={[styles.tierCard, isPopular && styles.tierCardPopular]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      {isPopular && (
        <View style={styles.popularBadge}>
          <Text style={styles.popularBadgeText}>BEST VALUE</Text>
        </View>
      )}
      
      <LinearGradient
        colors={isPopular ? ['#FFD700', '#FFA500'] : ['#E3F2FD', '#BBDEFB']}
        style={styles.tierGradient}
      >
        <Text style={styles.tierIcon}>{icon}</Text>
        <Text style={styles.tierTitle}>{title}</Text>
        <Text style={styles.tierCoins}>🪙 {coins} Q-Coins</Text>
        
        <View style={styles.featuresContainer}>
          {features.map((feature, index) => (
            <Text key={index} style={styles.featureItem}>✓ {feature}</Text>
          ))}
        </View>
        
        <TouchableOpacity style={styles.tierButton} onPress={onPress}>
          <Text style={styles.tierButtonText}>{price}</Text>
        </TouchableOpacity>
      </LinearGradient>
    </TouchableOpacity>
  );
}

interface FeatureItemProps {
  icon: string;
  text: string;
}

function FeatureItem({ icon, text }: FeatureItemProps) {
  return (
    <View style={styles.featureRow}>
      <Text style={styles.featureIcon}>{icon}</Text>
      <Text style={styles.featureText}>{text}</Text>
    </View>
  );
}

interface QuillbyPlusModalProps {
  visible: boolean;
  onClose: () => void;
  insufficientCoins?: boolean;
  requiredCoins?: number;
}

export default function QuillbyPlusModal({ visible, onClose, insufficientCoins, requiredCoins }: QuillbyPlusModalProps) {
  const handlePurchase = (tier: string) => {
    // TODO: Implement actual purchase flow with Apple/Google Pay
    alert(`Purchase ${tier} - Coming soon! This will integrate with Apple/Google Pay.`);
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          {/* Close Button */}
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Text style={styles.closeButtonText}>✕</Text>
          </TouchableOpacity>

          <ScrollView showsVerticalScrollIndicator={false}>
            {/* Insufficient Coins Message */}
            {insufficientCoins && (
              <View style={styles.insufficientCoinsCard}>
                <Text style={styles.insufficientCoinsIcon}>😢</Text>
                <Text style={styles.insufficientCoinsTitle}>Not Enough Q-Coins!</Text>
                <Text style={styles.insufficientCoinsText}>
                  You need {requiredCoins} coins for this item.
                </Text>
                <Text style={styles.insufficientCoinsSubtext}>
                  Get more coins below or earn them by studying! 📚
                </Text>
              </View>
            )}

            {/* Header */}
            <LinearGradient
              colors={['#7E57C2', '#5E35B1']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.header}
            >
              <Text style={styles.headerIcon}>💎</Text>
              <View style={styles.headerTextContainer}>
                <Text style={styles.headerTitle}>Quillby Plus</Text>
                <Text style={styles.headerSubtitle}>Unlock Premium Features</Text>
              </View>
            </LinearGradient>

            {/* Tier Cards */}
            <Text style={styles.sectionTitle}>💰 Coin Packages</Text>
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.tiersContainer}
            >
              <TierCard
                title="Mini Pack"
                coins={500}
                price="$1.99"
                features={['+500 Q-Coins', 'Daily Bonus']}
                icon="✨"
                onPress={() => handlePurchase('Mini Pack')}
              />
              
              <TierCard
                title="Study Pack"
                coins={1200}
                price="$3.99"
                features={['+1200 Q-Coins', '2x Daily Bonus', 'Exclusive Pet']}
                icon="⭐"
                isPopular={true}
                onPress={() => handlePurchase('Study Pack')}
              />
              
              <TierCard
                title="Pro Pack"
                coins={3000}
                price="$8.99"
                features={['+3000 Q-Coins', '3x Daily Bonus', 'All Pets', 'VIP Room']}
                icon="👑"
                onPress={() => handlePurchase('Pro Pack')}
              />
            </ScrollView>

            {/* Premium Features List */}
            <View style={styles.featuresSection}>
              <Text style={styles.sectionTitle}>✨ Premium Features</Text>
              <View style={styles.featuresList}>
                <FeatureItem icon="⚡" text="2x Energy Recovery" />
                <FeatureItem icon="👕" text="Exclusive Outfits" />
                <FeatureItem icon="🎵" text="Premium Sounds" />
                <FeatureItem icon="🌈" text="Custom Room Themes" />
                <FeatureItem icon="📊" text="Advanced Analytics" />
                <FeatureItem icon="🔔" text="Priority Notifications" />
              </View>
            </View>

            {/* Subscription Option */}
            <LinearGradient
              colors={['#FFD700', '#FFA500']}
              style={styles.subscriptionCard}
            >
              <Text style={styles.subscriptionIcon}>💎</Text>
              <Text style={styles.subscriptionTitle}>Quillby Plus Subscription</Text>
              <Text style={styles.subscriptionPrice}>$4.99/month</Text>
              <View style={styles.subscriptionFeatures}>
                <Text style={styles.subscriptionFeature}>✓ Unlimited customization</Text>
                <Text style={styles.subscriptionFeature}>✓ All outfits unlocked</Text>
                <Text style={styles.subscriptionFeature}>✓ Priority support</Text>
                <Text style={styles.subscriptionFeature}>✓ No ads</Text>
              </View>
              <TouchableOpacity 
                style={styles.subscriptionButton}
                onPress={() => handlePurchase('Subscription')}
              >
                <Text style={styles.subscriptionButtonText}>Subscribe Now</Text>
              </TouchableOpacity>
              <Text style={styles.subscriptionNote}>Cancel anytime</Text>
            </LinearGradient>

            <View style={styles.bottomSpacer} />
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: '#FFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: SCREEN_HEIGHT * 0.9,
    paddingTop: 20,
    paddingHorizontal: 20,
  },
  closeButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F5F5F5',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 100,
  },
  closeButtonText: {
    fontSize: 20,
    color: '#666',
    fontWeight: '600',
  },
  insufficientCoinsCard: {
    backgroundColor: '#FFF3E0',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFB74D',
  },
  insufficientCoinsIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  insufficientCoinsTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#E65100',
    marginBottom: 8,
  },
  insufficientCoinsText: {
    fontSize: 16,
    color: '#555',
    textAlign: 'center',
    marginBottom: 4,
  },
  insufficientCoinsSubtext: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    borderRadius: 16,
    marginBottom: 20,
    shadowColor: '#5E35B1',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  headerIcon: {
    fontSize: 40,
    marginRight: 12,
  },
  headerTextContainer: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#FFF',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    fontWeight: '600',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#333',
    marginBottom: 16,
    marginLeft: 4,
  },
  tiersContainer: {
    paddingRight: 20,
    gap: 16,
  },
  tierCard: {
    width: SCREEN_WIDTH * 0.7,
    marginRight: 16,
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  tierCardPopular: {
    borderWidth: 3,
    borderColor: '#FFD700',
  },
  popularBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: '#FF5722',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    zIndex: 10,
  },
  popularBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#FFF',
    letterSpacing: 0.5,
  },
  tierGradient: {
    padding: 20,
    alignItems: 'center',
  },
  tierIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  tierTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#333',
    marginBottom: 8,
  },
  tierCoins: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FF9800',
    marginBottom: 16,
  },
  featuresContainer: {
    width: '100%',
    marginBottom: 16,
  },
  featureItem: {
    fontSize: 14,
    color: '#555',
    marginVertical: 4,
    fontWeight: '600',
  },
  tierButton: {
    backgroundColor: '#7E57C2',
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 12,
    shadowColor: '#5E35B1',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 4,
    elevation: 4,
  },
  tierButtonText: {
    fontSize: 18,
    fontWeight: '800',
    color: '#FFF',
  },
  featuresSection: {
    marginTop: 24,
  },
  featuresList: {
    backgroundColor: '#F5F5F5',
    borderRadius: 16,
    padding: 16,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  featureIcon: {
    fontSize: 24,
    marginRight: 12,
    width: 32,
  },
  featureText: {
    fontSize: 16,
    color: '#333',
    fontWeight: '600',
    flex: 1,
  },
  subscriptionCard: {
    marginTop: 24,
    padding: 24,
    borderRadius: 20,
    alignItems: 'center',
    shadowColor: '#FFA500',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 8,
  },
  subscriptionIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  subscriptionTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#FFF',
    marginBottom: 8,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  subscriptionPrice: {
    fontSize: 32,
    fontWeight: '800',
    color: '#FFF',
    marginBottom: 16,
  },
  subscriptionFeatures: {
    width: '100%',
    marginBottom: 20,
  },
  subscriptionFeature: {
    fontSize: 16,
    color: '#FFF',
    fontWeight: '600',
    marginVertical: 4,
    textAlign: 'center',
  },
  subscriptionButton: {
    backgroundColor: '#FFF',
    paddingHorizontal: 40,
    paddingVertical: 14,
    borderRadius: 12,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  subscriptionButtonText: {
    fontSize: 18,
    fontWeight: '800',
    color: '#FF9800',
  },
  subscriptionNote: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.9)',
    fontStyle: 'italic',
  },
  bottomSpacer: {
    height: 40,
  },
});
