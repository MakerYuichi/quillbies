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
  
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
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
          <Text style={styles.title}>Unlock Premium Features!</Text>
          <Text style={styles.subtitle}>
            {featureName} is a premium feature
          </Text>
          
          {/* Features List */}
          <ScrollView style={styles.featuresContainer} showsVerticalScrollIndicator={false}>
            <View style={styles.featureItem}>
              <Text style={styles.featureIcon}>⏱️</Text>
              <Text style={styles.featureText}>Custom focus session durations</Text>
            </View>
            
            <View style={styles.featureItem}>
              <Text style={styles.featureIcon}>☕</Text>
              <Text style={styles.featureText}>Unlimited coffee & apple boosts</Text>
            </View>
            
            <View style={styles.featureItem}>
              <Text style={styles.featureIcon}>🎨</Text>
              <Text style={styles.featureText}>Exclusive room decorations</Text>
            </View>
            
            <View style={styles.featureItem}>
              <Text style={styles.featureIcon}>🏃</Text>
              <Text style={styles.featureText}>Custom exercise durations</Text>
            </View>
            
            <View style={styles.featureItem}>
              <Text style={styles.featureIcon}>📊</Text>
              <Text style={styles.featureText}>Advanced statistics & insights</Text>
            </View>
            
            <View style={styles.featureItem}>
              <Text style={styles.featureIcon}>💎</Text>
              <Text style={styles.featureText}>Support indie development</Text>
            </View>
          </ScrollView>
          
          {/* Price */}
          <View style={styles.priceContainer}>
            <Text style={styles.priceLabel}>One-time payment</Text>
            <Text style={styles.price}>$4.99</Text>
            <Text style={styles.priceSubtext}>Lifetime access • No subscription</Text>
          </View>
          
          {/* Buttons */}
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
    padding: 24,
    width: '100%',
    maxWidth: 400,
    maxHeight: '90%',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 10,
  },
  premiumBadge: {
    backgroundColor: '#FFD700',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginBottom: 16,
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
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    color: '#333',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 24,
    textAlign: 'center',
  },
  featuresContainer: {
    width: '100%',
    maxHeight: 200,
    marginBottom: 20,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    paddingHorizontal: 8,
  },
  featureIcon: {
    fontSize: 24,
    marginRight: 12,
    width: 32,
  },
  featureText: {
    fontSize: 15,
    color: '#333',
    flex: 1,
  },
  priceContainer: {
    width: '100%',
    backgroundColor: '#F5F5F5',
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
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
  },
  cancelButtonText: {
    color: '#999',
    fontSize: 16,
    fontWeight: '600',
  },
});
