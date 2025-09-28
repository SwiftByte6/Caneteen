'use client';
import { useSelector } from 'react-redux';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import RewardDetails from '@/components/RewardDetails';
import RewardAchievementModal from '@/components/RewardAchievementModal';
import { useRewardAchievements } from '@/lib/useRewardAchievements';

export default function CheckoutPage() {
  const cartItems = useSelector((state) => state.cart) || [];
  const subtotal = cartItems.reduce((acc, item) => acc + (item.price || 0) * (item.quantity || 1), 0);
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [user, setUser] = useState(null);
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [discount, setDiscount] = useState(0);
  const router = useRouter();
  const { showModal, achievements, checkAndShowAchievements, closeModal } = useRewardAchievements();

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };
    getUser();
  }, []);

  const handleCouponApplied = (coupon) => {
    setAppliedCoupon(coupon);
    if (coupon) {
      const discountAmount = (subtotal * coupon.discount_percent) / 100;
      setDiscount(discountAmount);
    } else {
      setDiscount(0);
    }
  };

  const finalTotal = subtotal - discount;

  const orderData = {
    total_amount: finalTotal,
    transaction_id: 'TXN123',
    applied_coupon: appliedCoupon?.code || null,
    discount_amount: discount
  };



  const handlePlaceOrder = async () => {
    try {
      // Check for achievements first
      if (user && cartItems.length > 0) {
        const hasAchievements = await checkAndShowAchievements(user.id, cartItems);
        
        if (hasAchievements) {
          // Don't redirect immediately, let the modal handle it
          return;
        }
      }
      
      // If no achievements or error, proceed normally
      console.log("Order placed", { cartItems, name, address, subtotal });
      router.push('/order-confirmation', { state: orderData });
    } catch (error) {
      console.error('Error processing order:', error);
      // Still proceed with order even if rewards fail
      router.push('/order-confirmation', { state: orderData });
    }
  };

  const handleCloseAchievementModal = () => {
    closeModal();
    // Redirect to order confirmation after modal closes
    router.push('/order-confirmation', { state: orderData });
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Checkout</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Order Details */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold mb-4">Delivery Information</h2>
            
            <div className="mb-4">
              <label className="block mb-1 font-semibold">Full Name</label>
              <input 
                value={name} 
                onChange={(e) => setName(e.target.value)}
                className="border p-2 w-full rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
                placeholder="Enter your name" 
              />
            </div>

            <div className="mb-4">
              <label className="block mb-1 font-semibold">Address</label>
              <textarea 
                value={address} 
                onChange={(e) => setAddress(e.target.value)}
                className="border p-2 w-full rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
                placeholder="Enter your address"
                rows={3}
              ></textarea>
            </div>
          </div>

          {/* Order Summary */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold mb-4">Order Summary</h2>
            <div className="space-y-3">
              {cartItems.map((item) => (
                <div key={item.id} className="flex justify-between items-center py-2 border-b border-gray-100">
                  <div>
                    <span className="font-medium">{item.name}</span>
                    <span className="text-gray-500 ml-2">x {item.quantity}</span>
                  </div>
                  <span className="font-medium">₹{(item.price * item.quantity).toFixed(2)}</span>
                </div>
              ))}
              
              <div className="pt-3 space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Subtotal</span>
                  <span>₹{subtotal.toFixed(2)}</span>
                </div>
                
                {appliedCoupon && (
                  <div className="flex justify-between text-sm text-green-600">
                    <span>Discount ({appliedCoupon.code})</span>
                    <span>-₹{discount.toFixed(2)}</span>
                  </div>
                )}
                
                <div className="flex justify-between font-bold text-lg pt-2 border-t border-gray-200">
                  <span>Total</span>
                  <span>₹{finalTotal.toFixed(2)}</span>
                </div>
              </div>
            </div>

            <button
              onClick={handlePlaceOrder}
              className="mt-6 w-full bg-green-500 text-white py-3 rounded-lg hover:bg-green-600 transition font-semibold"
            >
              Place Order - ₹{finalTotal.toFixed(2)}
            </button>
          </div>
        </div>

        {/* Right Column - Rewards */}
        <div className="space-y-6">
          {user && (
            <RewardDetails 
              userId={user.id} 
              cartItems={cartItems}
              onCouponApplied={handleCouponApplied}
            />
          )}
        </div>
      </div>

      {/* Reward Achievement Modal */}
      {showModal && (
        <RewardAchievementModal
          achievements={achievements}
          onClose={handleCloseAchievementModal}
        />
      )}
    </div>
  );
}
