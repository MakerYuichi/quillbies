import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  Linking,
  Dimensions,
  RefreshControl,
  Animated,
  ImageBackground,
  Image,
  ScrollView,
} from 'react-native';
import { useFonts } from 'expo-font';
import { getCommunityFeed, formatDiaryDate, CommunityPost } from '../../../lib/communityFeed';
import FeedbackModal from './FeedbackModal';

// Hamster avatar images per character type
const HAMSTER_AVATARS: Record<string, any> = {
  casual:    require('../../../assets/hamsters/casual/idle-sit.png'),
  energetic: require('../../../assets/onboarding/hamster-energetic.png'),
  scholar:   require('../../../assets/onboarding/hamster-scholar.png'),
};

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

const FACEBOOK_GROUP = 'https://www.facebook.com/groups/986355220490690';

const CATEGORY_FILTERS = [
  { id: 'all',         label: 'All' },
  { id: 'praise',      label: '❤️ Praise' },
  { id: 'feature',     label: '💡 Ideas' },
  { id: 'bug',         label: '🐛 Bugs' },
  { id: 'improvement', label: '✨ Better' },
  { id: 'other',       label: '💬 Other' },
];

const CATEGORY_META: Record<string, { emoji: string; ink: string }> = {
  praise:      { emoji: '❤️', ink: '#7A1A1A' },
  feature:     { emoji: '💡', ink: '#5C3A00' },
  bug:         { emoji: '🐛', ink: '#1A4A0A' },
  improvement: { emoji: '✨', ink: '#3A0A5C' },
  other:       { emoji: '💬', ink: '#0A2A4A' },
};

// Slight rotation per card for organic diary feel
const ROTATIONS = ['-0.5deg', '0.3deg', '-0.2deg', '0.6deg', '-0.4deg', '0.2deg'];

interface Props {
  visible: boolean;
  onClose: () => void;
  onWriteFeedback?: () => void; // optional — FAB handles it internally now
}

export default function CommunityFeedModal({ visible, onClose }: Props) {
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [activeFilter, setActiveFilter] = useState('all');
  const [showWriteModal, setShowWriteModal] = useState(false);

  const quillAnim = useRef(new Animated.Value(0)).current;

  const [fontsLoaded] = useFonts({
    'PlaywriteIE': require('../../../assets/fonts/PlaywriteIE-VariableFont_wght.ttf'),
    'CaveatBrush': require('../../../assets/fonts/CaveatBrush-Regular.ttf'),
  });

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(quillAnim, { toValue: 1, duration: 1400, useNativeDriver: true }),
        Animated.timing(quillAnim, { toValue: 0, duration: 1400, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  const quillScale = quillAnim.interpolate({ inputRange: [0, 1], outputRange: [1, 1.15] });
  const quillRotate = quillAnim.interpolate({ inputRange: [0, 0.5, 1], outputRange: ['-5deg', '0deg', '5deg'] });

  const load = useCallback(async (reset = false) => {
    const nextPage = reset ? 0 : page;
    if (!reset) setLoadingMore(true);
    const data = await getCommunityFeed(nextPage, activeFilter);
    if (reset) {
      setPosts(data);
      setPage(1);
    } else {
      setPosts(prev => [...prev, ...data]);
      setPage(p => p + 1);
    }
    setHasMore(data.length === 20);
    setLoading(false);
    setRefreshing(false);
    setLoadingMore(false);
  }, [page, activeFilter]);

  useEffect(() => {
    if (visible) {
      setLoading(true);
      setPage(0);
      load(true);
    }
  }, [visible, activeFilter]);

  const onRefresh = () => { setRefreshing(true); load(true); };
  const onEndReached = () => { if (!loadingMore && hasMore) load(false); };

  const renderPost = ({ item, index }: { item: CommunityPost; index: number }) => {
    const meta = CATEGORY_META[item.category] || CATEGORY_META.other;
    const rotation = ROTATIONS[index % ROTATIONS.length];
    const streakLine = `A note from ${item.buddy_name} 📖`;

    return (
      <View style={[styles.cardWrapper, { transform: [{ rotate: rotation }] }]}>
        {/* diary.png as the card background — looks like actual diary paper */}
        <ImageBackground
          source={require('../../../assets/backgrounds/diary.png')}
          style={styles.diaryCard}
          imageStyle={styles.diaryCardImage}
          resizeMode="cover"
        >
          {/* Semi-transparent overlay so text is readable over the texture */}
          <View style={styles.diaryOverlay}>

            {/* Top: streak line + date */}
            <View style={styles.cardTopRow}>
              <Text style={[styles.streakLine, { color: meta.ink, fontFamily: fontsLoaded ? 'CaveatBrush' : undefined }]}>
                {streakLine}
              </Text>
              <Text style={[styles.diaryDate, { color: meta.ink + 'BB', fontFamily: fontsLoaded ? 'PlaywriteIE' : undefined }]}>
                {formatDiaryDate(item.created_at)}
              </Text>
            </View>

            {/* Ink rule */}
            <View style={[styles.inkRule, { backgroundColor: meta.ink + '35' }]} />

            {/* Category stamp */}
            <View style={[styles.categoryStamp, { borderColor: meta.ink + '55' }]}>
              <Text style={[styles.categoryStampText, { color: meta.ink }]}>
                {meta.emoji}  {item.category.toUpperCase()}
              </Text>
            </View>

            {/* Title — big CaveatBrush */}
            <Text style={[styles.diaryTitle, { color: meta.ink, fontFamily: fontsLoaded ? 'CaveatBrush' : undefined }]}>
              {item.title}
            </Text>

            {/* Body — italic PlaywriteIE */}
            <Text
              style={[styles.diaryBody, { color: meta.ink + 'CC', fontFamily: fontsLoaded ? 'PlaywriteIE' : undefined }]}
              numberOfLines={6}
            >
              {item.description}
            </Text>

            {/* Footer */}
            <View style={styles.cardFooter}>
              {/* Hamster avatar circle */}
              <View style={styles.avatarCircle}>
                <Image
                  source={HAMSTER_AVATARS[item.selected_character || 'casual'] ?? HAMSTER_AVATARS.casual}
                  style={styles.avatarImage}
                  resizeMode="contain"
                />
              </View>
              <Text style={[styles.diaryAuthor, { color: meta.ink + '99', fontFamily: fontsLoaded ? 'CaveatBrush' : undefined }]}>
                {item.buddy_name}{item.country ? `, ${item.country}` : ''}
              </Text>
            </View>

          </View>
        </ImageBackground>
      </View>
    );
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.overlay}>
        <ImageBackground
          source={require('../../../assets/backgrounds/diary.png')}
          style={styles.sheet}
          imageStyle={styles.sheetBg}
          resizeMode="cover"
        >
          {/* Dark overlay on sheet bg so header/content is readable */}
          <View style={styles.sheetOverlay}>

            {/* Leather header */}
            <View style={styles.leatherHeader}>
              <View style={styles.leatherSpine} />
              <View style={styles.leatherContent}>
                <Text style={[styles.leatherTitle, { fontFamily: fontsLoaded ? 'CaveatBrush' : undefined }]}>
                  Community Diary
                </Text>
                <Text style={[styles.leatherSub, { fontFamily: fontsLoaded ? 'PlaywriteIE' : undefined }]}>
                  Stories from Quillby users worldwide
                </Text>
              </View>
              <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
                <Text style={styles.closeBtnText}>✕</Text>
              </TouchableOpacity>
            </View>

            {/* Facebook banner */}
            <TouchableOpacity
              style={styles.facebookBanner}
              onPress={() => Linking.openURL(FACEBOOK_GROUP)}
              activeOpacity={0.85}
            >
              <Text style={styles.fbIcon}>👥</Text>
              <View style={styles.fbText}>
                <Text style={[styles.fbTitle, { fontFamily: fontsLoaded ? 'CaveatBrush' : undefined }]}>
                  Join our Facebook Community
                </Text>
                <Text style={styles.fbSub}>Chat, share tips & connect with other users</Text>
              </View>
              <Text style={styles.fbArrow}>›</Text>
            </TouchableOpacity>

            {/* Category filter — fixed height container, chips never shift */}
            <View style={styles.filterContainer}>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.filterRow}
              >
                {CATEGORY_FILTERS.map((item) => (
                  <TouchableOpacity
                    key={item.id}
                    style={[styles.filterChip, activeFilter === item.id && styles.filterChipActive]}
                    onPress={() => setActiveFilter(item.id)}
                  >
                    <Text style={[
                      styles.filterChipText,
                      activeFilter === item.id && styles.filterChipTextActive,
                    ]}>
                      {item.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            {/* Feed */}
            {loading ? (
              <View style={styles.center}>
                <Text style={styles.loadingQuill}>🪶</Text>
                <Text style={[styles.loadingText, { fontFamily: fontsLoaded ? 'PlaywriteIE' : undefined }]}>
                  Opening the diary...
                </Text>
              </View>
            ) : posts.length === 0 ? (
              <View style={styles.center}>
                <Text style={styles.emptyEmoji}>📖</Text>
                <Text style={[styles.emptyTitle, { fontFamily: fontsLoaded ? 'CaveatBrush' : undefined }]}>
                  No entries yet
                </Text>
                <Text style={[styles.emptySub, { fontFamily: fontsLoaded ? 'PlaywriteIE' : undefined }]}>
                  Be the first to write in the diary!
                </Text>
              </View>
            ) : (
              <FlatList
                data={posts}
                keyExtractor={i => i.id}
                renderItem={renderPost}
                contentContainerStyle={styles.feedContent}
                showsVerticalScrollIndicator={false}
                refreshControl={
                  <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#5C3A1E']} />
                }
                onEndReached={onEndReached}
                onEndReachedThreshold={0.3}
                ListFooterComponent={
                  loadingMore
                    ? <ActivityIndicator style={{ margin: 16 }} color="#5C3A1E" />
                    : null
                }
              />
            )}

          </View>
        </ImageBackground>

        {/* Floating quill FAB — outside ImageBackground so it's always on top */}
        <Animated.View style={[
          styles.quillFab,
          { transform: [{ scale: quillScale }, { rotate: quillRotate }] },
        ]}>
          <TouchableOpacity onPress={() => setShowWriteModal(true)} activeOpacity={0.85} style={styles.quillFabInner}>
            <Text style={styles.quillFabIcon}>🪶</Text>
          </TouchableOpacity>
        </Animated.View>

        {/* Write entry modal — stacked on top */}
        <FeedbackModal
          visible={showWriteModal}
          onClose={() => {
            setShowWriteModal(false);
            // Reload feed after writing so new entry appears
            load(true);
          }}
        />

      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.65)',
    justifyContent: 'flex-end',
  },
  sheet: {
    height: SCREEN_HEIGHT * 0.93,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    overflow: 'hidden',
  },
  sheetBg: {
    opacity: 0.25, // very subtle — just a hint of diary texture on the bg
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  sheetOverlay: {
    flex: 1,
    backgroundColor: '#F5EDD6EE', // warm cream, mostly opaque
  },

  // Leather header
  leatherHeader: {
    backgroundColor: '#4A2C0E',
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 18,
    paddingBottom: 14,
    paddingRight: 16,
    borderBottomWidth: 4,
    borderBottomColor: '#2E1A08',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 6,
    elevation: 8,
  },
  leatherSpine: {
    width: 14,
    alignSelf: 'stretch',
    backgroundColor: '#2E1A08',
    marginRight: 14,
    borderTopLeftRadius: 24,
  },
  leatherContent: { flex: 1 },
  leatherTitle: {
    fontSize: SCREEN_WIDTH * 0.075,
    color: '#F5DEB3',
    letterSpacing: 0.5,
    textShadowColor: 'rgba(0,0,0,0.6)',
    textShadowOffset: { width: 1, height: 2 },
    textShadowRadius: 4,
  },
  leatherSub: {
    fontSize: SCREEN_WIDTH * 0.025,
    color: '#C4A882',
    marginTop: 3,
    fontStyle: 'italic',
  },
  closeBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.12)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeBtnText: {
    fontSize: 15,
    color: '#F5DEB3',
    fontWeight: '700',
  },

  // Facebook banner
  facebookBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1877F2',
    marginHorizontal: 14,
    marginTop: 10,
    marginBottom: 2,
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 14,
    gap: 10,
  },
  fbIcon: { fontSize: 22 },
  fbText: { flex: 1 },
  fbTitle: {
    fontSize: SCREEN_WIDTH * 0.036,
    color: '#FFF',
  },
  fbSub: {
    fontSize: SCREEN_WIDTH * 0.026,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 1,
    fontFamily: 'ChakraPetch_400Regular',
  },
  fbArrow: { fontSize: 22, color: '#FFF', fontWeight: '700' },

  // Filter chips — fixed height row, fixed-width chips, never moves
  filterContainer: {
    height: 50,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(92,58,30,0.1)',
  },
  filterRow: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    gap: 8,
    flexDirection: 'row',
    alignItems: 'center',
    height: 50, // fixed — never changes regardless of content
  },
  filterChip: {
    width: SCREEN_WIDTH * 0.22,
    height: 34, // fixed height
    borderRadius: 20,
    backgroundColor: 'rgba(92,58,30,0.12)',
    borderWidth: 1.5,
    borderColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterChipActive: {
    backgroundColor: '#4A2C0E',
    borderColor: '#2E1A08',
  },
  filterChipText: {
    fontSize: SCREEN_WIDTH * 0.032,
    fontFamily: 'ChakraPetch_600SemiBold',
    color: '#5C3A1E',
  },
  filterChipTextActive: {
    color: '#F5DEB3',
    fontFamily: 'ChakraPetch_600SemiBold',
  },

  // Feed
  feedContent: {
    paddingHorizontal: 16,
    paddingBottom: 100,
    paddingTop: 10,
    gap: 20,
  },

  // Diary card wrapper (for rotation)
  cardWrapper: {
    shadowColor: '#3E2410',
    shadowOffset: { width: 3, height: 5 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },

  // The actual diary card — diary.png as background
  diaryCard: {
    borderRadius: 3,
    overflow: 'hidden',
    minHeight: 200,
  },
  diaryCardImage: {
    borderRadius: 3,
    opacity: 0.9, // show the diary texture clearly
  },
  diaryOverlay: {
    backgroundColor: 'rgba(253,246,227,0.82)', // cream overlay so text is readable
    padding: 18,
    paddingBottom: 14,
  },

  cardTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
    gap: 8,
  },
  streakLine: {
    fontSize: SCREEN_WIDTH * 0.038,
    flex: 1,
    lineHeight: SCREEN_WIDTH * 0.052,
  },
  diaryDate: {
    fontSize: SCREEN_WIDTH * 0.024,
    textAlign: 'right',
    flexShrink: 0,
    marginTop: 2,
  },

  inkRule: {
    height: 1.5,
    marginBottom: 10,
    borderRadius: 1,
  },

  categoryStamp: {
    alignSelf: 'flex-start',
    borderWidth: 1.5,
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderStyle: 'dashed',
    marginBottom: 10,
  },
  categoryStampText: {
    fontSize: SCREEN_WIDTH * 0.026,
    fontFamily: 'ChakraPetch_700Bold',
    letterSpacing: 1.5,
  },

  diaryTitle: {
    fontSize: SCREEN_WIDTH * 0.058,
    marginBottom: 8,
    lineHeight: SCREEN_WIDTH * 0.072,
  },

  diaryBody: {
    fontSize: SCREEN_WIDTH * 0.028,
    lineHeight: SCREEN_WIDTH * 0.046,
    fontStyle: 'italic',
    marginBottom: 14,
  },

  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: 'rgba(92,58,30,0.15)',
    paddingTop: 8,
    gap: 8,
  },
  avatarCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(92,58,30,0.12)',
    borderWidth: 1.5,
    borderColor: 'rgba(92,58,30,0.25)',
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 0,
  },
  avatarImage: {
    width: 28,
    height: 28,
  },
  diaryAuthor: {
    fontSize: SCREEN_WIDTH * 0.034,
    fontStyle: 'italic',
    flex: 1,
  },

  // States
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  loadingQuill: { fontSize: 52, marginBottom: 14 },
  loadingText: {
    fontSize: SCREEN_WIDTH * 0.033,
    color: '#5C3A1E',
    fontStyle: 'italic',
  },
  emptyEmoji: { fontSize: 52, marginBottom: 12 },
  emptyTitle: {
    fontSize: SCREEN_WIDTH * 0.055,
    color: '#4A2C0E',
    marginBottom: 8,
  },
  emptySub: {
    fontSize: SCREEN_WIDTH * 0.03,
    color: '#8B5E3C',
    textAlign: 'center',
    fontStyle: 'italic',
  },

  // Floating quill FAB
  quillFab: {
    position: 'absolute',
    bottom: 32,
    right: 24,
    zIndex: 200,
  },
  quillFabInner: {
    width: 62,
    height: 62,
    borderRadius: 31,
    backgroundColor: '#4A2C0E',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#2E1A08',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.55,
    shadowRadius: 10,
    elevation: 10,
    borderWidth: 2.5,
    borderColor: '#F5DEB3',
  },
  quillFabIcon: {
    fontSize: 30,
  },
});
