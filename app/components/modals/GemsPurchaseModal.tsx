import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, ScrollView, ActivityIndicator, Dimensions } from 'react-native';
import { getGemOfferings, purchaseGemPackage, GEM_AMOUNTS } from '../../../lib/revenueCat';
import { PurchasesPackage } from 'react-native-purchases';
import { useQuillbyStore } from '../../state/store-modular';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface GemsPurchaseModalProps {
  visible: boolean;
  onClose: () => void;
  onPurchaseSuccess?: (gemsGranted: number) => void;
  requiredGems?: number; // Optional: show how many gems are needed
}

export default function GemsPurchaseModal({ 
  visible, 
  onClose, 
  onPurchaseSuccess,
  requiredGems 
}: GemsPurchaseModalProps) {
  const [packages, setPackages] = useState<PurchasesPackage[]>([]);
  const [loading, setLoading] = useState(true);
  const [purchasingPackageId, setPurchasingPackageId] = useState<string | null>(null); // Track which package is being purchased
  const userData = useQuillbyStore((state) => state.userData);
  const addGems = useQuillbyStore((state) => state.addGems);

  useEffect(() => {
    if (visible) {
      loadGemPackages();
    }
  }, [visible]);

  const loadGemPackages = async () => {
    try {
      setLoading(true);
      const offering = await getGemOfferings();
      
      if (offering && offering.availablePackages.length > 0) {
        // Sort packages by gem amount (ascending)
        const sortedPackages = offering.availablePackages.sort((a, b) => {
          const gemsA = GEM_AMOUNTS[a.product.identifier] || 0;
          const gemsB = GEM_AMOUNTS[b.product.identifier] || 0;
          return gemsA - gemsB;
        });
        setPackages(sortedPackages);
      } else {
        console.warn('[GemsPurchaseModal] No gem packages available');
      }
    } catch (error) {
      console.error('[GemsPurchaseModal] Failed to load packages:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePurchase = async (pkg: PurchasesPackage) => {
    try {
      setPurchasingPackageId(pkg.product.identifier);
      console.log('[GemsPurchaseModal] Purchasing:', pkg.product.identifier);
      
      // Get user ID (you may need to adjust this based on your auth system)
      const userId = userData.userId || 'anonymous';
      
      const result = await purchaseGemPackage(pkg, userId);
      
      if (result.success && result.gems) {
        console.log('[GemsPurchaseModal] Purchase successful!', result.gems, 'gems');
        
        // Add gems to user's account
        addGems(result.gems, `Purchased ${pkg.product.identifier}`);
        
        // Call success callback
        if (onPurchaseSuccess) {
          onPurchaseSuccess(result.gems);
        }
        
        // Close modal
        onClose();
      } else {
        console.error('[GemsPurchaseModal] Purchase failed:', result.error);
        alert(result.error || 'Purchase failed. Please try again.');
      }
    } catch (error) {
      console.error('[GemsPurchaseModal] Purchase error:', error);
      alert('Purchase failed. Please try again.');
    } finally {
      setPurchasingPackageId(null);
    }
  };

  const getGemAmount = (productId: string): number => {
    return GEM_AMOUNTS[productId] || 0;
  };

  const getBestValue = (): string | null => {
    // Mark the largest package as "Best Value"
    if (packages.length === 0) return null;
    return packages[packages.length - 1].product.identifier;
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modal}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>💎 Purchase Gems</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Text style={styles.closeButtonText}>✕</Text>
            </TouchableOpacity>
          </View>

          {/* Current Gems */}
          <View style={styles.currentGemsContainer}>
            <Text style={styles.currentGemsLabel}>Your Gems:</Text>
            <Text style={styles.currentGemsValue}>💎 {userData.gems || 0}</Text>
          </View>

          {/* Required Gems (if specified) */}
          {requiredGems && requiredGems > (userData.gems || 0) && (
            <View style={styles.requiredGemsContainer}>
              <Text style={styles.requiredGemsText}>
                You need {requiredGems - (userData.gems || 0)} more gems for this item
              </Text>
            </View>
          )}

          {/* Loading State */}
          {loading && (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#7E57C2" />
              <Text style={styles.loadingText}>Loading gem packages...</Text>
            </View>
          )}

          {/* Gem Packages */}
          {!loading && packages.length > 0 && (
            <View style={styles.packagesGrid}>
              {packages.map((pkg) => {
                const gems = getGemAmount(pkg.product.identifier);
                const isBestValue = pkg.product.identifier === getBestValue();
                const isPurchasing = purchasingPackageId === pkg.product.identifier;
                
                return (
                  <TouchableOpacity
                    key={pkg.identifier}
                    style={[
                      styles.packageCard,
                      isBestValue && styles.packageCardBestValue
                    ]}
                    onPress={() => handlePurchase(pkg)}
                    disabled={purchasingPackageId !== null}
                  >
                    {isBestValue && (
                      <View style={styles.bestValueBadge}>
                        <Text style={styles.bestValueText}>BEST</Text>
                      </View>
                    )}
                    
                    <Text style={styles.gemIconLarge}>💎</Text>
                    <Text style={styles.gemAmount}>{gems}</Text>
                    <Text style={styles.packagePrice}>{pkg.product.priceString}</Text>
                    
                    {isPurchasing ? (
                      <ActivityIndicator size="small" color="#7E57C2" style={styles.buyButton} />
                    ) : (
                      <View style={styles.buyButton}>
                        <Text style={styles.buyButtonText}>Buy</Text>
                      </View>
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
          )}

          {/* No Packages Available */}
          {!loading && packages.length === 0 && (
            <View style={styles.noPackagesContainer}>
              <Text style={styles.noPackagesText}>No gem packages available</Text>
              <Text style={styles.noPackagesSubtext}>Please try again later</Text>
            </View>
          )}

          {/* Info Text */}
          <Text style={styles.infoText}>
            Gems can be used to purchase premium items in the shop
          </Text>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modal: {
    width: SCREEN_WIDTH * 0.9,
    maxHeight: '75%',
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  title: {
    fontSize: 20,
    fontFamily: 'ChakraPetch_700Bold',
    color: '#7E57C2',
  },
  closeButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 18,
    color: '#666',
  },
  currentGemsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F3E5F5',
    padding: 10,
    borderRadius: 10,
    marginBottom: 10,
  },
  currentGemsLabel: {
    fontSize: 13,
    fontFamily: 'ChakraPetch_600SemiBold',
    color: '#7E57C2',
  },
  currentGemsValue: {
    fontSize: 16,
    fontFamily: 'ChakraPetch_700Bold',
    color: '#7E57C2',
  },
  requiredGemsContainer: {
    backgroundColor: '#FFF3E0',
    padding: 8,
    borderRadius: 8,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#FF9800',
  },
  requiredGemsText: {
    fontSize: 11,
    fontFamily: 'ChakraPetch_600SemiBold',
    color: '#E65100',
    textAlign: 'center',
  },
  loadingContainer: {
    padding: 30,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 13,
    fontFamily: 'ChakraPetch_400Regular',
    color: '#666',
  },
  packagesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 10,
  },
  packageCard: {
    width: (SCREEN_WIDTH * 0.9 - 32 - 10) / 2, // (modal width - padding - gap) / 2 columns
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
    minHeight: 140,
    justifyContent: 'space-between',
  },
  packageCardBestValue: {
    borderColor: '#7E57C2',
    backgroundColor: '#F3E5F5',
  },
  bestValueBadge: {
    position: 'absolute',
    top: -6,
    right: 8,
    backgroundColor: '#7E57C2',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  bestValueText: {
    fontSize: 9,
    fontFamily: 'ChakraPetch_700Bold',
    color: '#FFF',
    letterSpacing: 0.5,
  },
  gemIconLarge: {
    fontSize: 32,
    marginBottom: 4,
  },
  gemAmount: {
    fontSize: 16,
    fontFamily: 'ChakraPetch_700Bold',
    color: '#333',
    marginBottom: 4,
  },
  packagePrice: {
    fontSize: 14,
    fontFamily: 'ChakraPetch_700Bold',
    color: '#7E57C2',
    marginBottom: 8,
  },
  buyButton: {
    backgroundColor: '#7E57C2',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 8,
    minWidth: 60,
    alignItems: 'center',
  },
  buyButtonText: {
    fontSize: 13,
    fontFamily: 'ChakraPetch_700Bold',
    color: '#FFF',
  },
  noPackagesContainer: {
    padding: 30,
    alignItems: 'center',
  },
  noPackagesText: {
    fontSize: 15,
    fontFamily: 'ChakraPetch_600SemiBold',
    color: '#666',
    marginBottom: 6,
  },
  noPackagesSubtext: {
    fontSize: 11,
    fontFamily: 'ChakraPetch_400Regular',
    color: '#999',
  },
  infoText: {
    fontSize: 10,
    fontFamily: 'ChakraPetch_400Regular',
    color: '#999',
    textAlign: 'center',
    marginTop: 10,
  },
});
