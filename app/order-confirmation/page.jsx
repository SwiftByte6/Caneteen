'use client'
import { useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useDispatch, useSelector } from 'react-redux';
import { supabase } from '@/lib/supabaseClient';
import { cartClear } from '@/redux/slice';

const SuccessPage = () => {
  const router = useRouter();
  const cart = useSelector((state) => state.cart); // your cart slice
  const dispatch = useDispatch();
  const [userId, setUserId] = useState(null);
  const [rewardRules, setRewardRules] = useState([]);
  const [earnedRewards, setEarnedRewards] = useState([]);

  // Fetch logged-in user
  const fetchUser = async () => {
    try {
      const { data, error } = await supabase.auth.getUser();
      if (error) {
        return null;
      }
      
      if (!data.user) {
        router.push('/'); // Redirect to login if no user
        return null;
      }
      setUserId(data.user.id);
      return data.user.id;
    } catch (error) {
      return null;
    }
  };

  const fetchRewardRules = async () => {
    try {
      const { data, error } = await supabase
        .from('reward_rules')
        .select('id, item_slug, required_purchases, discount_percent, active')
        .eq('active', true); // Only get active reward rules
      
      if (error) {
        return [];
      }
      setRewardRules(data || []);
      return data || [];
    } catch (error) {
      setRewardRules([]);
      return [];
    }
  }
  // Insert order into order_history
  const insertOrderHistory = async (uid, total) => {
    const { error } = await supabase.from('order_history').insert([
      {
        user_id: uid,
        items: cart,
        total_amount: total,
        payment_status: 'paid',
      },
    ]);
  };

  // Insert order into live_orders
  const insertLiveOrder = async (uid, total) => {
    const { error } = await supabase.from('live_orders').insert([
      {
        user_id: uid,
        items: cart,
        total_amount: total,
        status: 'pending', // default live status
      },
    ]);
  };

  // Generate a unique coupon code starting with PIMIRO
  const generateCouponCode = () => {
    const randomPart = Math.random().toString(36).substring(2, 8).toUpperCase();
    const timestampPart = Date.now().toString().slice(-4);
    return `PIMIRO${randomPart}${timestampPart}`;
  };

  // Create coupon when user earns a reward using existing discount_coupons table
  const createCoupon = async (uid, rewardInfo, rewardRuleId) => {
    try {
      const couponCode = generateCouponCode();
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 3); // Expires in 3 days

      const { data, error } = await supabase
        .from('discount_coupons')
        .insert([{
          user_id: uid,
          reward_rule_id: rewardRuleId,
          code: couponCode,
          discount_percent: rewardInfo.discountPercent,
          status: 'active',
          expires_at: expiresAt.toISOString()
        }])
        .select();

      if (error) {
        return null;
      }

      return {
        ...rewardInfo,
        couponCode,
        expiresAt: expiresAt.toISOString()
      };
    } catch (error) {
      return null;
    }
  };

  // Update loyalty rewards for purchased items
  const updateLoyaltyRewards = async (uid, cartItems, rules) => {
    try {
      // Test if loyalty_rewards table is accessible
      const { error: testError } = await supabase
        .from('loyalty_rewards')
        .select('count', { count: 'exact', head: true });
      
      if (testError) {
        return;
      }
      
      for (const cartItem of cartItems) {
        const itemSlug = cartItem.slug || cartItem.item_slug;
        const quantity = cartItem.quantity || 1;
        
        if (!itemSlug) {
          continue;
        }

        // Find matching reward rule for this item
        const matchingRule = rules.find(rule => rule.item_slug === itemSlug);
        
        // Check if user already has a loyalty record for this item
        
        const { data: existingRecord, error: fetchError } = await supabase
          .from('loyalty_rewards')
          .select('*')
          .eq('user_id', uid)
          .eq('item_slug', itemSlug)
          .single();

        if (fetchError && fetchError.code !== 'PGRST116') {
          continue;
        }

        if (existingRecord) {
          // Update existing record
          const newCount = existingRecord.purchase_count + quantity;
          
          const { error: updateError } = await supabase
            .from('loyalty_rewards')
            .update({
              purchase_count: newCount,
              reward_rule_id: matchingRule ? matchingRule.id : null,
              updated_at: new Date().toISOString()
            })
            .eq('id', existingRecord.id);

          if (!updateError) {
            // Check if user earned a reward milestone (only generate coupon when exactly reaching the milestone)
            if (matchingRule && 
                matchingRule.active && 
                newCount >= matchingRule.required_purchases &&
                existingRecord.purchase_count < matchingRule.required_purchases) {
              
              // Check if user already has an active coupon for this reward rule
              const { data: existingCoupon } = await supabase
                .from('discount_coupons')
                .select('id')
                .eq('user_id', uid)
                .eq('reward_rule_id', matchingRule.id)
                .eq('status', 'active')
                .single();

              // Only create coupon if no active coupon exists for this reward rule
              if (!existingCoupon) {
                const rewardInfo = {
                  itemSlug,
                  discountPercent: matchingRule.discount_percent,
                  requiredPurchases: matchingRule.required_purchases
                };
                
                // Generate PIMIRO coupon for this milestone achievement
                const couponInfo = await createCoupon(uid, rewardInfo, matchingRule.id);
                if (couponInfo) {
                  setEarnedRewards(prev => [...prev, couponInfo]);
                } else {
                  setEarnedRewards(prev => [...prev, rewardInfo]);
                }
              }
            }
          }
        } else {
          // Create new loyalty record
          const insertData = {
            user_id: uid,
            item_slug: itemSlug,
            purchase_count: quantity,
            reward_rule_id: matchingRule ? matchingRule.id : null
          };
          
          const { data: insertedData, error: insertError } = await supabase
            .from('loyalty_rewards')
            .insert([insertData])
            .select();

          if (!insertError) {
            // Check if this new purchase immediately qualifies for a reward milestone
            if (matchingRule && 
                matchingRule.active && 
                quantity >= matchingRule.required_purchases) {
              
              // Check if user already has an active coupon for this reward rule
              const { data: existingCoupon } = await supabase
                .from('discount_coupons')
                .select('id')
                .eq('user_id', uid)
                .eq('reward_rule_id', matchingRule.id)
                .eq('status', 'active')
                .single();

              // Only create coupon if no active coupon exists for this reward rule
              if (!existingCoupon) {
                const rewardInfo = {
                  itemSlug,
                  discountPercent: matchingRule.discount_percent,
                  requiredPurchases: matchingRule.required_purchases
                };
                
                // Generate PIMIRO coupon for this milestone achievement
                const couponInfo = await createCoupon(uid, rewardInfo, matchingRule.id);
                if (couponInfo) {
                  setEarnedRewards(prev => [...prev, couponInfo]);
                } else {
                  setEarnedRewards(prev => [...prev, rewardInfo]);
                }
              }
            }
          }
        }
      }
    } catch (error) {
      // Handle error silently
    }
  }

  useEffect(() => {
    if (!cart || cart.length === 0) {
      router.push('/user/checkout');
      return;
    }

    const processOrder = async () => {
      try {
        // Get authenticated user ID first - this is critical
        const authenticatedUserId = await fetchUser();
        
        if (!authenticatedUserId) {
          router.push('/'); // Redirect to login
          return;
        }
        
        // Fetch reward rules
        const rules = await fetchRewardRules();
        
        // Calculate total amount
        const total = cart.reduce(
          (sum, item) => sum + (Number(item.price) || 0) * (Number(item.quantity) || 1),
          0
        );

        // Insert into both tables with the authenticated user ID
        await insertLiveOrder(authenticatedUserId, total);
        await insertOrderHistory(authenticatedUserId, total);

        // Process loyalty rewards
        await updateLoyaltyRewards(authenticatedUserId, cart, rules);

        // Clear cart after successful processing
        dispatch(cartClear());

        // Redirect after 3 seconds
        const timer = setTimeout(() => {
          router.push('/user/dashboard');
        }, 3000);

        // Cleanup timer on component unmount
        return () => clearTimeout(timer);
        
      } catch (error) {
        // Don't redirect on error, let user see the error
      }
    };

    processOrder();
  }, [cart, router, dispatch]); // Add necessary dependencies

  return (
    <div className="flex flex-col justify-center items-center h-screen bg-gray-100 p-4">
      <motion.div
        className="w-[300px] h-[300px] rounded-full flex justify-center items-center bg-lime-500 shadow-xl mb-8"
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 260, damping: 20 }}
        whileHover={{ scale: 1.1 }}
      >
        <motion.h1
          className="font-bold text-4xl text-white"
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          Success
        </motion.h1>
      </motion.div>

      {/* Reward Notifications */}
      {earnedRewards.length > 0 && (
        <motion.div
          className="bg-yellow-100 border border-yellow-400 rounded-lg p-4 max-w-md w-full"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <h3 className="text-lg font-bold text-yellow-800 mb-2">🎉 Rewards Earned!</h3>
          {earnedRewards.map((reward, index) => (
            <div key={index} className="text-yellow-700 mb-3 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
              <div className="font-semibold">
                <strong>{reward.itemSlug}:</strong> {reward.discountPercent}% discount unlocked!
              </div>
              <div className="text-sm mt-1">
                ({reward.requiredPurchases} purchases completed)
              </div>
              {reward.couponCode && (
                <div className="mt-2 p-2 bg-white rounded border border-dashed border-yellow-400">
                  <div className="text-xs text-yellow-600 font-medium">Your Coupon Code:</div>
                  <div className="font-mono text-lg font-bold text-yellow-800">{reward.couponCode}</div>
                  <div className="text-xs text-yellow-600 mt-1">
                    Expires: {new Date(reward.expiresAt).toLocaleDateString()}
                  </div>
                </div>
              )}
            </div>
          ))}
        </motion.div>
      )}

      <motion.p
        className="text-gray-600 mt-4 text-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.7 }}
      >
        Redirecting to dashboard in 3 seconds...
      </motion.p>
    </div>
  );
};

export default SuccessPage;
