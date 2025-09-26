'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { useRouter } from 'next/navigation'
import {
  Users,
  ShoppingCart,
  DollarSign,
  TrendingUp,
  Clock,
  CheckCircle,
  AlertTriangle,
  Star,
  ChefHat,
  Calendar,
  Eye,
  Plus,
  Settings,
  BarChart3,
  Package
} from 'lucide-react'

export default function AdminDashboard() {
  const router = useRouter()
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [dashboardStats, setDashboardStats] = useState({
    totalOrders: 0,
    totalUsers: 0,
    totalRevenue: 0,
    pendingOrders: 0,
    recentOrders: [],
    popularItems: []
  })

  useEffect(() => {
    const checkUserAccess = async () => {
      try {
        // Get current user
        const { data: { user }, error: userError } = await supabase.auth.getUser()

        if (userError || !user) {
          router.push('/')
          return
        }

        setUser(user)

        // Check user profile and role
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .single()

        if (profileError || !profile) {
          console.error('Profile not found or error:', profileError)
          router.push('/user/dashboard')
          return
        }

        // Verify user has admin role
        const userRole = profile.role?.trim().toLowerCase()
        if (userRole !== 'admin') {
          console.log('User role is not admin:', userRole)
          router.push('/user/dashboard')
          return
        }

        await loadDashboardData()
        setLoading(false)
      } catch (error) {
        console.error('Error checking user access:', error)
        router.push('/')
      }
    }

    checkUserAccess()
  }, [router])

  const loadDashboardData = async () => {
    try {
      // Mock data - replace with actual Supabase queries
      setDashboardStats({
        totalOrders: 156,
        totalUsers: 89,
        totalRevenue: 12450,
        pendingOrders: 8,
        recentOrders: [
          { id: 1, customer: 'John Doe', total: 125.50, status: 'pending', time: '10:30 AM' },
          { id: 2, customer: 'Jane Smith', total: 89.25, status: 'completed', time: '10:15 AM' },
          { id: 3, customer: 'Mike Johnson', total: 67.00, status: 'preparing', time: '10:00 AM' },
        ],
        popularItems: [
          { name: 'Cheese Burger', orders: 45, revenue: 3600 },
          { name: 'Chicken Pizza', orders: 38, revenue: 4560 },
          { name: 'Pasta Bowl', orders: 32, revenue: 2240 },
        ]
      })
    } catch (error) {
      console.error('Error loading dashboard data:', error)
    }
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }

  const quickActions = [
    { title: 'View Orders', icon: ShoppingCart, href: '/admin/live_orders', color: 'bg-orange-500' },
    { title: 'Manage Menu', icon: Package, href: '/admin/menu', color: 'bg-blue-500' },
    { title: 'View Users', icon: Users, href: '/admin/users', color: 'bg-green-500' },
    { title: 'Analytics', icon: BarChart3, href: '/admin/analytics', color: 'bg-purple-500' }
  ]

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-orange-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-orange-200 border-t-orange-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading admin dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-orange-50 p-6">
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <div className="bg-white rounded-2xl shadow-sm p-6 mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="bg-orange-100 p-3 rounded-full">
                <ChefHat className="h-8 w-8 text-orange-600" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
                <p className="text-gray-600">Welcome back! Here's what's happening today.</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.push('/admin/settings')}
                className="bg-gray-100 hover:bg-gray-200 text-gray-700 p-2 rounded-lg transition-colors"
              >
                <Settings className="h-5 w-5" />
              </button>
              <button
                onClick={handleLogout}
                className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition-colors"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
        <div>
         
         

        </div>
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-orange-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Orders</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{dashboardStats.totalOrders}</p>
                <p className="text-sm text-green-600 mt-1">+12% from yesterday</p>
              </div>
              <div className="bg-orange-100 p-3 rounded-full">
                <ShoppingCart className="h-6 w-6 text-orange-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-orange-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{formatCurrency(dashboardStats.totalRevenue)}</p>
                <p className="text-sm text-green-600 mt-1">+8% from yesterday</p>
              </div>
              <div className="bg-green-100 p-3 rounded-full">
                <DollarSign className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-orange-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Users</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{dashboardStats.totalUsers}</p>
                <p className="text-sm text-blue-600 mt-1">+5 new today</p>
              </div>
              <div className="bg-blue-100 p-3 rounded-full">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-orange-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pending Orders</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{dashboardStats.pendingOrders}</p>
                <p className="text-sm text-orange-600 mt-1">Needs attention</p>
              </div>
              <div className="bg-yellow-100 p-3 rounded-full">
                <Clock className="h-6 w-6 text-yellow-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-2xl p-6 shadow-sm mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {quickActions.map((action, index) => (
              <button
                key={index}
                onClick={() => router.push(action.href)}
                className="flex flex-col items-center p-4 rounded-xl border-2 border-gray-100 hover:border-orange-200 hover:bg-orange-50 transition-all group"
              >
                <div className={`${action.color} p-3 rounded-full mb-3 group-hover:scale-110 transition-transform`}>
                  <action.icon className="h-6 w-6 text-white" />
                </div>
                <span className="text-sm font-medium text-gray-700">{action.title}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

          {/* Recent Orders */}
          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900">Recent Orders</h3>
              <button
                onClick={() => router.push('/admin/live_orders')}
                className="text-orange-600 hover:text-orange-700 text-sm font-medium flex items-center"
              >
                <Eye className="h-4 w-4 mr-1" />
                View All
              </button>
            </div>
            <div className="space-y-4">
              {dashboardStats.recentOrders.map((order) => (
                <div key={order.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                  <div className="flex items-center space-x-3">
                    <div className="bg-orange-100 p-2 rounded-full">
                      <ShoppingCart className="h-4 w-4 text-orange-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">Order #{order.id}</p>
                      <p className="text-sm text-gray-600">{order.customer}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-900">{formatCurrency(order.total)}</p>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${order.status === 'completed' ? 'bg-green-100 text-green-800' :
                        order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-blue-100 text-blue-800'
                      }`}>
                      {order.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Popular Items */}
          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900">Popular Items</h3>
              <button
                onClick={() => router.push('/admin/analytics')}
                className="text-orange-600 hover:text-orange-700 text-sm font-medium flex items-center"
              >
                <BarChart3 className="h-4 w-4 mr-1" />
                View Analytics
              </button>
            </div>
            <div className="space-y-4">
              {dashboardStats.popularItems.map((item, index) => (
                <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                  <div className="flex items-center space-x-3">
                    <div className="bg-blue-100 p-2 rounded-full">
                      <Star className="h-4 w-4 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">{item.name}</p>
                      <p className="text-sm text-gray-600">{item.orders} orders</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-900">{formatCurrency(item.revenue)}</p>
                    <p className="text-sm text-gray-600">Revenue</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
