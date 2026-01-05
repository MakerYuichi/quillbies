// Modular Zustand store combining all slices
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
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

// Combined store type
export type QuillbyStore = UserSlice & SessionSlice & HabitsSlice & DeadlinesSlice & ShopSlice & {
  // Additional store-level actions
  loadFromDatabase: () => Promise<void>;
  checkStudyCheckpoints: () => any;
  addMissedCheckpoint: (missingHours?: number) => void;
  checkAndProcessCheckpoints: () => any;
  getMessEnergyCapPenalty: () => number;
  applyDailyMessDecay: () => void;
  generateDailySummary: () => string;
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
  persist(
    (...args) => ({
      // Combine all slices
      ...createUserSlice(...args),
      ...createSessionSlice(...args),
      ...createHabitsSlice(...args),
      ...createDeadlinesSlice(...args),
      ...createShopSlice(...args),

      // Store-level actions
      loadFromDatabase: async () => {
        const [set, get] = args;
        try {
          console.log('[Load] Starting database load...');
          const dbData = await loadFromDatabase();
          if (dbData && dbData.userProfile) {
            const { userData, deadlines } = get();
            
            console.log('[Load] Merging database data with local state...');
            
            // Merge database data with local data, prioritizing database for key fields
            const mergedUserData = {
              ...userData,
              // Profile data from database
              buddyName: dbData.userProfile.buddy_name || userData.buddyName,
              selectedCharacter: dbData.userProfile.selected_character || userData.selectedCharacter,
              userName: dbData.userProfile.user_name || userData.userName,
              studentLevel: dbData.userProfile.student_level || userData.studentLevel,
              country: dbData.userProfile.country || userData.country,
              timezone: dbData.userProfile.timezone || userData.timezone,
              qCoins: dbData.userProfile.q_coins ?? userData.qCoins,
              messPoints: dbData.userProfile.mess_points ?? userData.messPoints,
              currentStreak: dbData.userProfile.current_streak ?? userData.currentStreak,
              enabledHabits: dbData.userProfile.enabled_habits || userData.enabledHabits,
              studyGoalHours: dbData.userProfile.study_goal_hours ?? userData.studyGoalHours,
              exerciseGoalMinutes: dbData.userProfile.exercise_goal_minutes ?? userData.exerciseGoalMinutes,
              hydrationGoalGlasses: dbData.userProfile.hydration_goal_glasses ?? userData.hydrationGoalGlasses,
              sleepGoalHours: dbData.userProfile.sleep_goal_hours ?? userData.sleepGoalHours,
              weightGoal: dbData.userProfile.weight_goal || userData.weightGoal,
              mealPortionSize: dbData.userProfile.meal_portion_size ?? userData.mealPortionSize,
              purchasedItems: dbData.purchasedItems?.map((item: any) => item.item_id) || userData.purchasedItems,
              roomCustomization: {
                lightType: dbData.userProfile.light_type || userData.roomCustomization?.lightType,
                plantType: dbData.userProfile.plant_type || userData.roomCustomization?.plantType,
              },
              // Daily data from database (prioritize daily_data over daily_progress)
              ...(dbData.dailyData && {
                studyMinutesToday: dbData.dailyData.study_minutes_today ?? userData.studyMinutesToday,
                missedCheckpoints: dbData.dailyData.missed_checkpoints ?? userData.missedCheckpoints,
                ateBreakfast: dbData.dailyData.ate_breakfast ?? userData.ateBreakfast,
                waterGlasses: dbData.dailyData.water_glasses ?? userData.waterGlasses,
                mealsLogged: dbData.dailyData.meals_logged ?? userData.mealsLogged,
                exerciseMinutes: dbData.dailyData.exercise_minutes ?? userData.exerciseMinutes,
                appleTapsToday: dbData.dailyData.apple_taps_today ?? userData.appleTapsToday,
                coffeeTapsToday: dbData.dailyData.coffee_taps_today ?? userData.coffeeTapsToday,
              }),
              // Fallback to daily_progress if daily_data is not available
              ...(!dbData.dailyData && dbData.dailyProgress && {
                studyMinutesToday: dbData.dailyProgress.study_minutes_today ?? userData.studyMinutesToday,
                missedCheckpoints: dbData.dailyProgress.missed_checkpoints ?? userData.missedCheckpoints,
                ateBreakfast: dbData.dailyProgress.ate_breakfast ?? userData.ateBreakfast,
                waterGlasses: dbData.dailyProgress.water_glasses ?? userData.waterGlasses,
                mealsLogged: dbData.dailyProgress.meals_logged ?? userData.mealsLogged,
                exerciseMinutes: dbData.dailyProgress.exercise_minutes ?? userData.exerciseMinutes,
              }),
              // Sleep sessions from database
              sleepSessions: dbData.sleepSessions?.map((session: any) => ({
                id: session.id,
                start: session.start_time,
                end: session.end_time,
                duration: session.duration_hours,
                date: session.date_assigned,
              })) || userData.sleepSessions,
            };

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

            set({ 
              userData: mergedUserData,
              deadlines: mergedDeadlines
            });
            console.log('[Load] ✅ Database data merged successfully');
            
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
        const [, get] = args;
        const { userData } = get();
        
        if (!userData.studyGoalHours || !userData.studyCheckpoints) return { isBehind: false };
        
        const today = new Date().toDateString();
        const signupDate = (userData as any).signupDate || today;
        const isFirstDay = signupDate === today;
        
        if (isFirstDay) {
          return { isBehind: false };
        }
        
        const now = new Date();
        const currentHour = now.getHours();
        const currentMinute = now.getMinutes();
        const currentTimeDecimal = currentHour + (currentMinute / 60);
        
        const studyHours = (userData.studyMinutesToday || 0) / 60;
        const goalHours = userData.studyGoalHours;
        
        const checkpointTimes = {
          '9 AM': 9,
          '12 PM': 12,
          '3 PM': 15,
          '6 PM': 18,
          '9 PM': 21
        };
        
        let currentCheckpoint = null;
        let checkpointHour = 0;
        
        for (const checkpoint of userData.studyCheckpoints) {
          const hour = checkpointTimes[checkpoint as keyof typeof checkpointTimes];
          if (currentTimeDecimal >= hour && hour > checkpointHour) {
            currentCheckpoint = checkpoint;
            checkpointHour = hour;
          }
        }
        
        if (!currentCheckpoint) return { isBehind: false };
        
        const expectedHours = goalHours * (checkpointHour / 24);
        const actualHours = studyHours;
        
        if (actualHours < expectedHours) {
          const missingHours = expectedHours - actualHours;
          
          return {
            isBehind: true,
            checkpoint: currentCheckpoint,
            checkpointHour,
            expected: expectedHours,
            actual: actualHours,
            missing: missingHours
          };
        }
        
        return { isBehind: false };
      },

      addMissedCheckpoint: (missingHours: number = 1) => {
        const [set, get] = args;
        const { userData } = get();
        const newMissedCount = (userData.missedCheckpoints || 0) + 1;
        
        const messPointsIncrease = Math.max(0.5, missingHours);
        const newMessPoints = userData.messPoints + messPointsIncrease;
        
        const updatedUserData = {
          ...userData,
          missedCheckpoints: newMissedCount,
          messPoints: newMessPoints,
          maxEnergyCap: 100,
          energy: Math.min(userData.energy, 100)
        };
        
        set({ userData: updatedUserData });
        
        // Sync the changes to database
        syncToDatabase(updatedUserData);
        
        console.log(`[Checkpoint] Added ${messPointsIncrease} mess points for missed checkpoint (${userData.messPoints} → ${newMessPoints})`);
      },

      checkAndProcessCheckpoints: () => {
        const [, get] = args;
        const { checkStudyCheckpoints, addMissedCheckpoint } = get();
        
        const checkResult = checkStudyCheckpoints();
        
        if (checkResult.isBehind && checkResult.missing && checkResult.expected && checkResult.actual && checkResult.checkpoint) {
          addMissedCheckpoint(checkResult.missing);
          
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
        return (_state, error) => {
          if (error) {
            console.error('[Storage] Failed to rehydrate:', error);
          } else {
            console.log('[Storage] Data rehydration completed');
          }
        };
      }
    }
  )
);