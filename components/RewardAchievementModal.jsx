'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Trophy, Gift, Star, CheckCircle, X } from 'lucide-react'

export default function RewardAchievementModal({ achievements, onClose }) {
  const [currentAchievement, setCurrentAchievement] = useState(0)
  const [show, setShow] = useState(true)
  const router = useRouter()

  useEffect(() => {
    if (!achievements || achievements.length === 0) {
      onClose()
      return
    }

    // Auto-close after 3 seconds
    const timer = setTimeout(() => {
      setShow(false)
      setTimeout(() => {
        onClose()
      }, 300) // Allow fade out animation
    }, 3000)

    return () => clearTimeout(timer)
  }, [achievements, onClose])

  const handleClose = () => {
    setShow(false)
    setTimeout(() => {
      onClose()
    }, 300)
  }

  const handleViewRewards = () => {
    handleClose()
    router.push('/user/rewards')
  }

  const handleContinueShopping = () => {
    handleClose()
    router.push('/user/menu')
  }

  if (!achievements || achievements.length === 0) return null

  const achievement = achievements[currentAchievement]

  const getAchievementIcon = (itemSlug) => {
    const iconMap = {
      'burger': Trophy,
      'fries': Star,
      'drink': Gift,
      'pizza': Trophy,
      'default': Trophy
    }
    return iconMap[itemSlug] || iconMap.default
  }

  const getAchievementColor = (itemSlug) => {
    const colorMap = {
      'burger': 'from-yellow-400 to-yellow-600',
      'fries': 'from-orange-400 to-orange-600',
      'drink': 'from-blue-400 to-blue-600',
      'pizza': 'from-red-400 to-red-600',
      'default': 'from-purple-400 to-purple-600'
    }
    return colorMap[itemSlug] || colorMap.default
  }

  const IconComponent = getAchievementIcon(achievement.itemSlug)
  const gradientColor = getAchievementColor(achievement.itemSlug)

  return (
    <div className={`fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 transition-opacity duration-300 ${
      show ? 'opacity-100' : 'opacity-0'
    }`}>
      <div className={`bg-white rounded-2xl p-8 max-w-md mx-4 transform transition-all duration-300 ${
        show ? 'scale-100 translate-y-0' : 'scale-95 translate-y-4'
      }`}>
        {/* Close button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Achievement Icon */}
        <div className="flex justify-center mb-6">
          <div className={`bg-gradient-to-r ${gradientColor} p-6 rounded-full shadow-lg animate-pulse`}>
            <IconComponent className="h-16 w-16 text-white" />
          </div>
        </div>

        {/* Achievement Title */}
        <div className="text-center mb-4">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            🎉 Achievement Unlocked! 🎉
          </h2>
          <h3 className="text-xl font-semibold text-gray-800">
            {achievement.title}
          </h3>
        </div>

        {/* Achievement Details */}
        <div className="text-center mb-6">
          <p className="text-gray-600 mb-4">
            {achievement.description}
          </p>
          
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
            <div className="flex items-center justify-center mb-2">
              <Gift className="h-5 w-5 text-green-600 mr-2" />
              <span className="font-semibold text-green-800">Reward Earned!</span>
            </div>
            <p className="text-green-700 font-medium">
              {achievement.reward} discount coupon
            </p>
            <p className="text-sm text-green-600 mt-1">
              Check your rewards page to use it!
            </p>
          </div>

          {/* Progress Bar */}
          <div className="mb-4">
            <div className="flex justify-between text-sm text-gray-600 mb-2">
              <span>Progress: {achievement.currentCount}/{achievement.requiredCount}</span>
              <span className="font-medium">100% Complete!</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div 
                className={`bg-gradient-to-r ${gradientColor} h-3 rounded-full transition-all duration-1000`}
                style={{ width: '100%' }}
              ></div>
            </div>
          </div>
        </div>

        {/* Multiple Achievements Indicator */}
        {achievements.length > 1 && (
          <div className="text-center mb-6">
            <p className="text-sm text-gray-500">
              Achievement {currentAchievement + 1} of {achievements.length}
            </p>
            <div className="flex justify-center space-x-2 mt-2">
              {achievements.map((_, index) => (
                <div
                  key={index}
                  className={`w-2 h-2 rounded-full ${
                    index === currentAchievement ? 'bg-blue-500' : 'bg-gray-300'
                  }`}
                />
              ))}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="space-y-3">
          <button
            onClick={handleViewRewards}
            className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white py-3 px-6 rounded-lg font-semibold transition-all duration-200 transform hover:scale-105"
          >
            <Trophy className="h-5 w-5 inline mr-2" />
            View All Rewards
          </button>
          
          <button
            onClick={handleContinueShopping}
            className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 px-6 rounded-lg font-semibold transition-colors"
          >
            Continue Shopping
          </button>
        </div>

        {/* Auto-close indicator */}
        <div className="mt-4 text-center">
          <div className="text-xs text-gray-400">
            This notification will close automatically in 3 seconds
          </div>
        </div>
      </div>
    </div>
  )
}
