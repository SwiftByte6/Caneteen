'use client';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import Image from 'next/image';
import { 
  Clock, 
  CheckCircle, 
  XCircle, 
  Package, 
  Calendar,
  DollarSign,
  ShoppingBag,
  RefreshCw,
  Utensils
} from 'lucide-react';
import tensor from '@/public/tenor.gif';

export default function UserOrders() {
  const [orders, setOrders] = useState([]);
  const [userId, setUserId] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getUserId = async () => {
      const { data, error } = await supabase.auth.getUser();
      if (error) {
        console.error('Error getting user:', error);
        setLoading(false);
        return;
      }
      if (data?.user) {
        setUserId(data.user.id);
      } else {
        setLoading(false);
      }
    };
    getUserId();
  }, []);

  useEffect(() => {
    if (!userId) return;

    const fetchOrders = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('live_orders')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching orders:', error);
        setLoading(false);
        return;
      }
      setOrders(data || []);
      setLoading(false);
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

  const getStatusConfig = (status) => {
    switch (status) {
      case 'pending':
        return {
          color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
          icon: Clock,
          text: 'Preparing'
        };
      case 'success':
        return {
          color: 'bg-green-100 text-green-800 border-green-200',
          icon: CheckCircle,
          text: 'Completed'
        };
      case 'cancelled':
      case 'failed':
        return {
          color: 'bg-red-100 text-red-800 border-red-200',
          icon: XCircle,
          text: 'Cancelled'
        };
      default:
        return {
          color: 'bg-gray-100 text-gray-800 border-gray-200',
          icon: Package,
          text: status || 'Unknown'
        };
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <RefreshCw className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-4" />
              <p className="text-gray-600">Loading your orders...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-2">
            <div className="bg-blue-100 p-2 rounded-full">
              <Utensils className="h-6 w-6 text-blue-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900">Your Orders</h1>
          </div>
          <p className="text-gray-600">Track your current and past orders</p>
        </div>

        {/* Orders List */}
        {orders.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
            <div className="bg-gray-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
              <ShoppingBag className="h-10 w-10 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No orders yet</h3>
            <p className="text-gray-600 mb-6">
              You haven't placed any orders yet. Start by exploring our menu!
            </p>
            <button 
              onClick={() => window.location.href = '/user/menu'}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
            >
              Browse Menu
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => {
              const statusConfig = getStatusConfig(order.status);
              const StatusIcon = statusConfig.icon;
              
              return (
                <div
                  key={order.id}
                  className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow"
                >
                  <div className="p-6">
                    {/* Order Header */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <div className="bg-blue-50 p-2 rounded-lg">
                          <Package className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900">
                            Order #{order.id}
                          </h3>
                          <div className="flex items-center text-sm text-gray-500 mt-1">
                            <Calendar className="h-4 w-4 mr-1" />
                            {order.created_at ? formatDate(order.created_at) : 'Date unavailable'}
                          </div>
                        </div>
                      </div>
                      
                      {/* Status Badge */}
                      <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${statusConfig.color}`}>
                        {order.status === 'pending' ? (
                          <div className="flex items-center space-x-2">
                            <Image
                              src={tensor}
                              alt="Cooking..."
                              width={20}
                              height={20}
                              className="rounded"
                            />
                            <span>Preparing</span>
                          </div>
                        ) : (
                          <div className="flex items-center space-x-1">
                            <StatusIcon className="h-4 w-4" />
                            <span>{statusConfig.text}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Order Details */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-gray-100">
                      <div className="flex items-center space-x-3">
                        <div className="bg-green-50 p-2 rounded-lg">
                          <DollarSign className="h-4 w-4 text-green-600" />
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Total Amount</p>
                          <p className="font-semibold text-gray-900">
                            {formatCurrency(order.total_amount)}
                          </p>
                        </div>
                      </div>
                      
                      {order.items && (
                        <div className="flex items-center space-x-3">
                          <div className="bg-purple-50 p-2 rounded-lg">
                            <ShoppingBag className="h-4 w-4 text-purple-600" />
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">Items</p>
                            <p className="font-semibold text-gray-900">
                              {Array.isArray(order.items) ? order.items.length : 'Multiple'} item(s)
                            </p>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Order Items (if available) */}
                    {order.items && Array.isArray(order.items) && order.items.length > 0 && (
                      <div className="mt-4 pt-4 border-t border-gray-100">
                        <h4 className="text-sm font-medium text-gray-900 mb-2">Order Items:</h4>
                        <div className="space-y-2">
                          {order.items.map((item, index) => (
                            <div key={index} className="flex justify-between items-center text-sm">
                              <span className="text-gray-700">
                                {item.name || `Item ${index + 1}`} 
                                {item.quantity && ` × ${item.quantity}`}
                              </span>
                              {item.price && (
                                <span className="text-gray-900 font-medium">
                                  {formatCurrency(item.price)}
                                </span>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
