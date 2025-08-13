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
    <div className="p-6 bg-gray-100 min-h-screen">
  <h1 className="text-3xl font-bold mb-6 text-gray-800">Live Orders (Admin)</h1>
  
  <div className="grid gap-4">
    {orders.map(o => (
      <div
        key={o.id}
        className="bg-white shadow-md rounded-lg p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center"
      >
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          <div className="font-medium text-gray-700">User: <span className="text-gray-900">{o.user_id}</span></div>
          <div className="font-medium text-gray-700">Total: <span className="text-gray-900">₹{o.total_amount}</span></div>
          <div className={`font-semibold ${
            o.status === 'pending' ? 'text-yellow-500' :
            o.status === 'success' ? 'text-green-500' :
            'text-red-500'
          }`}>
            Status: {o.status}
          </div>
        </div>
        <div className="flex gap-2 mt-4 sm:mt-0">
          <button
            onClick={() => updateStatus(o.id, 'pending')}
            className="px-3 py-1 rounded-md bg-yellow-500 text-white hover:bg-yellow-600 transition"
          >
            Pending
          </button>
          <button
            onClick={() => updateStatus(o.id, 'success')}
            className="px-3 py-1 rounded-md bg-green-500 text-white hover:bg-green-600 transition"
          >
            Success
          </button>
        </div>
      </div>
    ))}
  </div>
</div>

  );
}
