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
  Dimensions,
} from 'react-native';
import { useQuillbyStore } from '../../state/store-modular';
import { getOrCreateDeviceId } from '../../../lib/deviceAuth';
import { redeemPromoCode, PromoRewardType } from '../../../lib/promoCodes';
import PremiumUnlockedModal from './PremiumUnlockedModal';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface Props {
  visible: boolean;
  onClose: () => void;
  onGoToShop?: () => void;
}

interface RewardResult {
  type: PromoRewardType;
  amount: number;
  premiumExpiresAt?: string | null;
}

export default function PromoCodeModal({ visible, onClose, onGoToShop }: Props) {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [reward, setReward] = useState<RewardResult | null>(null);
  const [showPremiumModal, setShowPremiumModal] = useState(false);

  const addGems = useQuillbyStore((state) => state.addGems);
  const addQCoins = useQuillbyStore((state) => state.addQCoins);
  const setPremiumStatus = useQuillbyStore((state) => state.setPremiumStatus);

  const handleRedeem = async () => {
    if (!code.trim()) return;
    setLoading(true);
    setError(null);
    setReward(null);

    try {
      const deviceId = await getOrCreateDeviceId();
      if (!deviceId) {
        setError('Could not identify your device. Please try again.');
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

        setReward({
          type: res.rewardType,
          amount: res.rewardAmount,
          premiumExpiresAt: res.premiumExpiresAt,
        });
        setCode('');

        // Premium gets its own full-screen celebration modal
        if (res.rewardType === 'premium') {
          setShowPremiumModal(true);
        }
      } else {
        setError(res.error ?? 'Something went wrong.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setCode('');
    setError(null);
    setReward(null);
    onClose();
  };

  const REWARD_CONFIG = {
    gems: {
      emoji: '💎',
      color: '#7E57C2',
      bg: '#F3E5F5',
      border: '#CE93D8',
      label: 'Gems Added!',
      valueColor: '#7E57C2',
    },
    coins: {
      emoji: '🪙',
      color: '#E65100',
      bg: '#FFF3E0',
      border: '#FFB74D',
      label: 'Q-Bies Added!',
      valueColor: '#E65100',
    },
    premium: {
      emoji: '👑',
      color: '#FF9800',
      bg: '#FFF8E1',
      border: '#FFD54F',
      label: 'Premium Unlocked!',
      valueColor: '#FF9800',
    },
  };

  const rewardCfg = reward ? REWARD_CONFIG[reward.type] : null;

  return (
    <>
      <Modal visible={visible} transparent animationType="fade" onRequestClose={handleClose}>
        <KeyboardAvoidingView
          style={styles.overlay}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <View style={styles.card}>

            {/* ── Reward success view ── */}
            {reward && !showPremiumModal ? (
              <View style={styles.rewardView}>
                <Text style={styles.rewardEmoji}>{rewardCfg!.emoji}</Text>
                <Text style={[styles.rewardLabel, { color: rewardCfg!.color }]}>
                  {rewardCfg!.label}
                </Text>

                {reward.type !== 'premium' && (
                  <View style={[styles.rewardAmountBox, { backgroundColor: rewardCfg!.bg, borderColor: rewardCfg!.border }]}>
                    <Text style={[styles.rewardAmount, { color: rewardCfg!.valueColor }]}>
                      +{reward.amount}
                    </Text>
                    <Text style={[styles.rewardAmountLabel, { color: rewardCfg!.color }]}>
                      {reward.type === 'gems' ? 'Gems' : 'Q-Bies'}
                    </Text>
                  </View>
                )}

                {reward.type === 'premium' && (
                  <View style={[styles.rewardAmountBox, { backgroundColor: rewardCfg!.bg, borderColor: rewardCfg!.border }]}>
                    <Text style={[styles.rewardAmount, { color: rewardCfg!.valueColor, fontSize: SCREEN_WIDTH * 0.055 }]}>
                      1 Month Free
                    </Text>
                    <Text style={[styles.rewardAmountLabel, { color: rewardCfg!.color }]}>
                      All premium features unlocked
                    </Text>
                  </View>
                )}

                <TouchableOpacity
                  style={[styles.redeemBtn, { backgroundColor: rewardCfg!.color }]}
                  onPress={reward.type === 'premium' ? () => setShowPremiumModal(true) : handleClose}
                >
                  <Text style={styles.redeemBtnText}>
                    {reward.type === 'premium' ? '✨ See What\'s Unlocked' : '🎉 Awesome!'}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.cancelBtn} onPress={handleClose}>
                  <Text style={styles.cancelBtnText}>Close</Text>
                </TouchableOpacity>
              </View>
            ) : (

              /* ── Input view ── */
              <>
                <Text style={styles.title}>🎟️ Redeem Code</Text>
                <Text style={styles.subtitle}>Enter your promo code to claim free Gems, Q-Bies, or Premium</Text>

                <TextInput
                  style={styles.input}
                  placeholder="ENTER CODE"
                  placeholderTextColor="#CCC"
                  value={code}
                  onChangeText={(t) => {
                    setCode(t.toUpperCase());
                    setError(null);
                  }}
                  autoCapitalize="characters"
                  autoCorrect={false}
                  editable={!loading}
                  returnKeyType="done"
                  onSubmitEditing={handleRedeem}
                />

                {error && (
                  <View style={styles.errorBox}>
                    <Text style={styles.errorText}>⚠️ {error}</Text>
                  </View>
                )}

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
              </>
            )}
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* Premium celebration — shown on top of everything */}
      <PremiumUnlockedModal
        visible={showPremiumModal}
        expiresAt={reward?.premiumExpiresAt}
        onGoToShop={onGoToShop}
        onClose={() => {
          setShowPremiumModal(false);
          handleClose();
        }}
      />
    </>
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

  // ── Input view ──
  title: {
    fontSize: SCREEN_WIDTH * 0.055,
    fontFamily: 'ChakraPetch_700Bold',
    color: '#333',
    marginBottom: 6,
  },
  subtitle: {
    fontSize: SCREEN_WIDTH * 0.032,
    fontFamily: 'ChakraPetch_400Regular',
    color: '#888',
    textAlign: 'center',
    marginBottom: 20,
  },
  input: {
    width: '100%',
    borderWidth: 2,
    borderColor: '#E0E0E0',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: SCREEN_WIDTH * 0.05,
    fontFamily: 'ChakraPetch_700Bold',
    letterSpacing: 3,
    color: '#333',
    textAlign: 'center',
    marginBottom: 12,
    backgroundColor: '#FAFAFA',
  },
  errorBox: {
    width: '100%',
    backgroundColor: '#FFEBEE',
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#EF9A9A',
  },
  errorText: {
    fontSize: SCREEN_WIDTH * 0.033,
    fontFamily: 'ChakraPetch_600SemiBold',
    color: '#C62828',
    textAlign: 'center',
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
    fontFamily: 'ChakraPetch_700Bold',
    color: '#FFF',
    fontSize: SCREEN_WIDTH * 0.04,
  },
  cancelBtn: {
    paddingVertical: 8,
  },
  cancelBtnText: {
    fontFamily: 'ChakraPetch_400Regular',
    color: '#999',
    fontSize: SCREEN_WIDTH * 0.035,
  },

  // ── Reward view ──
  rewardView: {
    width: '100%',
    alignItems: 'center',
  },
  rewardEmoji: {
    fontSize: 64,
    marginBottom: 8,
  },
  rewardLabel: {
    fontSize: SCREEN_WIDTH * 0.06,
    fontFamily: 'ChakraPetch_700Bold',
    marginBottom: 16,
  },
  rewardAmountBox: {
    width: '100%',
    borderRadius: 16,
    borderWidth: 2,
    paddingVertical: 18,
    alignItems: 'center',
    marginBottom: 20,
  },
  rewardAmount: {
    fontSize: SCREEN_WIDTH * 0.12,
    fontFamily: 'ChakraPetch_700Bold',
    lineHeight: SCREEN_WIDTH * 0.14,
  },
  rewardAmountLabel: {
    fontSize: SCREEN_WIDTH * 0.035,
    fontFamily: 'ChakraPetch_600SemiBold',
    marginTop: 2,
  },
});
