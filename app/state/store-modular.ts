// Modular Zustand store combining all slices
import { create } from 'zustand';
import { persist, subscribeWithSelector } from 'zustand/middleware';
import { createStorage } from './utils/storageUtils';
import { syncToDatabase } from './utils/syncUtils';
import { loadAllUserData } from '../../lib/syncManager';
import { getDeviceUser } from '../../lib/deviceAuth';

// Import slices
import { UserSlice, createUserSlice } from './slices/userSlice';
import { SessionSlice, createSessionSlice } from './slices/sessionSlice';
import { HabitsSlice, createHabitsSlice } from './slices/habitsSlice';
import { DeadlinesSlice, createDeadlinesSlice } from './slices/deadlinesSlice';
import { ShopSlice, createShopSlice } from './slices/shopSlice';
import { AchievementsSlice, createAchievementsSlice } from './slices/achievementsSlice';

// Combined store type
export type QuillbyStore = UserSlice & SessionSlice & HabitsSlice & DeadlinesSlice & ShopSlice & AchievementsSlice & {
  // Additional store-level actions
  loadFromDatabase: () => Promise<void>;
  checkStudyCheckpoints: () => any;
  addMissedCheckpoint: (missingHours?: number) => void;
  checkAndProcessCheckpoints: () => any;
  getMessEnergyCapPenalty: () => number;
  applyDailyMessDecay: () => void;
  generateDailySummary: () => string;
};

// Helper function to check study checkpoints
const checkWithCheckpoints = (userData: any) => {
  const now = new Date();
  const currentHour = now.getHours();
  const studyHours = (userData.studyMinutesToday || 0) / 60;
  const goalHours = userData.studyGoalHours || 0;
  
  console.log('[checkWithCheckpoints] Current state:', {
    currentHour,
    studyHours,
    goalHours,
    checkpoints: userData.studyCheckpoints
  });
  
  if (!goalHours || !userData.studyCheckpoints || userData.studyCheckpoints.length === 0) {
    console.log('[checkWithCheckpoints] No goal or checkpoints, returning not behind');
    return { isBehind: false };
  }
  
  // Parse checkpoint times and find the most recent one that has passed
  const checkpoints = userData.studyCheckpoints.map((cp: string) => {
    const match = cp.match(/(\d+)\s*(AM|PM)/i);
    if (!match) return null;
    
    let hour = parseInt(match[1]);
    const period = match[2].toUpperCase();
    
    if (period === 'PM' && hour !== 12) hour += 12;
    if (period === 'AM' && hour === 12) hour = 0;
    
    return { time: cp, hour };
  }).filter(Boolean);
  
  console.log('[checkWithCheckpoints] Parsed checkpoints:', checkpoints);
  
  // Find the most recent checkpoint that has passed
  let lastCheckpoint = null;
  for (const checkpoint of checkpoints) {
    if (checkpoint && checkpoint.hour <= currentHour) {
      if (!lastCheckpoint || checkpoint.hour > lastCheckpoint.hour) {
        lastCheckpoint = checkpoint;
      }
    }
  }
  
  console.log('[checkWithCheckpoints] Last passed checkpoint:', lastCheckpoint);
  
  if (!lastCheckpoint) {
    console.log('[checkWithCheckpoints] No checkpoint has passed yet today');
    return { isBehind: false };
  }
  
  // Calculate expected progress at this checkpoint
  const hoursIntoDay = currentHour;
  const expectedProgress = (hoursIntoDay / 24) * goalHours;
  const missing = Math.max(0, expectedProgress - studyHours);
  
  console.log('[checkWithCheckpoints] Progress calculation:', {
    hoursIntoDay,
    expectedProgress,
    actualProgress: studyHours,
    missing
  });
  
  if (missing > 0.5) { // Only flag if behind by more than 30 minutes
    console.log('[checkWithCheckpoints] ⚠️ User is behind! Adding mess points');
    return {
      isBehind: true,
      checkpoint: lastCheckpoint.time,
      checkpointHour: lastCheckpoint.hour,
      expected: expectedProgress,
      actual: studyHours,
      missing: missing
    };
  }
  
  console.log('[checkWithCheckpoints] User is on track or only slightly behind');
  return { isBehind: false };
};

// Load data from database on app startup
const loadFromDatabase = async () => {
  try {
    const user = await getDeviceUser();
    if (!user) {
      console.log('[Load] No authenticated user, using local data only');
      return null;
    }

    console.log('[Load] Loading comprehensive user data from database...');
    const allData = await loadAllUserData();

    if (allData && allData.userProfile) {
      console.log('[Load] Comprehensive user data loaded from database');
      return allData;
    }

    return null;
  } catch (error) {
    console.error('[Load] Failed to load from database:', error);
    return null;
  }
};

export const useQuillbyStore = create<QuillbyStore>()(
  subscribeWithSelector(
    persist(
    (...args) => ({
      // Combine all slices
      ...createUserSlice(...args),
      ...createSessionSlice(...args),
      ...createHabitsSlice(...args),
      ...createDeadlinesSlice(...args),
      ...createShopSlice(...args),
      ...createAchievementsSlice(...args),

      // Store-level actions
      loadFromDatabase: async () => {
        const [set, get] = args;
        try {
          console.log('[Load] Starting database load...');
          const dbData = await loadFromDatabase();
          if (dbData && dbData.userProfile) {
            const { userData, deadlines } = get();
            
            console.log('[Load] Merging database data with local state...');
            console.log('[Load] DB study_goal_hours:', dbData.userProfile.study_goal_hours);
            console.log('[Load] Local study_goal_hours:', userData.studyGoalHours);
            
            // Merge database data with local data, prioritizing database for key fields
            const mergedUserData = {
              ...userData,
              // Profile data from database (PERSISTENT - ALWAYS prioritize DB over local cache)
              buddyName: dbData.userProfile.buddy_name ?? userData.buddyName,
              selectedCharacter: dbData.userProfile.selected_character ?? userData.selectedCharacter,
              userName: dbData.userProfile.user_name ?? userData.userName,
              studentLevel: dbData.userProfile.student_level ?? userData.studentLevel,
              country: dbData.userProfile.country ?? userData.country,
              timezone: dbData.userProfile.timezone ?? userData.timezone,
              qCoins: dbData.userProfile.q_coins ?? userData.qCoins,
              gems: dbData.userProfile.gems ?? userData.gems ?? 0,
              messPoints: dbData.userProfile.mess_points ?? userData.messPoints,
              currentStreak: dbData.userProfile.current_streak ?? userData.currentStreak,
              enabledHabits: dbData.userProfile.enabled_habits ?? userData.enabledHabits,
              studyGoalHours: dbData.userProfile.study_goal_hours ?? userData.studyGoalHours,
              exerciseGoalMinutes: dbData.userProfile.exercise_goal_minutes ?? userData.exerciseGoalMinutes,
              hydrationGoalGlasses: dbData.userProfile.hydration_goal_glasses ?? userData.hydrationGoalGlasses,
              sleepGoalHours: dbData.userProfile.sleep_goal_hours ?? userData.sleepGoalHours,
              weightGoal: dbData.userProfile.weight_goal ?? userData.weightGoal,
              mealPortionSize: dbData.userProfile.meal_portion_size ?? userData.mealPortionSize,
              purchasedItems: dbData.purchasedItems?.map((item: any) => item.item_id) ?? userData.purchasedItems,
              roomCustomization: {
                lightType: dbData.userProfile.light_type ?? userData.roomCustomization?.lightType,
                plantType: dbData.userProfile.plant_type ?? userData.roomCustomization?.plantType,
              },
              // DAILY DATA - Keep local (don't overwrite from database on startup)
              // These are session-based and will be reset at midnight by resetDay()
              studyMinutesToday: userData.studyMinutesToday,
              missedCheckpoints: userData.missedCheckpoints,
              ateBreakfast: userData.ateBreakfast,
              waterGlasses: userData.waterGlasses,
              mealsLogged: userData.mealsLogged,
              exerciseMinutes: userData.exerciseMinutes,
              appleTapsToday: userData.appleTapsToday,
              coffeeTapsToday: userData.coffeeTapsToday,
              // Sleep sessions from database (these are persistent)
              sleepSessions: dbData.sleepSessions?.map((session: any) => ({
                id: session.id,
                start: session.start_time,
                end: session.end_time,
                duration: session.duration_hours,
                date: session.date_assigned,
              })) || userData.sleepSessions,
            };
            
            // Check if it's a new day - if so, reset daily data
            const today = new Date().toDateString();
            const lastCheckIn = mergedUserData.lastCheckInDate;
            
            if (lastCheckIn !== today) {
              console.log('[Load] New day detected during load, resetting daily data');
              mergedUserData.waterGlasses = 0;
              mergedUserData.mealsLogged = 0;
              mergedUserData.studyMinutesToday = 0;
              mergedUserData.exerciseMinutes = 0;
              mergedUserData.appleTapsToday = 0;
              mergedUserData.coffeeTapsToday = 0;
              mergedUserData.ateBreakfast = false;
              mergedUserData.missedCheckpoints = 0;
              mergedUserData.lastCheckInDate = today;
              mergedUserData.lastSleepReset = today;
              mergedUserData.lastExerciseReset = today;
              mergedUserData.lastStudyReset = today;
              mergedUserData.lastConsumableReset = today;
            }

            // Convert database deadlines to local format
            const mergedDeadlines = dbData.deadlines?.map((dbDeadline: any) => ({
              id: dbDeadline.id,
              title: dbDeadline.title,
              dueDate: dbDeadline.due_date,
              dueTime: dbDeadline.due_time,
              priority: dbDeadline.priority,
              category: dbDeadline.category,
              estimatedHours: dbDeadline.estimated_hours,
              workCompleted: dbDeadline.work_completed,
              isCompleted: dbDeadline.is_completed,
              createdAt: dbDeadline.created_at,
              reminders: {
                oneDayBefore: dbDeadline.reminder_one_day_before,
                threeDaysBefore: dbDeadline.reminder_three_days_before,
              }
            })) || deadlines;
            
            console.log('[Load] Loaded deadlines from database:', mergedDeadlines.length);
            console.log('[Load] Deadline IDs:', mergedDeadlines.map((d: any) => d.id));
            
            console.log('[Load] Merged study_goal_hours:', mergedUserData.studyGoalHours);
            console.log('[Load] Merged exercise_goal_minutes:', mergedUserData.exerciseGoalMinutes);
            console.log('[Load] Merged enabled_habits:', mergedUserData.enabledHabits);

            set({ 
              userData: mergedUserData,
              deadlines: mergedDeadlines
            });
            console.log('[Load] ✅ Database data merged successfully');
            
            // Verify the state was actually updated
            const updatedState = get();
            console.log('[Load] Verification - study_goal_hours in state:', updatedState.userData.studyGoalHours);
            console.log('[Load] Verification - exercise_goal_minutes in state:', updatedState.userData.exerciseGoalMinutes);
            
            // Start periodic sync after successful load
            setInterval(() => {
              const currentState = get();
              if (currentState.userData) {
                console.log('[Sync] Running periodic sync...');
                // Note: periodicSync would be imported from syncManager if available
              }
            }, 5 * 60 * 1000); // Sync every 5 minutes
          } else {
            console.log('[Load] No database data found, using local state');
          }
        } catch (error) {
          console.error('[Load] ❌ Failed to load from database:', error);
          // Continue with local data if database fails
        }
      },

      // Study checkpoint functions (simplified)
      checkStudyCheckpoints: () => {
        const [set, get] = args;
        const { userData } = get();
        
        console.log('[Checkpoint] Checking study checkpoints...', {
          studyGoalHours: userData.studyGoalHours,
          studyCheckpoints: userData.studyCheckpoints,
          studyMinutesToday: userData.studyMinutesToday,
          messPoints: userData.messPoints,
          enabledHabits: userData.enabledHabits
        });
        
        // Initialize default checkpoints if not set
        if (!userData.studyCheckpoints || userData.studyCheckpoints.length === 0) {
          console.log('[Checkpoint] ⚠️ No checkpoints set, initializing defaults: 12 PM, 6 PM, 9 PM');
          const updatedUserData = {
            ...userData,
            studyCheckpoints: ['12 PM', '6 PM', '9 PM']
          };
          set({ userData: updatedUserData });
          syncToDatabase(updatedUserData);
          
          // Use the updated checkpoints for this check
          return checkWithCheckpoints(updatedUserData);
        }
        
        return checkWithCheckpoints(userData);
      },

      addMissedCheckpoint: (missingHours: number = 1) => {
        const [set, get] = args;
        const { userData } = get();
        const newMissedCount = (userData.missedCheckpoints || 0) + 1;
        
        const messPointsIncrease = Math.max(0.5, missingHours);
        const newMessPoints = userData.messPoints + messPointsIncrease;
        
        console.log(`[addMissedCheckpoint] ADDING MESS POINTS:`, {
          currentMessPoints: userData.messPoints,
          messPointsIncrease,
          newMessPoints,
          missingHours,
          newMissedCount
        });
        
        const updatedUserData = {
          ...userData,
          missedCheckpoints: newMissedCount,
          messPoints: newMessPoints,
          maxEnergyCap: 100,
          energy: Math.min(userData.energy, 100)
        };
        
        set({ userData: updatedUserData });
        
        // Send mess notification if room is getting messy (only when app is in background)
        // This will be handled by background task
        if (newMessPoints >= 4) {
          console.log(`[addMissedCheckpoint] Room is messy (${newMessPoints} points), notification will be sent if app is in background`);
        }
        
        // Sync the changes to database
        syncToDatabase(updatedUserData);
        
        console.log(`[addMissedCheckpoint] ✅ Mess points updated: ${userData.messPoints} → ${newMessPoints}`);
      },

      checkAndProcessCheckpoints: () => {
        const [set, get] = args;
        const { checkStudyCheckpoints, addMissedCheckpoint, userData } = get();
        
        console.log('[checkAndProcessCheckpoints] Starting checkpoint processing...');
        const checkResult = checkStudyCheckpoints();
        
        console.log('[checkAndProcessCheckpoints] Check result:', checkResult);
        
        // Check all required fields exist (use !== undefined to allow 0 values)
        if (checkResult.isBehind && 
            checkResult.missing !== undefined && 
            checkResult.expected !== undefined && 
            checkResult.actual !== undefined && 
            checkResult.checkpoint) {
          // Check if we've already processed this checkpoint today
          const today = new Date().toDateString();
          const checkpointKey = `${checkResult.checkpoint}-${today}`;
          const lastProcessedCheckpoint = userData.lastProcessedCheckpoint || '';
          
          console.log('[checkAndProcessCheckpoints] Checking duplicate:', {
            checkpointKey,
            lastProcessedCheckpoint,
            isDuplicate: lastProcessedCheckpoint === checkpointKey
          });
          
          if (lastProcessedCheckpoint === checkpointKey) {
            console.log('[checkAndProcessCheckpoints] Already processed this checkpoint today, skipping');
            return { shouldNotify: false };
          }
          
          console.log('[checkAndProcessCheckpoints] ✅ Calling addMissedCheckpoint with missing hours:', checkResult.missing);
          addMissedCheckpoint(checkResult.missing);
          
          // Mark this checkpoint as processed
          const updatedUserData = {
            ...get().userData,
            lastProcessedCheckpoint: checkpointKey
          };
          set({ userData: updatedUserData });
          syncToDatabase(updatedUserData);
          
          return {
            shouldNotify: true,
            checkpoint: checkResult.checkpoint,
            expected: checkResult.expected,
            actual: checkResult.actual,
            missing: checkResult.missing,
            message: `Study Checkpoint: ${checkResult.checkpoint}\n` +
                    `Expected: ${checkResult.expected.toFixed(1)}h, Actual: ${checkResult.actual.toFixed(1)}h\n` +
                    `Missing: ${checkResult.missing.toFixed(1)}h added to mess`
          };
        }
        
        console.log('[checkAndProcessCheckpoints] Not behind or missing required fields, no action taken');
        return { shouldNotify: false };
      },

      getMessEnergyCapPenalty: () => {
        const [, get] = args;
        const { userData } = get();
        return Math.floor(userData.messPoints * 2); // Simple calculation
      },

      applyDailyMessDecay: () => {
        console.log(`[Daily] No automatic mess decay - clean your room to reduce mess!`);
      },

      generateDailySummary: () => {
        const [, get] = args;
        const { userData } = get();
        
        if (!userData.studyGoalHours) return '';
        
        const studyHours = (userData.studyMinutesToday || 0) / 60;
        const goalHours = userData.studyGoalHours;
        const progressPercent = Math.round((studyHours / goalHours) * 100);
        const missingHours = Math.max(0, goalHours - studyHours);
        
        const mess = userData.messPoints;
        let roomState = 'Clean';
        if (mess > 30) roomState = 'Messy 3+';
        else if (mess > 20) roomState = 'Messy 3';
        else if (mess > 10) roomState = 'Messy 2';
        else if (mess > 5) roomState = 'Messy 1';
        
        return `Daily Summary:
Goal: ${goalHours} hours
Studied: ${studyHours.toFixed(1)} hours (${progressPercent}%)
${missingHours > 0 ? `Missing: ${missingHours.toFixed(1)} hours` : 'Goal achieved! 🎉'}
${missingHours > 0 ? `Mess added: +${missingHours.toFixed(1)}` : 'No mess added'}
Total mess: ${mess.toFixed(1)}
Room: ${roomState}`;
      }
    }),
    {
      name: 'quillby-modular-storage', // New storage key to avoid old data
      storage: createStorage(),
      
      // Only persist essential user data
      partialize: (state) => ({
        userData: state.userData,
        deadlines: state.deadlines,
      }),
      
      version: 1,
      migrate: (persistedState: any, version: number) => {
        console.log(`[Storage] Migrating from version ${version}`);
        return persistedState;
      },
      
      onRehydrateStorage: () => {
        console.log('[Storage] Starting data rehydration...');
        return (state, error) => {
          if (error) {
            console.error('[Storage] Failed to rehydrate:', error);
          } else {
            console.log('[Storage] Data rehydration completed');
            // Don't automatically load from database here to prevent infinite loops
            // Database loading will be handled by the component initialization
          }
        };
      }
    }
  )
  )
);