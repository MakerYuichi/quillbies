# 🗄️ Quillby Database Overview

## 📍 **Where Your Database is Located**

### **Database Provider: Supabase**
- **URL**: `https://kkhruuvwqodyhmspqlma.supabase.co`
- **Type**: PostgreSQL (hosted by Supabase)
- **Location**: Cloud-hosted (Supabase infrastructure)
- **Project ID**: `kkhruuvwqodyhmspqlma`

### **Access Details**
- **Public URL**: https://kkhruuvwqodyhmspqlma.supabase.co
- **Dashboard**: https://supabase.com/dashboard/project/kkhruuvwqodyhmspqlma
- **Database**: PostgreSQL with real-time capabilities
- **Authentication**: Supabase Auth with device-based authentication

## 🏗️ **Database Schema (Tables)**

Your Quillby app uses **9 main tables**:

### **1. `user_profiles`** - Main user data
```sql
- id (UUID, primary key)
- buddy_name (text)
- selected_character (text)
- user_name (text)
- student_level (text)
- country (text)
- timezone (text)
- q_coins (integer)
- mess_points (numeric)
- current_streak (integer)
- enabled_habits (text[])
- study_goal_hours (integer)
- exercise_goal_minutes (integer)
- hydration_goal_glasses (integer)
- sleep_goal_hours (integer)
- weight_goal (text)
- meal_portion_size (numeric)
- light_type (text)
- plant_type (text)
- created_at (timestamp)
- updated_at (timestamp)
```

### **2. `daily_data`** - Daily habit tracking
```sql
- user_id (UUID, foreign key)
- date (date)
- study_minutes_today (integer)
- missed_checkpoints (integer)
- ate_breakfast (boolean)
- water_glasses (integer)
- meals_logged (integer)
- exercise_minutes (integer)
- apple_taps_today (integer)
- coffee_taps_today (integer)
- created_at (timestamp)
- updated_at (timestamp)
```

### **3. `daily_progress`** - Alternative daily tracking
```sql
- user_id (UUID, foreign key)
- date (date)
- energy (integer)
- q_coins (integer)
- mess_points (numeric)
- ate_breakfast (boolean)
- water_glasses (integer)
- meals_logged (integer)
- exercise_minutes (integer)
- study_minutes_today (integer)
- missed_checkpoints (integer)
- current_streak (integer)
```

### **4. `deadlines`** - Task/deadline management
```sql
- id (UUID, primary key)
- user_id (UUID, foreign key)
- title (text)
- due_date (timestamp)
- due_time (text)
- priority (text)
- category (text)
- estimated_hours (numeric)
- work_completed (numeric)
- is_completed (boolean)
- reminder_one_day_before (boolean)
- reminder_three_days_before (boolean)
- created_at (timestamp)
```

### **5. `focus_sessions`** - Study session tracking
```sql
- id (UUID, primary key)
- user_id (UUID, foreign key)
- deadline_id (UUID, foreign key, optional)
- start_time (timestamp)
- end_time (timestamp)
- duration_seconds (integer)
- focus_score (integer)
- distraction_count (integer)
- total_break_time (integer)
- apple_premium_used (boolean)
- coffee_premium_used (boolean)
- created_at (timestamp)
```

### **6. `sleep_sessions`** - Sleep tracking
```sql
- id (UUID, primary key)
- user_id (UUID, foreign key)
- start_time (timestamp)
- end_time (timestamp)
- duration_hours (numeric)
- date_assigned (date)
- quality (text)
- coins_earned (integer)
- created_at (timestamp)
```

### **7. `shop_items`** - Available shop items
```sql
- id (UUID, primary key)
- name (text)
- description (text)
- price (integer)
- category (text)
- asset_path (text)
- icon (text)
- is_active (boolean)
```

### **8. `purchased_items`** - User purchases
```sql
- id (UUID, primary key)
- user_id (UUID, foreign key)
- item_id (text)
- purchased_at (timestamp)
```

### **9. `profiles`** - Basic user profiles (fallback)
```sql
- id (UUID, primary key)
- email (text)
- buddy_name (text)
- selected_character (text)
- user_name (text)
- student_level (text)
- country (text)
- timezone (text)
- data_synced (boolean)
- last_sync_at (timestamp)
- created_at (timestamp)
- updated_at (timestamp)
```

## 💾 **Data Storage Layers**

### **1. Local Storage (Device)**
- **Location**: Device's AsyncStorage
- **Key**: `'quillby-modular-storage'` (new) or `'quillby-storage'` (old)
- **Purpose**: Offline functionality, fast access
- **Data**: Complete user state for offline use

### **2. Cloud Database (Supabase)**
- **Location**: Supabase cloud servers
- **Purpose**: Data persistence, sync across devices
- **Data**: All user data, normalized across tables

### **3. Secure Storage (Device)**
- **Location**: Device's secure keychain/keystore
- **Key**: `'quillby_device_id'`
- **Purpose**: Device authentication
- **Data**: Unique device identifier

## 🔄 **Data Flow**

```
Device (AsyncStorage) ←→ App State (Zustand) ←→ Supabase (PostgreSQL)
                                ↓
                        Secure Storage (Device ID)
```

### **Sync Process:**
1. **App starts** → Load from AsyncStorage (instant)
2. **Background** → Sync with Supabase (when online)
3. **User actions** → Update local state + sync to cloud
4. **Periodic** → Auto-sync every 5 minutes

## 🔐 **Authentication & Security**

### **Device-Based Auth:**
- Each device gets a unique UUID
- Stored securely in device keychain
- No email/password required
- Data tied to device ID

### **Database Security:**
- Row Level Security (RLS) currently **disabled** for development
- All operations go through your app's API layer
- Supabase handles connection security (SSL/TLS)

## 🌐 **Access Your Database**

### **Supabase Dashboard:**
1. Go to: https://supabase.com/dashboard
2. Find project: `kkhruuvwqodyhmspqlma`
3. View tables, data, and run queries

### **Direct Database Access:**
- **Host**: `db.kkhruuvwqodyhmspqlma.supabase.co`
- **Port**: `5432`
- **Database**: `postgres`
- **Connection**: Use service role key from `.env`

### **API Access:**
- **REST API**: `https://kkhruuvwqodyhmspqlma.supabase.co/rest/v1/`
- **Real-time**: `wss://kkhruuvwqodyhmspqlma.supabase.co/realtime/v1/`

## 📊 **Current Data Status**

Based on your app structure:
- ✅ **Database**: Fully configured and operational
- ✅ **Tables**: All 9 tables created and functional
- ✅ **Sync**: Working between local and cloud
- ✅ **Authentication**: Device-based auth working
- ⚠️ **Storage**: Old cached data causing room display issues

## 🧹 **Storage Cleanup Needed**

The "old Quillby room" issue is because:
1. **Local cache** still has old data from `'quillby-storage'` key
2. **New store** uses `'quillby-modular-storage'` key
3. **Need to clear** old AsyncStorage data

Your database is working perfectly - it's just the local cache that needs clearing!