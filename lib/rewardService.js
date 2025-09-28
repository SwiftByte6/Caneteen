import { supabase } from './supabaseClient'

export class RewardService {
  // Get user's loyalty rewards
  static async getUserLoyaltyRewards(userId) {
    try {
      const { data, error } = await supabase
        .from('loyalty_rewards')
        .select(`
          *,
          reward_rules (
            id,
            item_slug,
            required_purchases,
            discount_percent,
            description,
            active
          )
        `)
        .eq('user_id', userId)

      if (error) throw error
      return { data, error: null }
    } catch (error) {
      console.error('Error fetching loyalty rewards:', error)
      return { data: null, error }
    }
  }

  // Get user's active coupons
  static async getUserCoupons(userId) {
    try {
      const { data, error } = await supabase
        .from('discount_coupons')
        .select(`
          *,
          reward_rules (
            id,
            item_slug,
            required_purchases,
            discount_percent,
            description
          )
        `)
        .eq('user_id', userId)
        .eq('status', 'active')
        .gt('expires_at', new Date().toISOString())

      if (error) throw error
      return { data, error: null }
    } catch (error) {
      console.error('Error fetching coupons:', error)
      return { data: null, error }
    }
  }

  // Get all active reward rules
  static async getRewardRules() {
    try {
      const { data, error } = await supabase
        .from('reward_rules')
        .select('*')
        .eq('active', true)

      if (error) throw error
      return { data, error: null }
    } catch (error) {
      console.error('Error fetching reward rules:', error)
      return { data: null, error }
    }
  }

  // Update loyalty reward count for an item
  static async updateLoyaltyReward(userId, itemSlug, increment = 1) {
    try {
      // First, check if loyalty reward exists
      const { data: existingReward, error: fetchError } = await supabase
        .from('loyalty_rewards')
        .select('*')
        .eq('user_id', userId)
        .eq('item_slug', itemSlug)
        .single()

      if (fetchError && fetchError.code !== 'PGRST116') {
        throw fetchError
      }

      if (existingReward) {
        // Update existing reward
        const { data, error } = await supabase
          .from('loyalty_rewards')
          .update({
            purchase_count: existingReward.purchase_count + increment,
            updated_at: new Date().toISOString()
          })
          .eq('id', existingReward.id)
          .select()

        if (error) throw error
        return { data, error: null }
      } else {
        // Create new loyalty reward
        const { data, error } = await supabase
          .from('loyalty_rewards')
          .insert({
            user_id: userId,
            item_slug: itemSlug,
            purchase_count: increment
          })
          .select()

        if (error) throw error
        return { data, error: null }
      }
    } catch (error) {
      console.error('Error updating loyalty reward:', error)
      return { data: null, error }
    }
  }

  // Check if user qualifies for a reward and create coupon
  static async checkAndCreateReward(userId, itemSlug) {
    try {
      // Get the reward rule for this item
      const { data: rewardRule, error: ruleError } = await supabase
        .from('reward_rules')
        .select('*')
        .eq('item_slug', itemSlug)
        .eq('active', true)
        .single()

      if (ruleError) throw ruleError
      if (!rewardRule) return { data: null, error: 'No reward rule found' }

      // Get user's loyalty reward for this item
      const { data: loyaltyReward, error: loyaltyError } = await supabase
        .from('loyalty_rewards')
        .select('*')
        .eq('user_id', userId)
        .eq('item_slug', itemSlug)
        .single()

      if (loyaltyError && loyaltyError.code !== 'PGRST116') {
        throw loyaltyError
      }

      const currentCount = loyaltyReward?.purchase_count || 0

      // Check if user qualifies for reward
      if (currentCount >= rewardRule.required_purchases) {
        // Check if user already has an active coupon for this reward
        const { data: existingCoupon, error: couponCheckError } = await supabase
          .from('discount_coupons')
          .select('*')
          .eq('user_id', userId)
          .eq('reward_rule_id', rewardRule.id)
          .eq('status', 'active')
          .gt('expires_at', new Date().toISOString())
          .single()

        if (couponCheckError && couponCheckError.code !== 'PGRST116') {
          throw couponCheckError
        }

        if (!existingCoupon) {
          // Create new coupon
          const couponCode = `${itemSlug.toUpperCase()}_${Date.now().toString(36).toUpperCase()}`
          const expiresAt = new Date()
          expiresAt.setDate(expiresAt.getDate() + 30) // 30 days expiry

          const { data: newCoupon, error: couponError } = await supabase
            .from('discount_coupons')
            .insert({
              user_id: userId,
              reward_rule_id: rewardRule.id,
              code: couponCode,
              discount_percent: rewardRule.discount_percent,
              expires_at: expiresAt.toISOString()
            })
            .select()

          if (couponError) throw couponError
          return { data: newCoupon, error: null }
        }
      }

      return { data: null, error: null }
    } catch (error) {
      console.error('Error checking and creating reward:', error)
      return { data: null, error }
    }
  }

  // Process order and update loyalty rewards
  static async processOrderRewards(userId, orderItems) {
    try {
      const results = []
      
      for (const item of orderItems) {
        // Update loyalty count for each item
        const { data: loyaltyData, error: loyaltyError } = await this.updateLoyaltyReward(
          userId, 
          item.slug || item.name?.toLowerCase().replace(/\s+/g, '-'), 
          item.quantity || 1
        )

        if (loyaltyError) {
          console.error(`Error updating loyalty for ${item.name}:`, loyaltyError)
          continue
        }

        // Check if user qualifies for a new reward
        const { data: rewardData, error: rewardError } = await this.checkAndCreateReward(
          userId,
          item.slug || item.name?.toLowerCase().replace(/\s+/g, '-')
        )

        if (rewardError) {
          console.error(`Error checking reward for ${item.name}:`, rewardError)
        }

        if (rewardData) {
          results.push({
            item: item.name,
            coupon: rewardData[0],
            message: `Congratulations! You've earned a ${rewardData[0].discount_percent}% discount coupon for ${item.name}!`
          })
        }
      }

      return { data: results, error: null }
    } catch (error) {
      console.error('Error processing order rewards:', error)
      return { data: null, error }
    }
  }

  // Use a coupon (mark as used)
  static async useCoupon(couponId) {
    try {
      const { data, error } = await supabase
        .from('discount_coupons')
        .update({ status: 'used' })
        .eq('id', couponId)
        .select()

      if (error) throw error
      return { data, error: null }
    } catch (error) {
      console.error('Error using coupon:', error)
      return { data: null, error }
    }
  }
}
