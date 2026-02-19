import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, Image, ScrollView } from 'react-native';

interface PremiumUpgradeModalProps {
  visible: boolean;
  onClose: () => void;
  onUpgrade: () => void;
  featureName?: string;
}

export default function PremiumUpgradeModal({ 
  visible, 
  onClose, 
  onUpgrade,
  featureName = 'this feature'
}: PremiumUpgradeModalProps) {
  const [selectedPlan, setSelectedPlan] = React.useState<'monthly' | 'yearly' | 'lifetime'>('yearly');
  
  const plans = [
    {
      id: 'monthly' as const,
      icon: '💳',
      name: 'MONTHLY',
      price: '$4.99/month',
      description: 'Billed monthly • Cancel anytime',
      badge: null,
    },
    {
      id: 'yearly' as const,
      icon: '🌟',
      name: 'YEARLY - BEST VALUE!',
      price: '$29.99/year',
      description: 'Save 50% = Only $2.50/month',
      badge: '⭐ Most Popular',
    },
    {
      id: 'lifetime' as const,
      icon: '💎',
      name: 'LIFETIME',
      price: '$49.99 one-time',
      description: 'Pay once, own forever!',
      badge: 'Best for superfans',
    },
  ];
  
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          {/* Close Button - Always visible at top */}
          <TouchableOpacity
            style={styles.closeButton}
            onPress={onClose}
            activeOpacity={0.8}
          >
            <Text style={styles.closeButtonText}>✕</Text>
          </TouchableOpacity>
          
          {/* Premium Badge */}
          <View style={styles.premiumBadge}>
            <Text style={styles.premiumBadgeText}>⭐ PREMIUM</Text>
          </View>
          
          {/* Hamster Image */}
          <Image
            source={require('../../../assets/hamsters/casual/idle-sit-happy.png')}
            style={styles.hamsterImage}
            resizeMode="contain"
          />
          
          {/* Title */}
          <Text style={styles.title}>💪 ACHIEVE MORE WITH PREMIUM</Text>
          
          {/* Scrollable Content */}
          <ScrollView 
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {/* Features List */}
            <View style={styles.featuresContainer}>
              <View style={styles.featureItem}>
                <Text style={styles.featureIcon}>🎯</Text>
                <View style={styles.featureTextContainer}>
                  <Text style={styles.featureTitle}>Study Smarter</Text>
                  <Text style={styles.featureDescription}>
                    Customize your focus sessions to match your perfect rhythm.
                  </Text>
                </View>
              </View>
              
              <View style={styles.featureItem}>
                <Text style={styles.featureIcon}>💰</Text>
                <View style={styles.featureTextContainer}>
                  <Text style={styles.featureTitle}>Earn Faster</Text>
                  <Text style={styles.featureDescription}>
                    Get 2× gems and 2× Q-Coins on everything you do.
                  </Text>
                </View>
              </View>
              
              <View style={styles.featureItem}>
                <Text style={styles.featureIcon}>☕</Text>
                <View style={styles.featureTextContainer}>
                  <Text style={styles.featureTitle}>Never Stop</Text>
                  <Text style={styles.featureDescription}>
                    Unlimited coffee and apple energy boosts.
                  </Text>
                </View>
              </View>
              
              <View style={styles.featureItem}>
                <Text style={styles.featureIcon}>🎨</Text>
                <View style={styles.featureTextContainer}>
                  <Text style={styles.featureTitle}>Express Yourself</Text>
                  <Text style={styles.featureDescription}>
                    Access exclusive decorations, themes, and Quillby skins.
                  </Text>
                </View>
              </View>
            </View>
            
            {/* Pricing Section */}
            <View style={styles.pricingSection}>
              <Text style={styles.pricingSectionTitle}>CHOOSE YOUR PLAN:</Text>
              
              {plans.map((plan) => (
                <TouchableOpacity
                  key={plan.id}
                  style={[
                    styles.planCard,
                    selectedPlan === plan.id && styles.planCardSelected,
                    plan.id === 'yearly' && styles.planCardBestValue,
                  ]}
                  onPress={() => setSelectedPlan(plan.id)}
                  activeOpacity={0.8}
                >
                  <View style={styles.planHeader}>
                    <Text style={styles.planIcon}>{plan.icon}</Text>
                    <Text style={[
                      styles.planName,
                      plan.id === 'yearly' && styles.planNameBestValue,
                    ]}>
                      {plan.name}
                    </Text>
                  </View>
                  
                  <Text style={styles.planPrice}>{plan.price}</Text>
                  <Text style={styles.planDescription}>{plan.description}</Text>
                  
                  {plan.badge && (
                    <View style={styles.planBadge}>
                      <Text style={styles.planBadgeText}>{plan.badge}</Text>
                    </View>
                  )}
                  
                  <View style={styles.planSelectButton}>
                    <Text style={styles.planSelectButtonText}>
                      {selectedPlan === plan.id ? '✓ Selected' : `Select ${plan.name.split(' ')[0]}`}
                    </Text>
                  </View>
                </TouchableOpacity>
              ))}
              
              <View style={styles.trialBanner}>
                <Text style={styles.trialBannerText}>
                  🎁 7-Day FREE Trial - No credit card required!
                </Text>
              </View>
            </View>
            
            {/* Price */}
            <View style={styles.priceContainer}>
              <Text style={styles.priceLabel}>
                {selectedPlan === 'monthly' ? 'Monthly subscription' : 
                 selectedPlan === 'yearly' ? 'Yearly subscription' : 
                 'One-time payment'}
              </Text>
              <Text style={styles.price}>
                {selectedPlan === 'monthly' ? '$4.99' : 
                 selectedPlan === 'yearly' ? '$29.99' : 
                 '$49.99'}
              </Text>
              <Text style={styles.priceSubtext}>
                {selectedPlan === 'lifetime' ? 'Lifetime access • No subscription' : 'Cancel anytime'}
              </Text>
            </View>
          </ScrollView>
          
          {/* Buttons - Fixed at bottom */}
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={styles.upgradeButton}
              onPress={onUpgrade}
              activeOpacity={0.8}
            >
              <Text style={styles.upgradeButtonText}>⭐ Upgrade to Premium</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={onClose}
              activeOpacity={0.8}
            >
              <Text style={styles.cancelButtonText}>Maybe Later</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  container: {
    backgroundColor: '#FFF',
    borderRadius: 24,
    width: '100%',
    maxWidth: 400,
    maxHeight: '90%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 10,
    overflow: 'hidden',
  },
  closeButton: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 100,
  },
  closeButtonText: {
    fontSize: 24,
    color: '#666',
    fontWeight: '600',
  },
  premiumBadge: {
    backgroundColor: '#FFD700',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginTop: 24,
    marginBottom: 16,
    alignSelf: 'center',
  },
  premiumBadgeText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#000',
    letterSpacing: 1,
  },
  hamsterImage: {
    width: 100,
    height: 100,
    marginBottom: 16,
    alignSelf: 'center',
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#333',
    marginBottom: 16,
    textAlign: 'center',
    paddingHorizontal: 24,
  },
  scrollView: {
    maxHeight: 400,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingBottom: 16,
  },
  featuresContainer: {
    width: '100%',
    marginBottom: 20,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  featureIcon: {
    fontSize: 24,
    marginRight: 12,
    width: 32,
  },
  featureTextContainer: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#333',
    marginBottom: 2,
  },
  featureDescription: {
    fontSize: 13,
    color: '#666',
    lineHeight: 18,
  },
  pricingSection: {
    width: '100%',
    marginBottom: 16,
  },
  pricingSectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333',
    marginBottom: 12,
    textAlign: 'center',
  },
  planCard: {
    backgroundColor: '#F5F5F5',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: '#E0E0E0',
  },
  planCardSelected: {
    borderColor: '#FFD700',
    backgroundColor: '#FFFBF0',
  },
  planCardBestValue: {
    borderColor: '#FF9800',
    backgroundColor: '#FFF8E1',
  },
  planHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  planIcon: {
    fontSize: 24,
    marginRight: 8,
  },
  planName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333',
    flex: 1,
  },
  planNameBestValue: {
    color: '#FF9800',
  },
  planPrice: {
    fontSize: 22,
    fontWeight: '700',
    color: '#333',
    marginBottom: 4,
  },
  planDescription: {
    fontSize: 13,
    color: '#666',
    marginBottom: 8,
  },
  planBadge: {
    backgroundColor: '#FFD700',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
    marginBottom: 8,
  },
  planBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#000',
  },
  planSelectButton: {
    backgroundColor: '#FFD700',
    borderRadius: 12,
    paddingVertical: 10,
    alignItems: 'center',
  },
  planSelectButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#000',
  },
  trialBanner: {
    backgroundColor: '#E8F5E9',
    borderRadius: 12,
    padding: 12,
    marginTop: 4,
    borderWidth: 2,
    borderColor: '#4CAF50',
  },
  trialBannerText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2E7D32',
    textAlign: 'center',
  },
  priceContainer: {
    width: '100%',
    backgroundColor: '#F5F5F5',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    alignItems: 'center',
  },
  priceLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  price: {
    fontSize: 36,
    fontWeight: '700',
    color: '#FF9800',
    marginBottom: 4,
  },
  priceSubtext: {
    fontSize: 12,
    color: '#999',
  },
  buttonContainer: {
    paddingHorizontal: 24,
    paddingBottom: 24,
    paddingTop: 8,
    backgroundColor: '#FFF',
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  upgradeButton: {
    backgroundColor: '#FFD700',
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 32,
    width: '100%',
    alignItems: 'center',
    marginBottom: 12,
    shadowColor: '#FFD700',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  upgradeButtonText: {
    color: '#000',
    fontSize: 18,
    fontWeight: '700',
  },
  cancelButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#999',
    fontSize: 16,
    fontWeight: '600',
  },
});
