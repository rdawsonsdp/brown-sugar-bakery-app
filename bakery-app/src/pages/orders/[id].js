import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import { db } from '../../lib/supabase'
import {
  ArrowLeftIcon,
  PencilIcon,
  PrinterIcon,
  CheckCircleIcon,
  ClockIcon,
  UserIcon,
  PhoneIcon,
  EnvelopeIcon,
  CalendarIcon,
  CakeIcon
} from '@heroicons/react/24/outline'

const StatusBadge = ({ status, onStatusChange }) => {
  const statuses = ['New', 'In Progress', 'Ready', 'Completed', 'Cancelled']
  const colors = {
    'New': 'bg-blue-100 text-blue-800',
    'In Progress': 'bg-yellow-100 text-yellow-800',
    'Ready': 'bg-green-100 text-green-800',
    'Completed': 'bg-gray-100 text-gray-800',
    'Cancelled': 'bg-red-100 text-red-800'
  }

  return (
    <div className="flex items-center space-x-2">
      <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${colors[status] || colors['New']}`}>
        {status}
      </span>
      <select
        value={status}
        onChange={(e) => onStatusChange(e.target.value)}
        className="text-sm border border-gray-300 rounded px-2 py-1"
      >
        {statuses.map(s => (
          <option key={s} value={s}>{s}</option>
        ))}
      </select>
    </div>
  )
}

const LineItemCard = ({ item }) => (
  <div className="border border-gray-200 rounded-lg p-4">
    <div className="flex justify-between items-start mb-2">
      <div className="flex-1">
        <h4 className="font-medium text-gray-900">
          Line {item.line_item}: {item.type}
        </h4>
        {item.size && (
          <p className="text-sm text-gray-600">Size: {item.size}</p>
        )}
        {item.writing_notes && (
          <p className="text-sm text-gray-600">Writing: {item.writing_notes}</p>
        )}
        {item.color && (
          <p className="text-sm text-gray-600">Color: {item.color}</p>
        )}
      </div>
      <div className="text-right">
        <p className="font-medium text-gray-900">
          {item.cake_qty} × ${item.unit_price?.toFixed(2) || '0.00'}
        </p>
        <p className="text-lg font-bold text-bakery-600">
          ${((item.unit_price || 0) * (item.cake_qty || 1)).toFixed(2)}
        </p>
      </div>
    </div>
    <div className="text-xs text-gray-500">
      Category: {item.category || 'Cake'}
    </div>
  </div>
)

export default function OrderDetail() {
  const router = useRouter()
  const { id } = router.query
  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [updating, setUpdating] = useState(false)

  useEffect(() => {
    if (id) {
      loadOrder()
    }
  }, [id])

  const loadOrder = async () => {
    try {
      setLoading(true)
      const data = await db.getOrder(id)
      setOrder(data)
    } catch (err) {
      console.error('Error loading order:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleStatusChange = async (newStatus) => {
    try {
      setUpdating(true)
      await db.updateOrder(id, { status: newStatus })
      setOrder(prev => ({ ...prev, status: newStatus }))
    } catch (err) {
      console.error('Error updating status:', err)
      alert('Failed to update status')
    } finally {
      setUpdating(false)
    }
  }

  const handlePrint = () => {
    window.print()
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="loading-spin w-8 h-8 border-4 border-bakery-200 border-t-bakery-500 rounded-full"></div>
      </div>
    )
  }

  if (error || !order) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">
            {error || 'Order not found'}
          </p>
          <Link href="/orders" className="text-red-600 hover:text-red-700 mt-2 inline-block">
            ← Back to Orders
          </Link>
        </div>
      </div>
    )
  }

  const orderTotal = order.order_line_items?.reduce((total, item) => {
    return total + ((item.unit_price || 0) * (item.cake_qty || 1))
  }, 0) || order.total || 0

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link href="/orders" className="text-gray-600 hover:text-gray-900">
            <ArrowLeftIcon className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Order {order.order_id}
            </h1>
            <p className="text-gray-600">
              Created {new Date(order.created_at).toLocaleDateString()}
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2 no-print">
          <button
            onClick={handlePrint}
            className="btn-bakery-outline"
          >
            <PrinterIcon className="w-4 h-4 mr-2" />
            Print
          </button>
          <Link
            href={`/orders/${order.order_id}/edit`}
            className="btn-bakery"
          >
            <PencilIcon className="w-4 h-4 mr-2" />
            Edit
          </Link>
        </div>
      </div>

      {/* Status */}
      <div className="card-bakery p-6">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">Order Status</h2>
          <StatusBadge 
            status={order.status} 
            onStatusChange={handleStatusChange}
          />
        </div>
        {updating && (
          <p className="text-sm text-gray-500 mt-2">Updating status...</p>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Customer Information */}
        <div className="card-bakery p-6">
          <div className="flex items-center mb-4">
            <UserIcon className="w-5 h-5 text-bakery-500 mr-2" />
            <h2 className="text-lg font-semibold text-gray-900">Customer Information</h2>
          </div>
          
          <div className="space-y-3">
            <div>
              <h3 className="font-medium text-gray-900">
                {order.customer_first_name} {order.customer_last_name}
              </h3>
            </div>
            
            {order.email && (
              <div className="flex items-center text-gray-600">
                <EnvelopeIcon className="w-4 h-4 mr-2" />
                <a href={`mailto:${order.email}`} className="hover:text-bakery-600">
                  {order.email}
                </a>
              </div>
            )}
            
            {order.phone_number && (
              <div className="flex items-center text-gray-600">
                <PhoneIcon className="w-4 h-4 mr-2" />
                <a href={`tel:${order.phone_number}`} className="hover:text-bakery-600">
                  {order.phone_number}
                </a>
              </div>
            )}
          </div>
        </div>

        {/* Order Details */}
        <div className="card-bakery p-6">
          <div className="flex items-center mb-4">
            <CalendarIcon className="w-5 h-5 text-bakery-500 mr-2" />
            <h2 className="text-lg font-semibold text-gray-900">Order Details</h2>
          </div>
          
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Order Date:</span>
              <span className="font-medium">
                {new Date(order.order_date).toLocaleDateString()}
              </span>
            </div>
            
            {order.due_pickup_date && (
              <div className="flex justify-between">
                <span className="text-gray-600">Pickup Date:</span>
                <span className="font-medium">
                  {new Date(order.due_pickup_date).toLocaleDateString()}
                </span>
              </div>
            )}
            
            {order.due_pickup_time && (
              <div className="flex justify-between">
                <span className="text-gray-600">Pickup Time:</span>
                <span className="font-medium">{order.due_pickup_time}</span>
              </div>
            )}
            
            <div className="flex justify-between">
              <span className="text-gray-600">Order Type:</span>
              <span className="font-medium">{order.order_type || 'In-Store'}</span>
            </div>
            
            {order.special && (
              <div className="flex justify-between">
                <span className="text-gray-600">Special Notes:</span>
                <span className="font-medium">{order.special}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Line Items */}
      <div className="card-bakery p-6">
        <div className="flex items-center mb-4">
          <CakeIcon className="w-5 h-5 text-bakery-500 mr-2" />
          <h2 className="text-lg font-semibold text-gray-900">Order Items</h2>
        </div>
        
        <div className="space-y-4">
          {order.order_line_items?.length > 0 ? (
            order.order_line_items.map((item) => (
              <LineItemCard key={item.id} item={item} />
            ))
          ) : (
            <p className="text-gray-500 text-center py-8">No items found</p>
          )}
        </div>

        {/* Order Total */}
        <div className="mt-6 pt-6 border-t border-gray-200">
          <div className="flex justify-between items-center">
            <span className="text-lg font-semibold text-gray-900">Order Total:</span>
            <span className="text-2xl font-bold text-bakery-600">
              ${orderTotal.toFixed(2)}
            </span>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="card-bakery p-6 no-print">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="flex flex-wrap gap-3">
          {order.status === 'New' && (
            <button
              onClick={() => handleStatusChange('In Progress')}
              className="btn-bakery"
            >
              <ClockIcon className="w-4 h-4 mr-2" />
              Start Processing
            </button>
          )}
          {order.status === 'In Progress' && (
            <button
              onClick={() => handleStatusChange('Ready')}
              className="btn-bakery"
            >
              <CheckCircleIcon className="w-4 h-4 mr-2" />
              Mark Ready
            </button>
          )}
          {order.status === 'Ready' && (
            <button
              onClick={() => handleStatusChange('Completed')}
              className="btn-bakery"
            >
              <CheckCircleIcon className="w-4 h-4 mr-2" />
              Mark Complete
            </button>
          )}
        </div>
      </div>
    </div>
  )
}