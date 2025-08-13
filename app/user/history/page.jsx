'use client'
import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useSelector } from 'react-redux';
import Image from 'next/image';

const OrderHistory = () => {
  const [orders, setOrders] = useState([]);
  const cart = useSelector(state => state.cart); // if needed for reference

  const fetchOrders = async () => {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData?.user?.id) return;

    const { data, error } = await supabase
      .from('order_history')
      .select('*')
      .eq('user_id', userData.user.id)
      .order('created_at', { ascending: false });

    if (error) console.log(error);
    else setOrders(data);
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  return (
    <div className="p-4 bg-gray-100 min-h-screen">
      <h2 className="text-2xl font-bold mb-4">Order History</h2>
      <div className="space-y-4">
        {orders.map(order => (
          <div
            key={order.id}
            className="bg-white rounded-xl shadow p-4 flex items-center justify-between"
          >
            {/* Thumbnail */}
            <div className="w-20 h-20 rounded-xl overflow-hidden flex-shrink-0">
              <Image
                src="/burger.jpg" // Replace with order image if available
                alt="Food Item"
                width={80}
                height={80}
                className="object-cover"
              />
            </div>

            {/* Order details */}
            <div className="flex-1 ml-4">
              <h3 className="font-semibold text-lg">
                {order.items[0]?.name || 'Food Item'}
              </h3>
              <p className="text-gray-500 text-sm">
                {order.items.map(i => `${i.qty} x ${i.name}`).join(', ')}
              </p>
              <p className="text-gray-400 text-xs mt-1">
                {new Date(order.created_at).toLocaleDateString()} {new Date(order.created_at).toLocaleTimeString()}
              </p>
            </div>

            {/* Actions / amount */}
            <div className="flex flex-col items-end">
              <span className="font-bold text-lg">Tk {order.total_amount}</span>
              <div className="mt-2 space-x-2">
                <button className="bg-green-500 text-white px-3 py-1 rounded-md text-sm hover:bg-green-600">
                  Rate
                </button>
                <button className="bg-blue-500 text-white px-3 py-1 rounded-md text-sm hover:bg-blue-600">
                  Re-order
                </button>
              </div>
            </div>
          </div>
        ))}
        {orders.length === 0 && (
          <p className="text-gray-500 text-center mt-10">No order history found.</p>
        )}
      </div>
    </div>
  );
};

export default OrderHistory;
