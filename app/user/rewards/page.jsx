'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { useRouter } from 'next/navigation'
import { 
  Trophy, 
  Gift, 
  Star, 
  Target, 
  Award, 
  Zap, 
  Clock, 
  CheckCircle,
  AlertCircle,
  TrendingUp
} from 'lucide-react'
import { RewardService } from '@/lib/rewardService'

export default function RewardsPage() {
  const router = useRouter()
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [achievements, setAchievements] = useState([])
  const [coupons, setCoupons] = useState([])
  const [loyaltyRewards, setLoyaltyRewards] = useState([])
  const [stats, setStats] = useState({
    totalBadges: 0,
    activeCoupons: 0,
    totalSavings: 0,
    itemsTracked: 0
  })

  useEffect(() => {
    const checkUserAndLoadData = async () => {
      try {
        const { data: { user }, error: userError } = await supabase.auth.getUser()
        
        if (userError || !user) {
          router.push('/')
          return
        }

        setUser(user)
        await loadRewardData(user.id)
      } catch (error) {
        console.error('Error checking user:', error)
        router.push('/')
      }
    }

    checkUserAndLoadData()
  }, [router])

  const loadRewardData = async (userId) => {
    try {
      setLoading(true)

      // Load all reward data in parallel
      const [loyaltyResult, couponResult, rulesResult] = await Promise.all([
        RewardService.getUserLoyaltyRewards(userId),
        RewardService.getUserCoupons(userId),
        RewardService.getRewardRules()
      ])

      if (loyaltyResult.error) {
        console.error('Error loading loyalty rewards:', loyaltyResult.error)
      } else {
        setLoyaltyRewards(loyaltyResult.data || [])
      }

      if (couponResult.error) {
        console.error('Error loading coupons:', couponResult.error)
      } else {
        setCoupons(couponResult.data || [])
      }

      // Process achievements
      if (rulesResult.data && loyaltyResult.data) {
        const processedAchievements = processAchievements(loyaltyResult.data, rulesResult.data)
        setAchievements(processedAchievements)
      }

      // Calculate stats
      const totalBadges = achievements.filter(a => a.isCompleted).length
      const activeCoupons = couponResult.data?.length || 0
      const totalSavings = couponResult.data?.reduce((acc, coupon) => acc + (coupon.discount_percent || 0), 0) || 0
      const itemsTracked = loyaltyResult.data?.length || 0

      setStats({
        totalBadges,
        activeCoupons,
        totalSavings,
        itemsTracked
      })

      setLoading(false)
    } catch (error) {
      console.error('Error loading reward data:', error)
      setLoading(false)
    }
  }

  const processAchievements = (loyaltyData, rewardRules) => {
    const achievements = []

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
        icon: getAchievementIcon(rule.item_slug),
        earnedAt: userLoyalty?.updated_at
      })
    })

    return achievements.sort((a, b) => b.progress - a.progress)
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

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <div className="text-lg text-gray-600">Loading your rewards...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="bg-gradient-to-r from-yellow-400 to-yellow-600 p-3 rounded-full">
                <Trophy className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">My Rewards & Achievements</h1>
                <p className="text-gray-600">Track your progress and unlock exclusive rewards</p>
              </div>
            </div>
            <button
              onClick={() => router.push('/user/checkout')}
              className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              <Gift className="h-4 w-4" />
              <span>Use Rewards</span>
            </button>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="bg-yellow-100 p-3 rounded-full">
                <Trophy className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Badges Earned</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalBadges}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="bg-green-100 p-3 rounded-full">
                <Gift className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Active Coupons</p>
                <p className="text-2xl font-bold text-gray-900">{stats.activeCoupons}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="bg-blue-100 p-3 rounded-full">
                <TrendingUp className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Savings</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalSavings}%</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="bg-purple-100 p-3 rounded-full">
                <Target className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Items Tracked</p>
                <p className="text-2xl font-bold text-gray-900">{stats.itemsTracked}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Achievements */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Award className="h-5 w-5 mr-2 text-yellow-500" />
              Achievement Progress
            </h2>
            
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
                            <CheckCircle className="h-4 w-4 mr-1" />
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
                        {achievement.earnedAt && (
                          <p className="text-xs text-gray-500">
                            Last updated: {formatDate(achievement.earnedAt)}
                          </p>
                        )}
                      </div>
                    </div>
                  )
                })
              )}
            </div>
          </div>

          {/* Active Coupons */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Gift className="h-5 w-5 mr-2 text-green-500" />
              Active Coupons
            </h2>
            
            <div className="space-y-3">
              {coupons.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Gift className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                  <p>No active coupons available</p>
                  <p className="text-sm">Complete achievements to earn coupons!</p>
                </div>
              ) : (
                coupons.map((coupon) => (
                  <div key={coupon.id} className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <span className="font-semibold text-green-800">{coupon.code}</span>
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            <Zap className="h-3 w-3 mr-1" />
                            {coupon.discount_percent}% OFF
                          </span>
                        </div>
                        
                        <p className="text-sm text-green-600 mb-2">
                          {coupon.reward_rules?.description || 'Discount coupon'}
                        </p>
                        
                        <div className="flex items-center text-xs text-green-500">
                          <Clock className="h-3 w-3 mr-1" />
                          <span>
                            {coupon.expires_at 
                              ? `Expires: ${formatDate(coupon.expires_at)}`
                              : 'No expiry'
                            }
                          </span>
                        </div>
                      </div>
                      
                      <div className="ml-4">
                        <button
                          onClick={() => router.push('/user/checkout')}
                          className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-lg transition-colors"
                        >
                          Use Now
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Loyalty Tracking */}
        {loyaltyRewards.length > 0 && (
          <div className="mt-6 bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Target className="h-5 w-5 mr-2 text-purple-500" />
              Loyalty Tracking
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {loyaltyRewards.map((reward) => (
                <div key={reward.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold text-gray-900 capitalize">
                      {reward.item_slug.replace('-', ' ')}
                    </h4>
                    <span className="text-sm text-gray-500">
                      {reward.purchase_count} orders
                    </span>
                  </div>
                  
                  {reward.reward_rules && (
                    <div className="text-sm text-gray-600">
                      <p>Next reward: {reward.reward_rules.required_purchases - reward.purchase_count} more orders</p>
                      <p className="text-green-600 font-medium">
                        Earn {reward.reward_rules.discount_percent}% discount
                      </p>
                    </div>
                  )}
                  
                  <div className="mt-2">
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-purple-600 h-2 rounded-full transition-all duration-300"
                        style={{ 
                          width: `${Math.min((reward.purchase_count / (reward.reward_rules?.required_purchases || 1)) * 100, 100)}%` 
                        }}
                      ></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
