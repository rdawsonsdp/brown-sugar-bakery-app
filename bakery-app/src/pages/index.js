import { useState, useEffect } from 'react'
import { db } from '../lib/supabase'
import {
  ShoppingCartIcon,
  ClipboardDocumentListIcon,
  CurrencyDollarIcon,
  UsersIcon,
  TrendingUpIcon,
  ClockIcon
} from '@heroicons/react/24/outline'

const StatCard = ({ title, value, icon: Icon, change, changeType = 'positive' }) => (
  <div className="card-bakery p-6">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-gray-600">{title}</p>
        <p className="text-3xl font-bold text-brown-900">{value}</p>
        {change && (
          <p className={`text-sm flex items-center mt-1 ${
            changeType === 'positive' ? 'text-green-600' : 'text-red-600'
          }`}>
            <TrendingUpIcon className="w-4 h-4 mr-1" />
            {change}
          </p>
        )}
      </div>
      <div className="w-12 h-12 bg-bakery-100 rounded-full flex items-center justify-center">
        <Icon className="w-6 h-6 text-bakery-600" />
      </div>
    </div>
  </div>
)

const RecentOrderCard = ({ order }) => (
  <div className="flex items-center justify-between p-4 bg-white rounded-lg border border-gray-200 hover:shadow-sm transition-shadow">
    <div className="flex-1">
      <div className="flex items-center justify-between">
        <h4 className="font-medium text-gray-900">{order.order_id}</h4>
        <span className="text-sm text-gray-500">
          {new Date(order.created_at).toLocaleDateString()}
        </span>
      </div>
      <p className="text-sm text-gray-600 mt-1">
        {order.customer_first_name} {order.customer_last_name}
      </p>
      <p className="text-sm font-medium text-bakery-600 mt-1">
        ${order.total?.toFixed(2) || '0.00'}
      </p>
    </div>
    <div className="ml-4">
      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
        order.status === 'New' 
          ? 'bg-blue-100 text-blue-800'
          : order.status === 'In Progress'
          ? 'bg-yellow-100 text-yellow-800'
          : 'bg-green-100 text-green-800'
      }`}>
        {order.status}
      </span>
    </div>
  </div>
)

export default function Dashboard() {
  const [stats, setStats] = useState({
    totalOrders: 0,
    todayOrders: 0,
    thisMonthOrders: 0,
    recentOrders: []
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    loadDashboardData()
    
    // Set up real-time subscription
    const subscription = db.subscribeToOrders((payload) => {
      console.log('Real-time update:', payload)
      loadDashboardData() // Refresh data on changes
    })

    return () => {
      subscription?.unsubscribe()
    }
  }, [])

  const loadDashboardData = async () => {
    try {
      setLoading(true)
      const data = await db.getDashboardStats()
      setStats(data)
    } catch (err) {
      console.error('Error loading dashboard:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="loading-spin w-8 h-8 border-4 border-bakery-200 border-t-bakery-500 rounded-full"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-800">Error loading dashboard: {error}</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-bakery-500 to-bakery-600 rounded-xl p-6 text-white">
        <h1 className="text-3xl font-display font-bold mb-2">
          Welcome to Brown Sugar Bakery
        </h1>
        <p className="text-bakery-100">
          Manage your orders, track performance, and grow your business
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Orders"
          value={stats.totalOrders?.toLocaleString() || '0'}
          icon={ClipboardDocumentListIcon}
        />
        <StatCard
          title="Today's Orders"
          value={stats.todayOrders?.toLocaleString() || '0'}
          icon={ShoppingCartIcon}
          change="+12% from yesterday"
        />
        <StatCard
          title="This Month"
          value={stats.thisMonthOrders?.toLocaleString() || '0'}
          icon={CurrencyDollarIcon}
          change="+8% from last month"
        />
        <StatCard
          title="Active Customers"
          value="1,234"
          icon={UsersIcon}
          change="+5% from last month"
        />
      </div>

      {/* Recent Orders */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card-bakery p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Recent Orders</h3>
            <ClockIcon className="w-5 h-5 text-gray-400" />
          </div>
          <div className="space-y-4">
            {stats.recentOrders?.length > 0 ? (
              stats.recentOrders.map((order) => (
                <RecentOrderCard key={order.id} order={order} />
              ))
            ) : (
              <p className="text-gray-500 text-center py-8">No recent orders</p>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="card-bakery p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
          <div className="space-y-3">
            <button className="btn-bakery w-full justify-center">
              <ShoppingCartIcon className="w-5 h-5 mr-2" />
              New Order
            </button>
            <button className="btn-bakery-outline w-full justify-center">
              <ClipboardDocumentListIcon className="w-5 h-5 mr-2" />
              View All Orders
            </button>
            <button className="btn-bakery-secondary w-full justify-center">
              <CurrencyDollarIcon className="w-5 h-5 mr-2" />
              Generate Report
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}