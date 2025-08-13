'use client';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import Image from 'next/image';
import tensor from '@/public/tenor.gif'

export default function UserOrders() {
  const [orders, setOrders] = useState([]);
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    const getUserId = async () => {
      const { data, error } = await supabase.auth.getUser();
      if (error) {
        console.error('Error getting user:', error);
        return;
      }
      if (data?.user) {
        setUserId(data.user.id);
      }
    };
    getUserId();
  }, []);

  useEffect(() => {
    if (!userId) return;

    const fetchOrders = async () => {
      const { data, error } = await supabase
        .from('live_orders')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching orders:', error);
        return;
      }
      setOrders(data || []);
    };

    fetchOrders();

    const subscription = supabase
      .channel(`user_live_orders_${userId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'live_orders',
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          console.log('Realtime event:', payload);

          setOrders((prev) => {
            if (payload.eventType === 'INSERT') {
              return [payload.new, ...prev];
            }
            if (payload.eventType === 'UPDATE') {
              return prev.map((o) =>
                o.id === payload.new.id ? payload.new : o
              );
            }
            if (payload.eventType === 'DELETE') {
              return prev.filter((o) => o.id !== payload.old.id);
            }
            return prev;
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, [userId]);

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-4">Your Orders</h1>
      {orders.length === 0 && <div>No orders yet.</div>}
      {orders.map((o) => (
        <div
          key={o.id}
          className="border rounded-lg p-3 mb-2 shadow-sm bg-white"
        >
          <div className="font-medium">Total: ₹{o.total_amount}</div>
         
<div className="font-semibold flex items-center gap-2">
  Status:
  <div className="font-semibold flex items-center gap-2">
  Status:
  {o.status === 'pending' ? (
    <Image
      src={tensor}
      alt="Cooking..."
      width={74}
      height={74}
    />
  ) : o.status === 'success' ? (
    <span className="text-green-500 bg-orange-400" >{o.status}</span>
  ) : (
    <span className="text-red-500">{o.status}</span>
  )}
</div>
</div>
        </div>
      ))}
    </div>
  );
}
