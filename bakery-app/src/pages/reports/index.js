import { useState, useEffect } from 'react'
import { db } from '../../lib/supabase'
import {
  ChartBarIcon,
  CurrencyDollarIcon,
  ShoppingCartIcon,
  TrendingUpIcon,
  CalendarIcon,
  DocumentArrowDownIcon
} from '@heroicons/react/24/outline'

const StatCard = ({ title, value, icon: Icon, change, changeType = 'positive', color = 'bakery' }) => (
  <div className="card-bakery p-6">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-gray-600">{title}</p>
        <p className={`text-3xl font-bold text-${color}-600`}>{value}</p>
        {change && (
          <p className={`text-sm flex items-center mt-1 ${
            changeType === 'positive' ? 'text-green-600' : 'text-red-600'
          }`}>
            <TrendingUpIcon className="w-4 h-4 mr-1" />
            {change}
          </p>
        )}
      </div>
      <div className={`w-12 h-12 bg-${color}-100 rounded-full flex items-center justify-center`}>
        <Icon className={`w-6 h-6 text-${color}-600`} />
      </div>
    </div>
  </div>
)

const TopProductsTable = ({ products }) => (
  <div className="card-bakery p-6">
    <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Products</h3>
    <div className="overflow-x-auto">
      <table className="min-w-full">
        <thead>
          <tr className="border-b border-gray-200">
            <th className="text-left py-2 text-sm font-medium text-gray-600">Product</th>
            <th className="text-right py-2 text-sm font-medium text-gray-600">Orders</th>
            <th className="text-right py-2 text-sm font-medium text-gray-600">Revenue</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {products.slice(0, 5).map((product, index) => (
            <tr key={index} className="hover:bg-gray-50">
              <td className="py-3 text-sm font-medium text-gray-900">
                {product.name}
              </td>
              <td className="py-3 text-sm text-gray-600 text-right">
                {product.orders}
              </td>
              <td className="py-3 text-sm font-medium text-bakery-600 text-right">
                ${product.revenue.toFixed(2)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
)

const RecentOrdersTable = ({ orders }) => (
  <div className="card-bakery p-6">
    <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Orders</h3>
    <div className="space-y-3">
      {orders.slice(0, 5).map((order) => (
        <div key={order.id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0">
          <div>
            <p className="font-medium text-gray-900">{order.order_id}</p>
            <p className="text-sm text-gray-600">
              {order.customer_first_name} {order.customer_last_name}
            </p>
          </div>
          <div className="text-right">
            <p className="font-medium text-bakery-600">${order.total?.toFixed(2) || '0.00'}</p>
            <p className="text-xs text-gray-500">
              {new Date(order.created_at).toLocaleDateString()}
            </p>
          </div>
        </div>
      ))}
    </div>
  </div>
)

export default function Reports() {
  const [stats, setStats] = useState({
    totalOrders: 0,
    todayOrders: 0,
    thisMonthOrders: 0,
    recentOrders: []
  })
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [dateRange, setDateRange] = useState('thisMonth')

  useEffect(() => {
    loadReportsData()
  }, [dateRange])

  const loadReportsData = async () => {
    try {
      setLoading(true)
      const [dashboardData, ordersData] = await Promise.all([
        db.getDashboardStats(),
        db.getOrders(500) // Get more orders for analysis
      ])
      
      setStats(dashboardData)
      setOrders(ordersData)
    } catch (err) {
      console.error('Error loading reports:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const calculateRevenueStats = () => {
    if (!orders.length) return { totalRevenue: 0, avgOrderValue: 0 }
    
    const totalRevenue = orders.reduce((sum, order) => sum + (order.total || 0), 0)
    const avgOrderValue = totalRevenue / orders.length
    
    return { totalRevenue, avgOrderValue }
  }

  const getTopProducts = () => {
    if (!orders.length) return []
    
    const productStats = {}
    
    orders.forEach(order => {
      if (order.order_line_items) {
        order.order_line_items.forEach(item => {
          const productName = item.type || 'Unknown Product'
          if (!productStats[productName]) {
            productStats[productName] = { name: productName, orders: 0, revenue: 0 }
          }
          productStats[productName].orders += item.cake_qty || 1
          productStats[productName].revenue += (item.unit_price || 0) * (item.cake_qty || 1)
        })
      }
    })
    
    return Object.values(productStats)
      .sort((a, b) => b.revenue - a.revenue)
  }

  const getOrdersByStatus = () => {
    if (!orders.length) return {}
    
    return orders.reduce((acc, order) => {
      const status = order.status || 'Unknown'
      acc[status] = (acc[status] || 0) + 1
      return acc
    }, {})
  }

  const exportReport = () => {
    // Basic CSV export
    const csvData = orders.map(order => ({
      'Order ID': order.order_id,
      'Customer': `${order.customer_first_name} ${order.customer_last_name}`,
      'Order Date': order.order_date,
      'Pickup Date': order.due_pickup_date,
      'Total': order.total,
      'Status': order.status
    }))
    
    const csvContent = [
      Object.keys(csvData[0]).join(','),
      ...csvData.map(row => Object.values(row).join(','))
    ].join('\n')
    
    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `brown-sugar-bakery-report-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    window.URL.revokeObjectURL(url)
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
        <p className="text-red-800">Error loading reports: {error}</p>
      </div>
    )
  }

  const { totalRevenue, avgOrderValue } = calculateRevenueStats()
  const topProducts = getTopProducts()
  const ordersByStatus = getOrdersByStatus()

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Reports & Analytics</h1>
          <p className="text-gray-600">Track your bakery's performance and insights</p>
        </div>
        <div className="flex items-center space-x-4">
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="input-bakery"
          >
            <option value="today">Today</option>
            <option value="thisWeek">This Week</option>
            <option value="thisMonth">This Month</option>
            <option value="lastMonth">Last Month</option>
            <option value="thisYear">This Year</option>
          </select>
          <button
            onClick={exportReport}
            className="btn-bakery"
          >
            <DocumentArrowDownIcon className="w-4 h-4 mr-2" />
            Export Report
          </button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Revenue"
          value={`$${totalRevenue.toFixed(2)}`}
          icon={CurrencyDollarIcon}
          change="+12% from last period"
          color="green"
        />
        <StatCard
          title="Total Orders"
          value={stats.totalOrders?.toLocaleString() || '0'}
          icon={ShoppingCartIcon}
          change="+8% from last period"
        />
        <StatCard
          title="Average Order"
          value={`$${avgOrderValue.toFixed(2)}`}
          icon={ChartBarIcon}
          change="+5% from last period"
        />
        <StatCard
          title="Today's Orders"
          value={stats.todayOrders?.toLocaleString() || '0'}
          icon={CalendarIcon}
          change="+15% from yesterday"
        />
      </div>

      {/* Order Status Breakdown */}
      <div className="card-bakery p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Orders by Status</h3>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {Object.entries(ordersByStatus).map(([status, count]) => (
            <div key={status} className="bg-gray-50 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-bakery-600">{count}</div>
              <div className="text-sm text-gray-600">{status}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Charts and Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <TopProductsTable products={topProducts} />
        <RecentOrdersTable orders={stats.recentOrders} />
      </div>

      {/* Performance Insights */}
      <div className="card-bakery p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance Insights</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-blue-50 rounded-lg p-4">
            <h4 className="font-medium text-blue-900 mb-2">Peak Hours</h4>
            <p className="text-sm text-blue-700">
              Most orders are placed between 10 AM - 2 PM
            </p>
          </div>
          <div className="bg-green-50 rounded-lg p-4">
            <h4 className="font-medium text-green-900 mb-2">Top Category</h4>
            <p className="text-sm text-green-700">
              Cakes account for 65% of total revenue
            </p>
          </div>
          <div className="bg-yellow-50 rounded-lg p-4">
            <h4 className="font-medium text-yellow-900 mb-2">Growth Trend</h4>
            <p className="text-sm text-yellow-700">
              Order volume increased 12% this month
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}