'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { Gift, Percent, Clock, CheckCircle, AlertCircle } from 'lucide-react'

export default function RewardDetails({ userId, cartItems = [], onCouponApplied }) {
  const [availableCoupons, setAvailableCoupons] = useState([])
  const [appliedCoupon, setAppliedCoupon] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (userId) {
      loadAvailableCoupons()
    }
  }, [userId])

  const loadAvailableCoupons = async () => {
    try {
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
        .gt('expires_at', new Date().toISOString())

      if (couponError) {
        console.error('Error loading coupons:', couponError)
        setError('Failed to load available coupons')
      } else {
        setAvailableCoupons(couponData || [])
      }
      setLoading(false)
    } catch (error) {
      console.error('Error loading coupons:', error)
      setError('Failed to load available coupons')
      setLoading(false)
    }
  }

  const applyCoupon = (coupon) => {
    setAppliedCoupon(coupon)
    if (onCouponApplied) {
      onCouponApplied(coupon)
    }
  }

  const removeCoupon = () => {
    setAppliedCoupon(null)
    if (onCouponApplied) {
      onCouponApplied(null)
    }
  }

  const calculateDiscount = (coupon, cartItems) => {
    if (!coupon || !cartItems.length) return 0
    
    const subtotal = cartItems.reduce((acc, item) => acc + (item.price || 0) * (item.quantity || 1), 0)
    return (subtotal * coupon.discount_percent) / 100
  }

  const isCouponEligible = (coupon) => {
    if (!coupon.reward_rules || !cartItems.length) return false
    
    const rule = coupon.reward_rules
    const itemInCart = cartItems.find(item => 
      item.slug === rule.item_slug || 
      item.name?.toLowerCase().includes(rule.item_slug.replace('-', ' '))
    )
    
    return itemInCart && itemInCart.quantity >= 1
  }

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="space-y-3">
            {[1, 2].map(i => (
              <div key={i} className="h-16 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex items-center mb-4">
        <Gift className="h-6 w-6 mr-2 text-green-500" />
        <h3 className="text-lg font-semibold text-gray-900">Available Rewards</h3>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
          <div className="flex items-center">
            <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
            <p className="text-red-700">{error}</p>
          </div>
        </div>
      )}

      {appliedCoupon && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
              <div>
                <p className="font-semibold text-green-800">{appliedCoupon.code}</p>
                <p className="text-sm text-green-600">
                  {appliedCoupon.discount_percent}% off - 
                  Save ₹{calculateDiscount(appliedCoupon, cartItems).toFixed(2)}
                </p>
              </div>
            </div>
            <button
              onClick={removeCoupon}
              className="text-red-600 hover:text-red-800 text-sm font-medium"
            >
              Remove
            </button>
          </div>
        </div>
      )}

      {availableCoupons.length === 0 ? (
        <div className="text-center py-6 text-gray-500">
          <Gift className="h-12 w-12 mx-auto mb-3 text-gray-300" />
          <p>No active rewards available</p>
          <p className="text-sm">Complete more orders to unlock rewards!</p>
        </div>
      ) : (
        <div className="space-y-3">
          {availableCoupons.map((coupon) => {
            const isEligible = isCouponEligible(coupon)
            const discountAmount = calculateDiscount(coupon, cartItems)
            
            return (
              <div
                key={coupon.id}
                className={`border rounded-lg p-4 transition-all ${
                  isEligible 
                    ? 'border-green-200 bg-green-50 hover:bg-green-100' 
                    : 'border-gray-200 bg-gray-50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <span className="font-semibold text-gray-900">{coupon.code}</span>
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        <Percent className="h-3 w-3 mr-1" />
                        {coupon.discount_percent}% OFF
                      </span>
                    </div>
                    
                    <p className="text-sm text-gray-600 mb-2">
                      {coupon.reward_rules?.description || 'Discount coupon'}
                    </p>
                    
                    <div className="flex items-center text-xs text-gray-500">
                      <Clock className="h-3 w-3 mr-1" />
                      <span>
                        {coupon.expires_at 
                          ? `Expires: ${new Date(coupon.expires_at).toLocaleDateString()}`
                          : 'No expiry'
                        }
                      </span>
                    </div>

                    {isEligible && (
                      <p className="text-sm text-green-600 font-medium mt-1">
                        You save ₹{discountAmount.toFixed(2)} with this coupon!
                      </p>
                    )}
                  </div>

                  <div className="ml-4">
                    {isEligible ? (
                      <button
                        onClick={() => applyCoupon(coupon)}
                        disabled={appliedCoupon?.id === coupon.id}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                          appliedCoupon?.id === coupon.id
                            ? 'bg-green-600 text-white cursor-not-allowed'
                            : 'bg-green-600 hover:bg-green-700 text-white'
                        }`}
                      >
                        {appliedCoupon?.id === coupon.id ? 'Applied' : 'Apply'}
                      </button>
                    ) : (
                      <div className="text-xs text-gray-500 text-center">
                        <p>Add qualifying items</p>
                        <p>to cart to use</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Reward Rules Info */}
      <div className="mt-6 pt-4 border-t border-gray-200">
        <h4 className="text-sm font-semibold text-gray-700 mb-2">How to earn rewards:</h4>
        <ul className="text-xs text-gray-600 space-y-1">
          <li>• Order specific items multiple times to unlock discount coupons</li>
          <li>• Each achievement gives you a percentage discount</li>
          <li>• Coupons can be used on future orders</li>
          <li>• Check your dashboard for progress tracking</li>
        </ul>
      </div>
    </div>
  )
}
