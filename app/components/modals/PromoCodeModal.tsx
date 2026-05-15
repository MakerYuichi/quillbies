import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useQuillbyStore } from '../../state/store-modular';
import { getOrCreateDeviceId } from '../../../lib/deviceAuth';
import { redeemPromoCode } from '../../../lib/promoCodes';

interface Props {
  visible: boolean;
  onClose: () => void;
}

export default function PromoCodeModal({ visible, onClose }: Props) {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);

  const addGems = useQuillbyStore((state) => state.addGems);
  const addQCoins = useQuillbyStore((state) => state.addQCoins);
  const setPremiumStatus = useQuillbyStore((state) => state.setPremiumStatus);

  const handleRedeem = async () => {
    if (!code.trim()) return;
    setLoading(true);
    setResult(null);

    try {
      // Use device ID directly — available offline, no auth needed
      const deviceId = await getOrCreateDeviceId();
      if (!deviceId) {
        setResult({ success: false, message: 'Could not identify your device. Please try again.' });
        return;
      }

      const res = await redeemPromoCode(code, deviceId);

      if (res.success && res.rewardType && res.rewardAmount !== undefined) {
        if (res.rewardType === 'gems') {
          addGems(res.rewardAmount, `promo:${code.trim().toUpperCase()}`);
        } else if (res.rewardType === 'coins') {
          addQCoins(res.rewardAmount, `promo:${code.trim().toUpperCase()}`);
        } else if (res.rewardType === 'premium') {
          setPremiumStatus(true, res.premiumExpiresAt ?? null);
        }
        setResult({ success: true, message: res.message ?? '🎉 Code redeemed!' });
        setCode('');
      } else {
        setResult({ success: false, message: res.error ?? 'Something went wrong.' });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setCode('');
    setResult(null);
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={handleClose}>
      <KeyboardAvoidingView
        style={styles.overlay}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.card}>
          {/* Header */}
          <Text style={styles.title}>🎟️ Redeem Code</Text>
          <Text style={styles.subtitle}>Enter your promo code to claim free Gems or Q-Coins</Text>

          {/* Input */}
          <TextInput
            style={styles.input}
            placeholder="|"
            placeholderTextColor="#AAA"
            value={code}
            onChangeText={(t) => {
              setCode(t.toUpperCase());
              setResult(null);
            }}
            autoCapitalize="characters"
            autoCorrect={false}
            editable={!loading}
            returnKeyType="done"
            onSubmitEditing={handleRedeem}
          />

          {/* Result message */}
          {result && (
            <Text style={[styles.resultText, result.success ? styles.success : styles.error]}>
              {result.message}
            </Text>
          )}

          {/* Buttons */}
          <TouchableOpacity
            style={[styles.redeemBtn, (!code.trim() || loading) && styles.redeemBtnDisabled]}
            onPress={handleRedeem}
            disabled={!code.trim() || loading}
          >
            {loading ? (
              <ActivityIndicator color="#FFF" />
            ) : (
              <Text style={styles.redeemBtnText}>Redeem</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity style={styles.cancelBtn} onPress={handleClose} disabled={loading}>
            <Text style={styles.cancelBtnText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.55)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  card: {
    width: '100%',
    backgroundColor: '#FFF',
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#333',
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 13,
    color: '#888',
    textAlign: 'center',
    marginBottom: 20,
  },
  input: {
    width: '100%',
    borderWidth: 1.5,
    borderColor: '#E0E0E0',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 18,
    fontWeight: '600',
    letterSpacing: 2,
    color: '#333',
    textAlign: 'center',
    marginBottom: 12,
    backgroundColor: '#FAFAFA',
  },
  resultText: {
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
    marginBottom: 12,
    paddingHorizontal: 8,
  },
  success: {
    color: '#4CAF50',
  },
  error: {
    color: '#F44336',
  },
  redeemBtn: {
    width: '100%',
    backgroundColor: '#FF9800',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginBottom: 10,
  },
  redeemBtnDisabled: {
    backgroundColor: '#FFCC80',
  },
  redeemBtnText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '700',
  },
  cancelBtn: {
    paddingVertical: 8,
  },
  cancelBtnText: {
    color: '#999',
    fontSize: 14,
  },
});
