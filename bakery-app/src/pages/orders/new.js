import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { db } from '../../lib/supabase'
import {
  PlusIcon,
  MinusIcon,
  TrashIcon,
  UserIcon,
  CalendarIcon,
  CakeIcon
} from '@heroicons/react/24/outline'

const LineItemRow = ({ item, onUpdate, onRemove, products }) => {
  const handleProductChange = (productId) => {
    const product = products.find(p => p.id === parseInt(productId))
    if (product) {
      onUpdate({
        ...item,
        type: product.product_description,
        category: product.category || 'Cake',
        unit_price: product.price || 0
      })
    }
  }

  return (
    <div className="border border-gray-200 rounded-lg p-4">
      <div className="flex items-center justify-between mb-4">
        <h4 className="font-medium text-gray-900">Line Item {item.line_item}</h4>
        <button
          onClick={onRemove}
          className="text-red-600 hover:text-red-700"
        >
          <TrashIcon className="w-4 h-4" />
        </button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Product
          </label>
          <select
            value={products.find(p => p.product_description === item.type)?.id || ''}
            onChange={(e) => handleProductChange(e.target.value)}
            className="input-bakery"
            required
          >
            <option value="">Select Product</option>
            {products.map((product) => (
              <option key={product.id} value={product.id}>
                {product.product_description}
              </option>
            ))}
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Size
          </label>
          <input
            type="text"
            value={item.size || ''}
            onChange={(e) => onUpdate({ ...item, size: e.target.value })}
            className="input-bakery"
            placeholder="e.g., 6 inch, 8 inch"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Quantity
          </label>
          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={() => onUpdate({ ...item, cake_qty: Math.max(1, (item.cake_qty || 1) - 1) })}
              className="w-8 h-8 flex items-center justify-center border border-gray-300 rounded text-gray-600 hover:bg-gray-50"
            >
              <MinusIcon className="w-4 h-4" />
            </button>
            <input
              type="number"
              min="1"
              value={item.cake_qty || 1}
              onChange={(e) => onUpdate({ ...item, cake_qty: parseInt(e.target.value) || 1 })}
              className="w-16 text-center input-bakery"
            />
            <button
              type="button"
              onClick={() => onUpdate({ ...item, cake_qty: (item.cake_qty || 1) + 1 })}
              className="w-8 h-8 flex items-center justify-center border border-gray-300 rounded text-gray-600 hover:bg-gray-50"
            >
              <PlusIcon className="w-4 h-4" />
            </button>
          </div>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Unit Price
          </label>
          <input
            type="number"
            step="0.01"
            min="0"
            value={item.unit_price || 0}
            onChange={(e) => onUpdate({ ...item, unit_price: parseFloat(e.target.value) || 0 })}
            className="input-bakery"
          />
        </div>
        
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Writing/Decoration Notes
          </label>
          <input
            type="text"
            value={item.writing_notes || ''}
            onChange={(e) => onUpdate({ ...item, writing_notes: e.target.value })}
            className="input-bakery"
            placeholder="Special writing or decoration instructions"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Writing Color
          </label>
          <input
            type="text"
            value={item.color || ''}
            onChange={(e) => onUpdate({ ...item, color: e.target.value })}
            className="input-bakery"
            placeholder="e.g., Blue, Red"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Total: ${((item.unit_price || 0) * (item.cake_qty || 1)).toFixed(2)}
          </label>
        </div>
      </div>
    </div>
  )
}

export default function NewOrder() {
  const router = useRouter()
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const [orderData, setOrderData] = useState({
    customer_first_name: '',
    customer_last_name: '',
    email: '',
    phone_number: '',
    due_pickup_date: '',
    due_pickup_time: '',
    special: '',
    status: 'New'
  })

  const [lineItems, setLineItems] = useState([
    {
      line_item: 'A',
      type: '',
      size: '',
      cake_qty: 1,
      unit_price: 0,
      category: 'Cake',
      writing_notes: '',
      color: ''
    }
  ])

  useEffect(() => {
    loadProducts()
  }, [])

  const loadProducts = async () => {
    try {
      const data = await db.getProducts()
      setProducts(data)
    } catch (err) {
      console.error('Error loading products:', err)
      setError('Failed to load products')
    }
  }

  const addLineItem = () => {
    const nextLetter = String.fromCharCode(65 + lineItems.length) // A, B, C, etc.
    setLineItems([...lineItems, {
      line_item: nextLetter,
      type: '',
      size: '',
      cake_qty: 1,
      unit_price: 0,
      category: 'Cake',
      writing_notes: '',
      color: ''
    }])
  }

  const updateLineItem = (index, updatedItem) => {
    const newLineItems = [...lineItems]
    newLineItems[index] = updatedItem
    setLineItems(newLineItems)
  }

  const removeLineItem = (index) => {
    if (lineItems.length > 1) {
      const newLineItems = lineItems.filter((_, i) => i !== index)
      // Reassign letters
      const reassignedItems = newLineItems.map((item, i) => ({
        ...item,
        line_item: String.fromCharCode(65 + i)
      }))
      setLineItems(reassignedItems)
    }
  }

  const calculateTotal = () => {
    return lineItems.reduce((total, item) => {
      return total + ((item.unit_price || 0) * (item.cake_qty || 1))
    }, 0)
  }

  const generateOrderId = () => {
    const timestamp = Date.now()
    return `ORD${timestamp.toString().slice(-6)}`
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      // Generate order ID
      const orderId = generateOrderId()
      
      // Prepare order data
      const finalOrderData = {
        ...orderData,
        order_id: orderId,
        order_date: new Date().toISOString().split('T')[0],
        total: calculateTotal(),
        order_type: 'In-Store',
        order_taker: 'Staff' // TODO: Get from authenticated user
      }

      // Create order
      const createdOrder = await db.createOrder(finalOrderData)

      // Create line items
      for (const item of lineItems) {
        if (item.type) { // Only create line items with products
          await db.createLineItem({
            ...item,
            order_id: orderId,
            product_description: `${item.type} ${item.size}`.trim()
          })
        }
      }

      // Redirect to order detail
      router.push(`/orders/${orderId}`)
    } catch (err) {
      console.error('Error creating order:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Create New Order</h1>
        <p className="text-gray-600">Enter customer information and order details</p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Customer Information */}
        <div className="card-bakery p-6">
          <div className="flex items-center mb-4">
            <UserIcon className="w-5 h-5 text-bakery-500 mr-2" />
            <h2 className="text-lg font-semibold text-gray-900">Customer Information</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                First Name *
              </label>
              <input
                type="text"
                required
                value={orderData.customer_first_name}
                onChange={(e) => setOrderData({...orderData, customer_first_name: e.target.value})}
                className="input-bakery"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Last Name *
              </label>
              <input
                type="text"
                required
                value={orderData.customer_last_name}
                onChange={(e) => setOrderData({...orderData, customer_last_name: e.target.value})}
                className="input-bakery"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                type="email"
                value={orderData.email}
                onChange={(e) => setOrderData({...orderData, email: e.target.value})}
                className="input-bakery"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Phone Number
              </label>
              <input
                type="tel"
                value={orderData.phone_number}
                onChange={(e) => setOrderData({...orderData, phone_number: e.target.value})}
                className="input-bakery"
              />
            </div>
          </div>
        </div>

        {/* Order Details */}
        <div className="card-bakery p-6">
          <div className="flex items-center mb-4">
            <CalendarIcon className="w-5 h-5 text-bakery-500 mr-2" />
            <h2 className="text-lg font-semibold text-gray-900">Order Details</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Pickup Date
              </label>
              <input
                type="date"
                value={orderData.due_pickup_date}
                onChange={(e) => setOrderData({...orderData, due_pickup_date: e.target.value})}
                className="input-bakery"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Pickup Time
              </label>
              <input
                type="time"
                value={orderData.due_pickup_time}
                onChange={(e) => setOrderData({...orderData, due_pickup_time: e.target.value})}
                className="input-bakery"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Special Instructions
              </label>
              <input
                type="text"
                value={orderData.special}
                onChange={(e) => setOrderData({...orderData, special: e.target.value})}
                className="input-bakery"
                placeholder="Any special notes"
              />
            </div>
          </div>
        </div>

        {/* Line Items */}
        <div className="card-bakery p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <CakeIcon className="w-5 h-5 text-bakery-500 mr-2" />
              <h2 className="text-lg font-semibold text-gray-900">Order Items</h2>
            </div>
            <button
              type="button"
              onClick={addLineItem}
              className="btn-bakery-outline"
            >
              <PlusIcon className="w-4 h-4 mr-2" />
              Add Item
            </button>
          </div>
          
          <div className="space-y-4">
            {lineItems.map((item, index) => (
              <LineItemRow
                key={index}
                item={item}
                onUpdate={(updatedItem) => updateLineItem(index, updatedItem)}
                onRemove={() => removeLineItem(index)}
                products={products}
              />
            ))}
          </div>

          {/* Order Total */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <div className="flex justify-between items-center">
              <span className="text-lg font-semibold text-gray-900">Order Total:</span>
              <span className="text-2xl font-bold text-bakery-600">
                ${calculateTotal().toFixed(2)}
              </span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={() => router.back()}
            className="btn-bakery-outline"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="btn-bakery disabled:opacity-50"
          >
            {loading ? 'Creating Order...' : 'Create Order'}
          </button>
        </div>
      </form>
    </div>
  )
}