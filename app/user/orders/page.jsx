'use client'
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useSession } from '@supabase/auth-helpers-react';

export default function UserOrders() {
  const [orders, setOrders] = useState([]);
  const session = useSession();

  useEffect(() => {
    if (!session) return;

    const fetchOrders = async () => {
      const { data } = await supabase
        .from('live_orders')
        .select('*')
        .eq('user_id', session.user.id)
        .order('created_at', { ascending: false });
      setOrders(data);
    };
    fetchOrders();

    const subscription = supabase
      .channel('user_live_orders')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'live_orders', filter: `user_id=eq.${session.user.id}` },
        payload => {
          setOrders(prev => {
            const updated = [...prev];
            if (payload.eventType === 'INSERT') updated.unshift(payload.new);
            else if (payload.eventType === 'UPDATE') 
              return updated.map(o => (o.id === payload.new.id ? payload.new : o));
            else if (payload.eventType === 'DELETE') 
              return updated.filter(o => o.id !== payload.old.id);
            return updated;
          });
        }
      )
      .subscribe();

    return () => supabase.removeChannel(subscription);
  }, [session]);

  return (
    <div>
      <h1>Your Orders</h1>
      {orders.map(o => (
        <div key={o.id}>
          <div>Total: ₹{o.total_amount}</div>
          <div>Status: {o.status}</div>
        </div>
      ))}
    </div>
  );
}
