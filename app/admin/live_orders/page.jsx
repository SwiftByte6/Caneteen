'use client'
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';

export default function AdminLiveOrders() {
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    // Fetch initial orders
    const fetchOrders = async () => {
      const { data } = await supabase
        .from('live_orders')
        .select('*')
        .order('created_at', { ascending: false });
      setOrders(data);
    };
    fetchOrders();

    // Subscribe to realtime changes
    const subscription = supabase
      .channel('live_orders_admin')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'live_orders' },
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
  }, []);

  const updateStatus = async (id, status) => {
    await supabase.from('live_orders').update({ status }).eq('id', id);
  };

  return (
    <div>
      <h1>Live Orders (Admin)</h1>
      {orders.map(o => (
        <div key={o.id} style={{ border: '1px solid gray', margin: '10px', padding: '10px' }}>
          <div>User: {o.user_id}</div>
          <div>Total: ₹{o.total_amount}</div>
          <div>Status: {o.status}</div>
          <button onClick={() => updateStatus(o.id, 'pending')}>Pending</button>
          <button onClick={() => updateStatus(o.id, 'success')}>Success</button>
        </div>
      ))}
    </div>
  );
}
