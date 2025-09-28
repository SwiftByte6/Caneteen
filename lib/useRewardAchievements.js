import { useState, useCallback } from 'react'
import { RewardService } from './rewardService'

export function useRewardAchievements() {
  const [showModal, setShowModal] = useState(false)
  const [achievements, setAchievements] = useState([])

  const checkAndShowAchievements = useCallback(async (userId, orderItems) => {
    try {
      if (!userId || !orderItems || orderItems.length === 0) return

      const rewardResult = await RewardService.processOrderRewards(userId, orderItems)
      
      if (rewardResult.data && rewardResult.data.length > 0) {
        // Filter only new achievements (not already achieved)
        const newAchievements = rewardResult.data.filter(achievement => !achievement.alreadyAchieved)
        
        if (newAchievements.length > 0) {
          // Transform the data for the modal
          const transformedAchievements = newAchievements.map(achievement => ({
            title: `${achievement.item.replace(/\s+/g, ' ').toUpperCase()} Master`,
            description: `You've successfully earned a ${achievement.coupon.discount_percent}% discount for ${achievement.item}!`,
            currentCount: orderItems.find(item => 
              item.name?.toLowerCase().includes(achievement.item.toLowerCase()) || 
              item.slug === achievement.item.toLowerCase().replace(/\s+/g, '-')
            )?.quantity || 1,
            requiredCount: 1, // Since they just achieved it
            reward: `${achievement.coupon.discount_percent}% discount`,
            itemSlug: achievement.item.toLowerCase().replace(/\s+/g, '-')
          }))
          
          setAchievements(transformedAchievements)
          setShowModal(true)
          return true // Indicates achievements were found
        }
      }
      
      return false // No new achievements
    } catch (error) {
      console.error('Error checking achievements:', error)
      return false
    }
  }, [])

  const closeModal = useCallback(() => {
    setShowModal(false)
    setAchievements([])
  }, [])

  return {
    showModal,
    achievements,
    checkAndShowAchievements,
    closeModal
  }
}
