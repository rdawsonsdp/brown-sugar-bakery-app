import { useState, useEffect } from 'react'
import { db } from '../../lib/supabase'
import {
  MagnifyingGlassIcon,
  FunnelIcon,
  CakeIcon,
  TagIcon
} from '@heroicons/react/24/outline'

const ProductCard = ({ product }) => (
  <div className="card-bakery-hover p-6">
    <div className="flex items-start justify-between mb-4">
      <div className="flex-1">
        <h3 className="text-lg font-semibold text-gray-900 mb-1">
          {product.product_description || 'Unnamed Product'}
        </h3>
        <p className="text-sm text-gray-600">SKU: {product.sku || 'N/A'}</p>
      </div>
      <div className="w-12 h-12 bg-bakery-100 rounded-full flex items-center justify-center">
        <CakeIcon className="w-6 h-6 text-bakery-600" />
      </div>
    </div>
    
    <div className="space-y-2">
      {product.category && (
        <div className="flex items-center text-sm text-gray-600">
          <TagIcon className="w-4 h-4 mr-2" />
          {product.category}
        </div>
      )}
      
      {product.price && (
        <div className="text-lg font-bold text-bakery-600">
          ${product.price.toFixed(2)}
        </div>
      )}
      
      {product.description && (
        <p className="text-sm text-gray-600 mt-2">
          {product.description}
        </p>
      )}
    </div>
    
    <div className="mt-4 pt-4 border-t border-gray-200">
      <div className="flex justify-between text-xs text-gray-500">
        <span>ID: {product.id}</span>
        {product.active && (
          <span className="text-green-600 font-medium">Active</span>
        )}
      </div>
    </div>
  </div>
)

export default function Products() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [sortBy, setSortBy] = useState('name')

  useEffect(() => {
    loadProducts()
  }, [])

  const loadProducts = async () => {
    try {
      setLoading(true)
      const data = await db.getProducts()
      setProducts(data)
    } catch (err) {
      console.error('Error loading products:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const filteredProducts = products.filter(product => {
    const matchesSearch = !searchTerm || 
      (product.product_description?.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (product.sku?.toLowerCase().includes(searchTerm.toLowerCase()))
    
    const matchesCategory = categoryFilter === 'all' || 
      product.category === categoryFilter
    
    return matchesSearch && matchesCategory
  }).sort((a, b) => {
    switch (sortBy) {
      case 'name':
        return (a.product_description || '').localeCompare(b.product_description || '')
      case 'price':
        return (a.price || 0) - (b.price || 0)
      case 'category':
        return (a.category || '').localeCompare(b.category || '')
      default:
        return 0
    }
  })

  const categories = [...new Set(products.map(p => p.category).filter(Boolean))]

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
        <p className="text-red-800">Error loading products: {error}</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Products</h1>
          <p className="text-gray-600">Browse and manage your bakery products</p>
        </div>
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-500">
            {filteredProducts.length} products
          </span>
        </div>
      </div>

      {/* Filters */}
      <div className="card-bakery p-6">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input-bakery pl-10"
              />
            </div>
          </div>
          <div className="flex gap-4">
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="input-bakery min-w-[150px]"
            >
              <option value="all">All Categories</option>
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="input-bakery min-w-[150px]"
            >
              <option value="name">Sort by Name</option>
              <option value="price">Sort by Price</option>
              <option value="category">Sort by Category</option>
            </select>
          </div>
        </div>
        <div className="mt-4 flex items-center justify-between text-sm text-gray-600">
          <p>Showing {filteredProducts.length} of {products.length} products</p>
          <div className="flex items-center space-x-2">
            <FunnelIcon className="w-4 h-4" />
            <span>
              {categoryFilter === 'all' ? 'All Categories' : categoryFilter} • 
              Sorted by {sortBy}
            </span>
          </div>
        </div>
      </div>

      {/* Products Grid */}
      {filteredProducts.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <div className="card-bakery p-12 text-center">
          <CakeIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No products found</h3>
          <p className="text-gray-600">
            {searchTerm || categoryFilter !== 'all' 
              ? 'Try adjusting your search or filters'
              : 'No products available at the moment'
            }
          </p>
        </div>
      )}

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card-bakery p-6 text-center">
          <div className="text-2xl font-bold text-bakery-600">
            {products.length}
          </div>
          <div className="text-sm text-gray-600">Total Products</div>
        </div>
        <div className="card-bakery p-6 text-center">
          <div className="text-2xl font-bold text-bakery-600">
            {categories.length}
          </div>
          <div className="text-sm text-gray-600">Categories</div>
        </div>
        <div className="card-bakery p-6 text-center">
          <div className="text-2xl font-bold text-bakery-600">
            {products.filter(p => p.price > 0).length}
          </div>
          <div className="text-sm text-gray-600">Priced Items</div>
        </div>
      </div>
    </div>
  )
}