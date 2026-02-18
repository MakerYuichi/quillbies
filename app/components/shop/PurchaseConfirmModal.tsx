import React from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, Dimensions, Image } from 'react-native';
import { BlurView } from 'expo-blur';
import { getRarityColor } from '../../core/shopItems';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface PurchaseConfirmModalProps {
  visible: boolean;
  item: {
    id: string;
    name: string;
    icon: string;
    rarity: string;
    price: number;
    gemPrice?: number;
    category: string;
  } | null;
  useGems: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function PurchaseConfirmModal({ 
  visible, 
  item, 
  useGems, 
  onConfirm, 
  onCancel 
}: PurchaseConfirmModalProps) {
  if (!item) return null;

  const [color1, color2] = getRarityColor(item.rarity);
  const price = useGems ? item.gemPrice : item.price;
  const currencyName = useGems ? 'gems' : 'QBies';
  const currencyIcon = useGems ? '💎' : '🪙';

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onCancel}
    >
      <BlurView intensity={40} style={styles.overlay}>
        <TouchableOpacity 
          style={styles.backdrop} 
          activeOpacity={1} 
          onPress={onCancel}
        />
        
        <View style={styles.modalContainer}>
          {/* Rarity glow effect - using positioned colored layer */}
          <View 
            style={[
              styles.glowEffect,
              { 
                backgroundColor: color1,
              }
            ]} 
          />
          
          <View style={[styles.modal, { borderColor: color1 }]}>
            {/* Item Icon */}
            <View style={styles.iconContainer}>
              <Text style={styles.itemIcon}>{item.icon}</Text>
            </View>
            
            {/* Item Name */}
            <Text style={styles.itemName}>{item.name}</Text>
            
            {/* Rarity Badge */}
            <View style={[styles.rarityBadge, { backgroundColor: color1 }]}>
              <Text style={styles.rarityText}>
                {item.rarity.charAt(0).toUpperCase() + item.rarity.slice(1)}
              </Text>
            </View>
            
            {/* Divider */}
            <View style={styles.divider} />
            
            {/* Purchase Question */}
            <Text style={styles.questionText}>Purchase this item?</Text>
            
            {/* Price Display */}
            <View style={styles.priceContainer}>
              {useGems ? (
                <View style={styles.priceRow}>
                  <Text style={styles.gemIconLarge}>💎</Text>
                  <Text style={styles.priceAmount}>{price}</Text>
                  <Text style={styles.currencyLabel}>{currencyName}</Text>
                </View>
              ) : (
                <View style={styles.priceRow}>
                  <Image
                    source={require('../../../assets/overall/qbies.png')}
                    style={styles.currencyIconLarge}
                    resizeMode="contain"
                  />
                  <Text style={styles.priceAmount}>{price}</Text>
                  <Text style={styles.currencyLabel}>{currencyName}</Text>
                </View>
              )}
            </View>
            
            {/* Buttons */}
            <View style={styles.buttonContainer}>
              <TouchableOpacity 
                style={styles.cancelButton}
                onPress={onCancel}
                activeOpacity={0.7}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.confirmButton, { backgroundColor: color1 }]}
                onPress={onConfirm}
                activeOpacity={0.7}
              >
                <Text style={styles.confirmButtonText}>Buy Now</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </BlurView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  modalContainer: {
    width: SCREEN_WIDTH * 0.85,
    maxWidth: 400,
    position: 'relative',
  },
  glowEffect: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    width: 250,
    height: 250,
    borderRadius: 125,
    transform: [{ translateX: -125 }, { translateY: -125 }],
    opacity: 0.25,
    zIndex: -1,
  },
  modal: {
    backgroundColor: '#FFF',
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    borderWidth: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  iconContainer: {
    width: 100,
    height: 100,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  itemIcon: {
    fontSize: 64,
  },
  itemName: {
    fontSize: 20,
    fontFamily: 'ChakraPetch_700Bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 8,
  },
  rarityBadge: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 16,
    marginBottom: 16,
  },
  rarityText: {
    fontSize: 12,
    fontFamily: 'ChakraPetch_700Bold',
    color: '#FFF',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  divider: {
    width: '100%',
    height: 1,
    backgroundColor: '#E0E0E0',
    marginBottom: 16,
  },
  questionText: {
    fontSize: 16,
    fontFamily: 'ChakraPetch_600SemiBold',
    color: '#666',
    marginBottom: 12,
  },
  priceContainer: {
    marginBottom: 24,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  currencyIconLarge: {
    width: 28,
    height: 28,
    marginRight: 8,
  },
  gemIconLarge: {
    fontSize: 28,
    marginRight: 8,
  },
  priceAmount: {
    fontSize: 32,
    fontFamily: 'ChakraPetch_700Bold',
    color: '#333',
    marginRight: 8,
  },
  currencyLabel: {
    fontSize: 16,
    fontFamily: 'ChakraPetch_600SemiBold',
    color: '#666',
  },
  buttonContainer: {
    flexDirection: 'row',
    width: '100%',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: '#F5F5F5',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#E0E0E0',
  },
  cancelButtonText: {
    fontSize: 16,
    fontFamily: 'ChakraPetch_700Bold',
    color: '#666',
  },
  confirmButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  confirmButtonText: {
    fontSize: 16,
    fontFamily: 'ChakraPetch_700Bold',
    color: '#FFF',
  },
});
