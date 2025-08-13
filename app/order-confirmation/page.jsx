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

  // Fetch logged-in user
  const fetchUser = async () => {
    const { data, error } = await supabase.auth.getUser();
    if (error) {
      console.log(error.message);
      return;
    }
    setUserId(data.user.id);
  };

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
    if (error) console.error('Error inserting order history:', error);
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
    if (error) console.error('Error inserting live order:', error);
  };

  useEffect(() => {
    if (!cart || cart.length === 0) {
      router.push('/user/checkout');
      return;
    }

    const processOrder = async () => {
      await fetchUser();
      if (!userId) return; // wait until userId is set

      // Calculate total amount
      const total = cart.reduce(
        (sum, item) => sum + (Number(item.price) || 0) * (Number(item.quantity) || 1),
        0
      );

      // Insert into both tables
      await insertLiveOrder(userId, total);
      await insertOrderHistory(userId, total);

      // Clear cart
      dispatch(cartClear());
      console.log('Cart cleared');

      // Redirect after 3 seconds
      const timer = setTimeout(() => {
        router.push('/user/dashboard');
      }, 3000);

      return () => clearTimeout(timer);
    };

    processOrder();
  }, [cart, userId]);

  return (
    <div className="flex justify-center items-center h-screen bg-gray-100">
      <motion.div
        className="w-[300px] h-[300px] rounded-full flex justify-center items-center bg-lime-500 shadow-xl"
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
    </div>
  );
};

export default SuccessPage;
