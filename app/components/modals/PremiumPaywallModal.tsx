// Premium Paywall Modal - RevenueCat Integration
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Dimensions,
  Alert,
} from 'react-native';
import { PurchasesPackage } from 'react-native-purchases';
import { getOfferings, purchasePremium, restorePurchases } from '../../../lib/revenueCat';
import { useQuillbyStore } from '../../state/store-modular';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface PremiumPaywallModalProps {
  visible: boolean;
  onClose: () => void;
  onPurchaseSuccess?: () => void;
}

export default function PremiumPaywallModal({
  visible,
  onClose,
  onPurchaseSuccess,
}: PremiumPaywallModalProps) {
  const setPremiumStatus = useQuillbyStore((state) => state.setPremiumStatus);
  const [packages, setPackages] = useState<PurchasesPackage[]>([]);
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState<PurchasesPackage | null>(null);

  // Load available products
  useEffect(() => {
    if (visible) {
      loadProducts();
    }
  }, [visible]);

  const loadProducts = async () => {
    try {
      setLoading(true);
      console.log('[Paywall] Loading offerings...');
      const offering = await getOfferings();

      if (offering && offering.availablePackages.length > 0) {
        console.log('[Paywall] Found', offering.availablePackages.length, 'packages');
        setPackages(offering.availablePackages);

        // Auto-select monthly package if available
        const monthly = offering.availablePackages.find((p) =>
          p.product.identifier.toLowerCase().includes('monthly')
        );
        if (monthly) {
          setSelectedPackage(monthly);
        } else if (offering.availablePackages.length > 0) {
          setSelectedPackage(offering.availablePackages[0]);
        }
      } else {
        console.warn('[Paywall] No premium packages available');
        Alert.alert(
          'Setup Required',
          'Premium subscriptions are not configured yet. Please set up products in RevenueCat.',
          [{ text: 'OK' }]
        );
      }
    } catch (error) {
      console.error('[Paywall] Failed to load offerings:', error);
      Alert.alert(
        'Connection Error', 
        'Failed to load premium options. Please check your internet connection.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handlePurchase = async () => {
    if (!selectedPackage) {
      Alert.alert('Error', 'Please select a subscription plan');
      return;
    }

    try {
      setPurchasing(true);
      
      // Get authenticated user ID
      const { getDeviceUser } = await import('../../../lib/deviceAuth');
      const user = await getDeviceUser();
      
      if (!user) {
        Alert.alert('Error', 'Please sign in to make a purchase');
        return;
      }
      
      const result = await purchasePremium(selectedPackage, user.id);

      if (result.success) {
        // Update local state
        setPremiumStatus(true);

        Alert.alert(
          '🎉 Welcome to Premium!',
          'You now have access to all premium features including legendary themes, exclusive items, and extended focus sessions!',
          [
            {
              text: 'Awesome!',
              onPress: () => {
                onPurchaseSuccess?.();
                onClose();
              },
            },
          ]
        );
      } else {
        if (result.error !== 'Purchase cancelled') {
          Alert.alert('Purchase Failed', result.error || 'Something went wrong');
        }
      }
    } catch (error: any) {
      console.error('[Paywall] Purchase error:', error);
      Alert.alert('Error', error.message || 'Failed to complete purchase');
    } finally {
      setPurchasing(false);
    }
  };

  const handleRestore = async () => {
    try {
      setPurchasing(true);
      
      // Get authenticated user ID
      const { getDeviceUser } = await import('../../../lib/deviceAuth');
      const user = await getDeviceUser();
      
      if (!user) {
        Alert.alert('Error', 'Please sign in to restore purchases');
        return;
      }
      
      const result = await restorePurchases(user.id);

      if (result.success) {
        if (result.isPremium) {
          setPremiumStatus(true);
          Alert.alert(
            '✅ Purchases Restored',
            'Your premium subscription has been restored!',
            [
              {
                text: 'Great!',
                onPress: () => {
                  onPurchaseSuccess?.();
                  onClose();
                },
              },
            ]
          );
        } else {
          Alert.alert(
            'No Purchases Found',
            'We couldn\'t find any previous purchases to restore.'
          );
        }
      } else {
        Alert.alert('Restore Failed', result.error || 'Failed to restore purchases');
      }
    } catch (error: any) {
      console.error('[Paywall] Restore error:', error);
      Alert.alert('Error', error.message || 'Failed to restore purchases');
    } finally {
      setPurchasing(false);
    }
  };

  const formatPrice = (pkg: PurchasesPackage): string => {
    return pkg.product.priceString;
  };

  const getPeriodText = (pkg: PurchasesPackage): string => {
    const productId = pkg.product.identifier.toLowerCase();
    if (productId.includes('monthly')) return 'per month';
    if (productId.includes('yearly')) return 'per year';
    return '';
  };

  const getSavingsText = (pkg: PurchasesPackage): string | null => {
    const productId = pkg.product.identifier.toLowerCase();
    if (productId.includes('yearly')) {
      return 'Save 30%';
    }
    return null;
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={true}>
      <View style={styles.overlay}>
        <View style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.headerTitle}>✨ Upgrade to Premium</Text>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={onClose}
              disabled={purchasing}
            >
              <Text style={styles.closeButtonText}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            {/* Premium Benefits */}
            <View style={styles.benefitsSection}>
              <Text style={styles.sectionTitle}>Premium Benefits</Text>

              <View style={styles.benefit}>
                <Text style={styles.benefitIcon}>🎨</Text>
                <View style={styles.benefitText}>
                  <Text style={styles.benefitTitle}>Legendary Themes</Text>
                  <Text style={styles.benefitDescription}>
                    Galaxy, Japanese Zen, and Ocean themes
                  </Text>
                </View>
              </View>

              <View style={styles.benefit}>
                <Text style={styles.benefitIcon}>🛍️</Text>
                <View style={styles.benefitText}>
                  <Text style={styles.benefitTitle}>Exclusive Shop Items</Text>
                  <Text style={styles.benefitDescription}>
                    Access premium furniture, plants, and decorations
                  </Text>
                </View>
              </View>

              <View style={styles.benefit}>
                <Text style={styles.benefitIcon}>⏰</Text>
                <View style={styles.benefitText}>
                  <Text style={styles.benefitTitle}>Extended Focus Sessions</Text>
                  <Text style={styles.benefitDescription}>
                    Study for up to 120 minutes per session
                  </Text>
                </View>
              </View>

              <View style={styles.benefit}>
                <Text style={styles.benefitIcon}>🎁</Text>
                <View style={styles.benefitText}>
                  <Text style={styles.benefitTitle}>Future Premium Features</Text>
                  <Text style={styles.benefitDescription}>
                    Early access to new features and content
                  </Text>
                </View>
              </View>

              <View style={styles.benefit}>
                <Text style={styles.benefitIcon}>💰</Text>
                <View style={styles.benefitText}>
                  <Text style={styles.benefitTitle}>Best Value</Text>
                  <Text style={styles.benefitDescription}>
                    Save up to 30% with yearly plan
                  </Text>
                </View>
              </View>
            </View>

            {/* Subscription Plans */}
            <View style={styles.plansSection}>
              {loading ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="large" color="#FF9800" />
                  <Text style={styles.loadingText}>Loading plans...</Text>
                </View>
              ) : packages.length === 0 ? (
                <View style={styles.errorContainer}>
                  <Text style={styles.errorIcon}>⚠️</Text>
                  <Text style={styles.errorTitle}>No Plans Available</Text>
                  <Text style={styles.errorText}>
                    Premium subscriptions are not configured yet.
                  </Text>
                  <Text style={styles.errorSubtext}>
                    This happens when:{'\n'}
                    • Products aren't set up in RevenueCat{'\n'}
                    • Using a test API key without products{'\n'}
                    • No internet connection
                  </Text>
                  <TouchableOpacity 
                    style={styles.retryButton}
                    onPress={loadProducts}
                  >
                    <Text style={styles.retryButtonText}>Try Again</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <>
                  <Text style={styles.sectionTitle}>Choose Your Plan</Text>
                  {packages.map((pkg) => {
                  const isSelected = selectedPackage?.identifier === pkg.identifier;
                  const savings = getSavingsText(pkg);

                  return (
                    <TouchableOpacity
                      key={pkg.identifier}
                      style={[styles.planCard, isSelected && styles.planCardSelected]}
                      onPress={() => setSelectedPackage(pkg)}
                      disabled={purchasing}
                    >
                      {savings && (
                        <View style={styles.savingsBadge}>
                          <Text style={styles.savingsText}>{savings}</Text>
                        </View>
                      )}

                      <View style={styles.planHeader}>
                        <Text style={styles.planTitle}>
                          {pkg.product.identifier.includes('yearly') ? 'Yearly' : 'Monthly'}
                        </Text>
                        <View style={styles.radioButton}>
                          {isSelected && <View style={styles.radioButtonInner} />}
                        </View>
                      </View>

                      <Text style={styles.planPrice}>{formatPrice(pkg)}</Text>
                      <Text style={styles.planPeriod}>{getPeriodText(pkg)}</Text>
                    </TouchableOpacity>
                  );
                })}
                </>
              )}
            </View>

            {/* Purchase Button */}
            <TouchableOpacity
              style={[
                styles.purchaseButton,
                (purchasing || !selectedPackage) && styles.purchaseButtonDisabled,
              ]}
              onPress={handlePurchase}
              disabled={purchasing || !selectedPackage}
            >
              {purchasing ? (
                <ActivityIndicator color="#FFF" />
              ) : (
                <Text style={styles.purchaseButtonText}>
                  Subscribe Now
                </Text>
              )}
            </TouchableOpacity>

            {/* Restore Button */}
            <TouchableOpacity
              style={styles.restoreButton}
              onPress={handleRestore}
              disabled={purchasing}
            >
              <Text style={styles.restoreButtonText}>Restore Purchases</Text>
            </TouchableOpacity>

            {/* Terms */}
            <Text style={styles.termsText}>
              Subscription automatically renews unless auto-renew is turned off at least
              24 hours before the end of the current period. Payment will be charged to
              your Google Play account at confirmation of purchase.
            </Text>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'flex-end',
  },
  container: {
    backgroundColor: '#FFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    height: SCREEN_HEIGHT * 0.9,
    paddingBottom: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#333',
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F5F5F5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeButtonText: {
    fontSize: 20,
    color: '#666',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  benefitsSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
    marginBottom: 16,
  },
  benefit: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  benefitIcon: {
    fontSize: 28,
    marginRight: 12,
  },
  benefitText: {
    flex: 1,
  },
  benefitTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  benefitDescription: {
    fontSize: 14,
    color: '#666',
  },
  plansSection: {
    marginBottom: 24,
  },
  loadingContainer: {
    padding: 40,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#666',
  },
  errorContainer: {
    padding: 20,
    alignItems: 'center',
  },
  errorIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
    marginBottom: 8,
  },
  errorText: {
    fontSize: 14,
    color: '#E53935',
    textAlign: 'center',
    marginBottom: 12,
  },
  errorSubtext: {
    fontSize: 12,
    color: '#666',
    textAlign: 'left',
    lineHeight: 18,
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: '#FF9800',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  retryButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFF',
  },
  planCard: {
    backgroundColor: '#F5F5F5',
    borderRadius: 16,
    padding: 20,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: 'transparent',
    position: 'relative',
  },
  planCardSelected: {
    backgroundColor: '#FFF3E0',
    borderColor: '#FF9800',
  },
  savingsBadge: {
    position: 'absolute',
    top: -8,
    right: 16,
    backgroundColor: '#4CAF50',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  savingsText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFF',
  },
  planHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  planTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
  },
  radioButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#FF9800',
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioButtonInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#FF9800',
  },
  planPrice: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FF9800',
    marginBottom: 4,
  },
  planPeriod: {
    fontSize: 14,
    color: '#666',
  },
  purchaseButton: {
    backgroundColor: '#FF9800',
    borderRadius: 16,
    padding: 18,
    alignItems: 'center',
    marginBottom: 12,
    shadowColor: '#FF9800',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  purchaseButtonDisabled: {
    backgroundColor: '#BDBDBD',
    shadowOpacity: 0,
  },
  purchaseButtonText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFF',
  },
  restoreButton: {
    padding: 12,
    alignItems: 'center',
    marginBottom: 16,
  },
  restoreButtonText: {
    fontSize: 14,
    color: '#FF9800',
    fontWeight: '600',
  },
  termsText: {
    fontSize: 11,
    color: '#999',
    textAlign: 'center',
    lineHeight: 16,
  },
});
