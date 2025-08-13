'use client'
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import Switcher1 from '@/components/Switcher1';

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
              <div className={`font-semibold ${o.status === 'pending' ? 'text-yellow-500' :
                  o.status === 'success' ? 'text-green-500' :
                    'text-red-500'
                }`}>
                Status: {o.status}
              </div>
            </div>
            <div className="flex items-center gap-4 mt-4 sm:mt-0">
              <label className="inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  className="sr-only peer"
                  checked={o.status === 'success'}
                  onChange={(e) =>
                    updateStatus(o.id, e.target.checked ? 'success' : 'pending')
                  }
                />
                <div className="relative w-11 h-6 bg-gray-200 rounded-full 
                    peer peer-focus:outline-none peer-focus:ring-4 
                    peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 
                    dark:bg-gray-700 
                    peer-checked:after:translate-x-full 
                    rtl:peer-checked:after:-translate-x-full 
                    peer-checked:after:border-white 
                    after:content-[''] after:absolute after:top-[2px] after:start-[2px] 
                    after:bg-white after:border-gray-300 after:border 
                    after:rounded-full after:h-5 after:w-5 
                    after:transition-all dark:border-gray-600 
                    peer-checked:bg-blue-600 dark:peer-checked:bg-blue-600"
                ></div>
              </label>

              <span className="text-sm font-medium text-gray-900 dark:text-gray-300">
                {o.status === 'success' ? 'Success' : 'Pending'}
              </span>
            </div>


          </div>

        ))}
      </div>
    </div>

  );
}
