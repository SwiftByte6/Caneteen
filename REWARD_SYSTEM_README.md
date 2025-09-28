# Reward System Documentation

## Overview
The reward system is designed to encourage customer loyalty by tracking purchases and offering discounts based on achievement milestones. It consists of three main components:

1. **Reward Rules** - Define what achievements are available
2. **Loyalty Rewards** - Track user progress toward achievements
3. **Discount Coupons** - Generated when users complete achievements

## Database Tables

### 1. `reward_rules`
Defines the available achievements and their requirements.

```sql
CREATE TABLE public.reward_rules (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  item_slug text NOT NULL,
  required_purchases integer NOT NULL,
  discount_percent numeric NOT NULL,
  description text,
  active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT reward_rules_pkey PRIMARY KEY (id)
);
```

**Example:**
- Item: `burger`
- Required Purchases: `3`
- Discount: `15%`
- Description: "Order 3 burgers to unlock 15% discount"

### 2. `loyalty_rewards`
Tracks user progress toward achievements.

```sql
CREATE TABLE public.loyalty_rewards (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  item_slug text NOT NULL,
  purchase_count integer NOT NULL DEFAULT 0,
  reward_rule_id uuid,
  updated_at timestamp without time zone DEFAULT now(),
  CONSTRAINT loyalty_rewards_pkey PRIMARY KEY (id),
  CONSTRAINT loyalty_rewards_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id),
  CONSTRAINT loyalty_rewards_reward_rule_id_fkey FOREIGN KEY (reward_rule_id) REFERENCES public.reward_rules(id)
);
```

### 3. `discount_coupons`
Generated when users complete achievements.

```sql
CREATE TABLE public.discount_coupons (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  reward_rule_id uuid NOT NULL,
  code text NOT NULL UNIQUE,
  discount_percent numeric NOT NULL,
  status text NOT NULL DEFAULT 'active'::text,
  created_at timestamp without time zone DEFAULT now(),
  expires_at timestamp without time zone,
  CONSTRAINT discount_coupons_pkey PRIMARY KEY (id),
  CONSTRAINT discount_coupons_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id),
  CONSTRAINT discount_coupons_reward_rule_id_fkey FOREIGN KEY (reward_rule_id) REFERENCES public.reward_rules(id)
);
```

## Components

### 1. AchievementProgress Component
- **Location:** `components/AchievementProgress.jsx`
- **Purpose:** Displays user's achievement progress and earned badges
- **Features:**
  - Progress bars for each achievement
  - Visual badges with different colors based on progress
  - Active coupons display
  - Quick stats overview

### 2. RewardDetails Component
- **Location:** `components/RewardDetails.jsx`
- **Purpose:** Shows available coupons during checkout
- **Features:**
  - Lists active coupons
  - Checks coupon eligibility based on cart items
  - Applies/removes coupons
  - Shows discount calculations

### 3. RewardAchievementModal Component
- **Location:** `components/RewardAchievementModal.jsx`
- **Purpose:** Shows achievement notifications after checkout
- **Features:**
  - 3-second auto-display with fade animations
  - Achievement progress visualization
  - Multiple achievement support
  - Action buttons to view rewards or continue shopping

### 4. RewardNotification Component
- **Location:** `components/RewardNotification.jsx`
- **Purpose:** Simple toast notification for achievements
- **Features:**
  - Slide-in notification from top-right
  - Auto-dismiss after 3 seconds
  - Compact design for non-intrusive display

### 5. RewardService
- **Location:** `lib/rewardService.js`
- **Purpose:** Handles all reward-related database operations
- **Methods:**
  - `getUserLoyaltyRewards(userId)` - Get user's loyalty progress
  - `getUserCoupons(userId)` - Get user's active coupons
  - `updateLoyaltyReward(userId, itemSlug, increment)` - Update purchase count
  - `checkAndCreateReward(userId, itemSlug)` - Check if user qualifies for reward
  - `processOrderRewards(userId, orderItems)` - Process rewards after order

### 6. useRewardAchievements Hook
- **Location:** `lib/useRewardAchievements.js`
- **Purpose:** Custom hook for managing achievement notifications
- **Methods:**
  - `checkAndShowAchievements(userId, orderItems)` - Check and display achievements
  - `closeModal()` - Close achievement modal
  - `showModal` - Boolean state for modal visibility
  - `achievements` - Array of current achievements

## Pages

### 1. User Rewards Page
- **Location:** `app/user/rewards/page.jsx`
- **Purpose:** Comprehensive view of all user rewards and achievements
- **Features:**
  - Achievement progress tracking
  - Active coupons management
  - Loyalty tracking overview
  - Statistics dashboard

### 2. Enhanced Checkout Page
- **Location:** `app/user/checkout/page.jsx`
- **Purpose:** Checkout with integrated reward system
- **Features:**
  - Reward details sidebar
  - Coupon application
  - Discount calculations
  - Real-time total updates
  - Achievement notification modal after order

### 4. Admin Rewards Management
- **Location:** `app/admin/rewards/page.jsx`
- **Purpose:** Manage reward rules and system
- **Features:**
  - Create/edit/delete reward rules
  - Toggle rule status
  - View all rules in table format

## How It Works

### 1. Achievement Tracking
1. User places an order
2. System updates loyalty rewards for each item
3. Checks if user qualifies for any new achievements
4. Creates discount coupons for completed achievements

### 2. Coupon Usage
1. User goes to checkout
2. System shows available coupons
3. User can apply eligible coupons
4. Discount is calculated and applied to total

### 3. Progress Visualization
1. User visits rewards page
2. System displays progress bars for each achievement
3. Shows earned badges and active coupons
4. Provides statistics and tracking information

## Setup Instructions

### 1. Database Setup
The tables are already defined in `supabaseTable.md`. Make sure they're created in your Supabase database and populated with your existing data.

### 2. Integration Points
- **Order Processing:** Call `RewardService.processOrderRewards()` after successful orders
- **Checkout:** Include `RewardDetails` component
- **Dashboard:** Include `AchievementProgress` component

## Example Usage

### Creating a Reward Rule
```javascript
const { data, error } = await supabase
  .from('reward_rules')
  .insert({
    item_slug: 'pizza',
    required_purchases: 2,
    discount_percent: 25,
    description: 'Order 2 pizzas to unlock 25% discount',
    active: true
  })
```

### Processing Order Rewards
```javascript
import { RewardService } from '@/lib/rewardService'

// After successful order
const orderItems = [
  { name: 'Burger', slug: 'burger', quantity: 1 },
  { name: 'Fries', slug: 'fries', quantity: 2 }
]

const result = await RewardService.processOrderRewards(userId, orderItems)
if (result.data) {
  // Show achievement notifications
  result.data.forEach(achievement => {
    console.log(achievement.message)
  })
}
```

### Applying Coupons
```javascript
// In checkout component
const handleCouponApplied = (coupon) => {
  if (coupon) {
    const discountAmount = (subtotal * coupon.discount_percent) / 100
    setDiscount(discountAmount)
    setFinalTotal(subtotal - discountAmount)
  }
}
```

## Customization

### Adding New Achievement Types
1. Add new reward rules in the admin panel
2. Update `getAchievementIcon()` function for new item types
3. Customize progress bar colors in `getBadgeColor()`

### Modifying Discount Logic
1. Update `calculateDiscount()` in RewardDetails component
2. Modify `processOrderRewards()` in RewardService
3. Adjust coupon creation logic in `checkAndCreateReward()`

### Styling
- All components use Tailwind CSS
- Colors and gradients can be customized in component files
- Icons are from Lucide React library

## Testing

1. **User Flow:** 
   - Login as user
   - Visit `/user/rewards` to see achievements
   - Add items to cart and go to checkout
   - Apply coupons and complete order
2. **Admin Flow:**
   - Login as admin
   - Visit `/admin/rewards` to manage rules
   - Create new rules and test the system

## Troubleshooting

### Common Issues
1. **No achievements showing:** Check if reward rules exist and are active
2. **Coupons not applying:** Verify coupon eligibility logic
3. **Progress not updating:** Ensure order processing calls reward service
4. **Database errors:** Check table relationships and foreign keys

### Debug Tips
- Check browser console for errors
- Verify Supabase connection and permissions
- Test database queries directly in Supabase dashboard
- Ensure your existing data follows the expected table structure
