'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { Trophy, Star, Gift, Target, Award, Zap } from 'lucide-react'

export default function AchievementProgress({ userId }) {
  const [achievements, setAchievements] = useState([])
  const [loyaltyRewards, setLoyaltyRewards] = useState([])
  const [coupons, setCoupons] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (userId) {
      loadAchievementData()
    }
  }, [userId])

  const loadAchievementData = async () => {
    try {
      // Load loyalty rewards
      const { data: loyaltyData, error: loyaltyError } = await supabase
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

      if (loyaltyError) {
        console.error('Error loading loyalty rewards:', loyaltyError)
      } else {
        setLoyaltyRewards(loyaltyData || [])
      }

      // Load active coupons
      const { data: couponData, error: couponError } = await supabase
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

      if (couponError) {
        console.error('Error loading coupons:', couponError)
      } else {
        setCoupons(couponData || [])
      }

      // Load reward rules for achievements
      const { data: rewardRules, error: rulesError } = await supabase
        .from('reward_rules')
        .select('*')
        .eq('active', true)

      if (rulesError) {
        console.error('Error loading reward rules:', rulesError)
      } else {
        // Process achievements based on loyalty rewards and rules
        const processedAchievements = processAchievements(loyaltyData || [], rewardRules || [])
        setAchievements(processedAchievements)
      }

      setLoading(false)
    } catch (error) {
      console.error('Error loading achievement data:', error)
      setLoading(false)
    }
  }

  const processAchievements = (loyaltyData, rewardRules) => {
    const achievements = []

    // Process each reward rule as a potential achievement
    rewardRules.forEach(rule => {
      const userLoyalty = loyaltyData.find(lr => lr.item_slug === rule.item_slug)
      const currentPurchases = userLoyalty?.purchase_count || 0
      const progress = Math.min((currentPurchases / rule.required_purchases) * 100, 100)
      const isCompleted = currentPurchases >= rule.required_purchases

      achievements.push({
        id: rule.id,
        title: `${rule.item_slug.replace('-', ' ').toUpperCase()} Master`,
        description: rule.description || `Buy ${rule.required_purchases} ${rule.item_slug.replace('-', ' ')} to unlock ${rule.discount_percent}% discount`,
        progress,
        isCompleted,
        currentCount: currentPurchases,
        requiredCount: rule.required_purchases,
        reward: `${rule.discount_percent}% discount`,
        itemSlug: rule.item_slug,
        icon: getAchievementIcon(rule.item_slug)
      })
    })

    return achievements
  }

  const getAchievementIcon = (itemSlug) => {
    const iconMap = {
      'burger': Trophy,
      'fries': Star,
      'drink': Gift,
      'pizza': Award,
      'default': Target
    }
    return iconMap[itemSlug] || iconMap.default
  }

  const getBadgeColor = (progress) => {
    if (progress === 100) return 'bg-gradient-to-r from-yellow-400 to-yellow-600'
    if (progress >= 75) return 'bg-gradient-to-r from-blue-400 to-blue-600'
    if (progress >= 50) return 'bg-gradient-to-r from-green-400 to-green-600'
    if (progress >= 25) return 'bg-gradient-to-r from-purple-400 to-purple-600'
    return 'bg-gradient-to-r from-gray-400 to-gray-600'
  }

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-20 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-900 flex items-center">
          <Trophy className="h-6 w-6 mr-2 text-yellow-500" />
          Achievement Progress
        </h2>
        <div className="text-sm text-gray-500">
          {achievements.filter(a => a.isCompleted).length} of {achievements.length} completed
        </div>
      </div>

      {/* Active Coupons */}
      {coupons.length > 0 && (
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
            <Gift className="h-5 w-5 mr-2 text-green-500" />
            Active Rewards
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {coupons.map((coupon) => (
              <div key={coupon.id} className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-green-800">{coupon.code}</p>
                    <p className="text-sm text-green-600">{coupon.discount_percent}% off</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-green-600">
                      {coupon.expires_at ? `Expires: ${new Date(coupon.expires_at).toLocaleDateString()}` : 'No expiry'}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Achievement Progress */}
      <div className="space-y-4">
        {achievements.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Target className="h-12 w-12 mx-auto mb-3 text-gray-300" />
            <p>No achievements available yet. Start ordering to unlock rewards!</p>
          </div>
        ) : (
          achievements.map((achievement) => {
            const IconComponent = achievement.icon
            return (
              <div key={achievement.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded-full ${getBadgeColor(achievement.progress)}`}>
                      <IconComponent className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">{achievement.title}</h4>
                      <p className="text-sm text-gray-600">{achievement.description}</p>
                    </div>
                  </div>
                  {achievement.isCompleted && (
                    <div className="flex items-center text-green-600">
                      <Zap className="h-4 w-4 mr-1" />
                      <span className="text-sm font-medium">Unlocked!</span>
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>Progress: {achievement.currentCount}/{achievement.requiredCount}</span>
                    <span>{achievement.reward}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all duration-300 ${getBadgeColor(achievement.progress)}`}
                      style={{ width: `${achievement.progress}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            )
          })
        )}
      </div>

      {/* Quick Stats */}
      <div className="mt-6 pt-6 border-t border-gray-200">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-2xl font-bold text-blue-600">{achievements.filter(a => a.isCompleted).length}</p>
            <p className="text-sm text-gray-600">Badges Earned</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-green-600">{coupons.length}</p>
            <p className="text-sm text-gray-600">Active Coupons</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-purple-600">{loyaltyRewards.length}</p>
            <p className="text-sm text-gray-600">Items Tracked</p>
          </div>
        </div>
      </div>
    </div>
  )
}
