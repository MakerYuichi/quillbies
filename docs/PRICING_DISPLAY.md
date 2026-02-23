# How Pricing is Displayed in Quillby

## 🎯 Important: Prices are Fetched from Google Play Store

The actual prices displayed in the app are **automatically fetched from Google Play Store** through RevenueCat. This means:

✅ **No hardcoded prices in the code**
✅ **Automatically shows correct currency (₹ for India)**
✅ **Handles regional pricing automatically**
✅ **Updates instantly if you change prices in Play Console**

## 📱 How It Works

### 1. Google Play Console Setup
You create products with prices:
```
premium_monthly: ₹599/month
premium_yearly: ₹4999/year
gems_100: ₹99
gems_500: ₹449
gems_1000: ₹849
gems_2500: ₹1699
```

### 2. RevenueCat Fetches Prices
When the app calls `getOfferings()`, RevenueCat:
- Connects to Google Play Store
- Fetches current prices
- Returns formatted price strings (e.g., "₹599.00")

### 3. App Displays Prices
The paywall modal uses:
```typescript
const formatPrice = (pkg: PurchasesPackage): string => {
  return pkg.product.priceString; // Already formatted with ₹ symbol!
};
```

## 💰 What Users See

### Premium Paywall
```
✨ Upgrade to Premium

Premium Benefits
🎨 Legendary Themes
   Galaxy, Japanese Zen, and Ocean themes

🛍️ Exclusive Shop Items
   Access premium furniture, plants, and decorations

⏰ Extended Focus Sessions
   Study for up to 120 minutes per session

🎁 Future Premium Features
   Early access to new features and content

💰 Best Value
   Save ₹2189 with yearly plan (30% off!)

Choose Your Plan

┌─────────────────────────┐
│ Monthly            [○]  │
│ ₹599.00                 │
│ per month               │
└─────────────────────────┘

┌─────────────────────────┐
│ Yearly             [●]  │  ← Save 30%
│ ₹4999.00                │
│ per year                │
└─────────────────────────┘

[Subscribe Now]
```

## 🌍 Regional Pricing

RevenueCat automatically handles:
- **India:** ₹ (Rupees)
- **USA:** $ (Dollars)
- **Europe:** € (Euros)
- **UK:** £ (Pounds)

The same code works for all regions!

## 🔧 Testing Prices

### Sandbox Mode
- Prices show as configured in Play Console
- No real money charged
- Test with test accounts

### Production Mode
- Real prices from Play Console
- Real money charged
- Users see their local currency

## 📝 Code Comments

The code includes price comments for reference:
```typescript
// Product IDs (must match Google Play Console and RevenueCat)
export const PRODUCT_IDS = {
  GEMS_SMALL: 'gems_100',      // 100 gems - ₹99
  GEMS_MEDIUM: 'gems_500',     // 500 gems - ₹449
  GEMS_LARGE: 'gems_1000',     // 1000 gems - ₹849
  GEMS_MEGA: 'gems_2500',      // 2500 gems - ₹1699
  
  PREMIUM_MONTHLY: 'premium_monthly',  // ₹599/month
  PREMIUM_YEARLY: 'premium_yearly',    // ₹4999/year
};
```

These comments are for developer reference only - the actual prices come from Play Store!

## ✅ Benefits of This Approach

1. **No Code Changes Needed**
   - Change prices in Play Console
   - App updates automatically

2. **Multi-Currency Support**
   - Same code works worldwide
   - Correct currency symbol always shown

3. **A/B Testing**
   - Test different prices easily
   - No app update required

4. **Compliance**
   - Prices always match Play Store
   - No discrepancies

## 🚨 Important Notes

- **Never hardcode prices** in the UI
- **Always use** `pkg.product.priceString`
- **Test thoroughly** before production
- **Verify prices** in Play Console match your intent

## 📊 Price Display Examples

### Monthly Plan
```typescript
Package: premium_monthly
priceString: "₹599.00"
period: "per month"
Display: "₹599.00 per month"
```

### Yearly Plan
```typescript
Package: premium_yearly
priceString: "₹4999.00"
period: "per year"
Display: "₹4999.00 per year"
Savings: "Save 30%"
```

### Gem Package
```typescript
Package: gems_500
priceString: "₹449.00"
gems: 500
Display: "500 Gems - ₹449.00"
```

## 🎨 UI Formatting

The paywall automatically:
- Shows currency symbol (₹)
- Formats decimals (.00)
- Displays billing period
- Calculates savings percentage
- Highlights best value

All without hardcoded prices! 🎉
