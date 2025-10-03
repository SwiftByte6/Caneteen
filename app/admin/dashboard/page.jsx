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
  const [revenueByDay, setRevenueByDay] = useState([]) // [{date: '2025-10-01', total: 1234}]
  const [ordersByCategory, setOrdersByCategory] = useState([]) // [{category:'snack', qty: 20}]

  // Simple helpers to render a pie chart from category data without extra deps
  const pieColors = ['#f97316', '#10b981', '#3b82f6', '#a855f7', '#f59e0b', '#ef4444', '#14b8a6']
  const buildPieSlices = (categoryRows) => {
    const total = (categoryRows || []).reduce((s, r) => s + (Number(r.qty) || 0), 0) || 1
    let cumulative = 0
    const cx = 90
    const cy = 90
    const r = 80
    return (categoryRows || []).map((row, idx) => {
      const value = (Number(row.qty) || 0) / total
      const startAngle = cumulative * 2 * Math.PI
      const endAngle = (cumulative + value) * 2 * Math.PI
      cumulative += value
      const largeArc = endAngle - startAngle > Math.PI ? 1 : 0
      const x1 = cx + r * Math.cos(startAngle)
      const y1 = cy + r * Math.sin(startAngle)
      const x2 = cx + r * Math.cos(endAngle)
      const y2 = cy + r * Math.sin(endAngle)
      const d = `M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 ${largeArc} 1 ${x2} ${y2} Z`
      return { d, color: pieColors[idx % pieColors.length], label: row.category || 'other', qty: Number(row.qty) || 0 }
    })
  }

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
      // Totals from order_history (fallback-safe)
      let totalOrders = 0
      let totalRevenue = 0
      let recentOrders = []
      let totalUsers = 0
      let pendingOrders = 0

      try {
        const { data: orders, error } = await supabase
          .from('order_history')
          .select('id, user_id, total_amount, status, created_at')
          .order('created_at', { ascending: false })
          .limit(50)
        if (!error && orders) {
          totalOrders = orders.length
          totalRevenue = orders.reduce((sum, o) => sum + (parseFloat(o.total_amount) || 0), 0)
          const seenUsers = new Set()
          orders.forEach(o => { if (o.user_id) seenUsers.add(o.user_id) })
          totalUsers = seenUsers.size
          pendingOrders = orders.filter(o => (o.status || '').toLowerCase() === 'pending').length
          recentOrders = orders.slice(0, 6).map(o => ({
            id: o.id,
            customer: o.user_id?.slice(0, 8) || 'User',
            total: parseFloat(o.total_amount) || 0,
            status: o.status || 'completed',
            time: new Date(o.created_at).toLocaleTimeString()
          }))
        }
      } catch (e) {
        console.warn('order_history not available, skipping totals')
      }

      // Pending from orders table if exists
      try {
        const { count, error } = await supabase
          .from('orders')
          .select('id', { count: 'exact', head: true })
          .eq('status', 'pending')
        if (!error && typeof count === 'number') pendingOrders = count
      } catch (e) {
        // ignore
      }

      // Popular items from order_items join (fallback to Items if not present)
      let popularItems = []
      try {
        const { data: aggregates, error } = await supabase
          .from('order_items')
          .select('item_id, quantity')
        if (!error && aggregates) {
          const qtyByItem = new Map()
          aggregates.forEach(ai => {
            const key = ai.item_id
            const qty = Number(ai.quantity) || 0
            qtyByItem.set(key, (qtyByItem.get(key) || 0) + qty)
          })

          const topIds = [...qtyByItem.entries()]
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5)
            .map(([id]) => id)

          if (topIds.length > 0) {
            const { data: items } = await supabase
              .from('Items')
              .select('id, name, price')
              .in('id', topIds)
            popularItems = topIds.map(id => {
              const item = items?.find(i => i.id === id)
              const orders = qtyByItem.get(id) || 0
              const revenue = orders * (parseFloat(item?.price) || 0)
              return { name: item?.name || `Item ${id}`, orders, revenue }
            })
          }
        }
      } catch (e) {
        // fallback: top recent Items
        const { data: items } = await supabase
          .from('Items')
          .select('id, name, price')
          .order('created_at', { ascending: false })
          .limit(5)
        popularItems = (items || []).map(i => ({ name: i.name, orders: 0, revenue: 0 }))
      }

      // Revenue last 7 days
      try {
        const since = new Date()
        since.setDate(since.getDate() - 6)
        const { data: revRows } = await supabase
          .from('order_history')
          .select('total_amount, created_at')
          .gte('created_at', since.toISOString())
        const byDay = new Map()
        ;(revRows || []).forEach(r => {
          const d = new Date(r.created_at)
          const key = new Date(d.getFullYear(), d.getMonth(), d.getDate()).toISOString().slice(0,10)
          byDay.set(key, (byDay.get(key) || 0) + (parseFloat(r.total_amount) || 0))
        })
        const days = [...Array(7)].map((_, i) => {
          const d = new Date()
          d.setDate(d.getDate() - (6 - i))
          const key = d.toISOString().slice(0,10)
          return { date: key, total: +(byDay.get(key) || 0).toFixed(2) }
        })
        setRevenueByDay(days)
      } catch (e) {
        setRevenueByDay([])
      }

      // Orders by category
      try {
        // If order_items unavailable, approximate using Items available true as stock proxy (low quality but safe)
        const { data: items } = await supabase
          .from('Items')
          .select('category, id')
        const counts = new Map()
        ;(items || []).forEach(i => {
          counts.set(i.category || 'uncategorized', (counts.get(i.category || 'uncategorized') || 0) + 1)
        })
        setOrdersByCategory([...counts.entries()].map(([category, qty]) => ({ category, qty })))
      } catch (e) {
        setOrdersByCategory([])
      }

      setDashboardStats({
        totalOrders,
        totalUsers,
        totalRevenue,
        pendingOrders,
        recentOrders,
        popularItems
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

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Revenue last 7 days */}
          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-900">Revenue (7 days)</h3>
              <TrendingUp className="h-5 w-5 text-green-600" />
            </div>
            <div className="h-56 flex items-end gap-2">
              {revenueByDay.length === 0 ? (
                <div className="text-gray-500 text-sm">No data</div>
              ) : (
                revenueByDay.map((d) => (
                  <div key={d.date} className="flex-1 flex flex-col items-center">
                    <div className="w-full bg-green-100 rounded-t-md" style={{ height: `${Math.min(100, d.total)}%` }}>
                      <div className="w-full bg-green-500 rounded-t-md h-full"></div>
                    </div>
                    <div className="text-[10px] text-gray-500 mt-1">{d.date.slice(5)}</div>
                    <div className="text-[10px] text-gray-700">₹{d.total}</div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Orders by Category */}
          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-900">Orders by Category</h3>
              <BarChart3 className="h-5 w-5 text-orange-600" />
            </div>
            {/* Split into Pie and Top Items bar */}
            {ordersByCategory.length === 0 ? (
              <div className="text-gray-500 text-sm">No data</div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Pie chart */}
                <div>
                  <svg viewBox="0 0 180 180" className="w-full h-48">
                    {buildPieSlices(ordersByCategory).map((s, i) => (
                      <path key={i} d={s.d} fill={s.color} />
                    ))}
                    <circle cx="90" cy="90" r="80" fill="none" stroke="#e5e7eb" strokeWidth="0" />
                  </svg>
                  <div className="mt-2 grid grid-cols-2 gap-2">
                    {buildPieSlices(ordersByCategory).map((s, i) => (
                      <div key={i} className="flex items-center text-xs text-gray-700">
                        <span className="inline-block w-3 h-3 rounded-sm mr-2" style={{ background: s.color }}></span>
                        <span className="capitalize">{s.label}</span>
                        <span className="ml-auto font-medium">{s.qty}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Horizontal bars for top categories */}
                <div className="space-y-3">
                  {ordersByCategory
                    .slice()
                    .sort((a,b) => b.qty - a.qty)
                    .slice(0,5)
                    .map((c, idx, arr) => {
                      const max = Math.max(1, ...arr.map(x => x.qty))
                      return (
                        <div key={c.category} className="flex items-center gap-3">
                          <div className="w-24 text-sm text-gray-700 capitalize truncate">{c.category}</div>
                          <div className="flex-1 h-3 bg-gray-100 rounded-full overflow-hidden">
                            <div className="h-3" style={{ width: `${(c.qty / max) * 100}%`, background: pieColors[idx % pieColors.length] }} />
                          </div>
                          <div className="w-8 text-right text-sm text-gray-700">{c.qty}</div>
                        </div>
                      )
                    })}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Top Items Horizontal Bar Chart */}
        <div className="bg-white rounded-2xl p-6 shadow-sm mb-8">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold text-gray-900">Top Items</h3>
            <Star className="h-5 w-5 text-yellow-500" />
          </div>
          {dashboardStats.popularItems.length === 0 ? (
            <div className="text-gray-500 text-sm">No data</div>
          ) : (
            <div className="space-y-3">
              {dashboardStats.popularItems.map((it, idx, arr) => {
                const max = Math.max(1, ...arr.map(x => x.orders))
                return (
                  <div key={it.name} className="flex items-center gap-3">
                    <div className="w-40 text-sm text-gray-700 truncate">{it.name}</div>
                    <div className="flex-1 h-3 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-3" style={{ width: `${(it.orders / max) * 100}%`, background: pieColors[idx % pieColors.length] }} />
                    </div>
                    <div className="w-12 text-right text-sm text-gray-700">{it.orders}</div>
                  </div>
                )
              })}
            </div>
          )}
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
