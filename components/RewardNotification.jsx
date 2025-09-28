'use client'

import { useEffect, useState } from 'react'
import { Trophy, X } from 'lucide-react'

export default function RewardNotification({ achievement, onClose, duration = 3000 }) {
  const [show, setShow] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => {
      setShow(false)
      setTimeout(() => {
        onClose()
      }, 300) // Allow fade out animation
    }, duration)

    return () => clearTimeout(timer)
  }, [duration, onClose])

  const handleClose = () => {
    setShow(false)
    setTimeout(() => {
      onClose()
    }, 300)
  }

  if (!achievement) return null

  return (
    <div className={`fixed top-4 right-4 z-50 transform transition-all duration-300 ${
      show ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
    }`}>
      <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-4 max-w-sm">
        <div className="flex items-start space-x-3">
          <div className="bg-gradient-to-r from-yellow-400 to-yellow-600 p-2 rounded-full">
            <Trophy className="h-5 w-5 text-white" />
          </div>
          
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-semibold text-gray-900">
              🎉 Achievement Unlocked!
            </h3>
            <p className="text-sm text-gray-600 mt-1">
              {achievement.title}
            </p>
            <p className="text-xs text-green-600 font-medium mt-1">
              {achievement.reward} earned!
            </p>
          </div>
          
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  )
}
