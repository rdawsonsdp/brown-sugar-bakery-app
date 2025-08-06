import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase configuration')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Database helper functions
export const db = {
  // Orders
  async getOrders(limit = 100) {
    const { data, error } = await supabase
      .from('customer_orders')
      .select(`
        *,
        order_line_items (*)
      `)
      .order('created_at', { ascending: false })
      .limit(limit)
    
    if (error) throw error
    return data
  },

  async getOrder(orderId) {
    const { data, error } = await supabase
      .from('customer_orders')
      .select(`
        *,
        order_line_items (*)
      `)
      .eq('order_id', orderId)
      .single()
    
    if (error) throw error
    return data
  },

  async createOrder(orderData) {
    const { data, error } = await supabase
      .from('customer_orders')
      .insert(orderData)
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  async updateOrder(orderId, updates) {
    const { data, error } = await supabase
      .from('customer_orders')
      .update(updates)
      .eq('order_id', orderId)
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  // Line Items
  async createLineItem(lineItemData) {
    const { data, error } = await supabase
      .from('order_line_items')
      .insert(lineItemData)
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  async updateLineItem(id, updates) {
    const { data, error } = await supabase
      .from('order_line_items')
      .update(updates)
      .eq('id', id)
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  async deleteLineItem(id) {
    const { error } = await supabase
      .from('order_line_items')
      .delete()
      .eq('id', id)
    
    if (error) throw error
  },

  // Products
  async getProducts() {
    const { data, error } = await supabase
      .from('bakery_products_lookup')
      .select('*')
      .order('product_description')
    
    if (error) throw error
    return data
  },

  // Dashboard Analytics
  async getDashboardStats() {
    const today = new Date().toISOString().split('T')[0]
    const thisMonth = new Date().toISOString().slice(0, 7)
    
    const [
      { count: totalOrders },
      { count: todayOrders },
      { count: thisMonthOrders },
      { data: recentOrders }
    ] = await Promise.all([
      supabase.from('customer_orders').select('*', { count: 'exact', head: true }),
      supabase.from('customer_orders').select('*', { count: 'exact', head: true }).eq('order_date', today),
      supabase.from('customer_orders').select('*', { count: 'exact', head: true }).gte('order_date', thisMonth + '-01'),
      supabase.from('customer_orders').select('*').order('created_at', { ascending: false }).limit(5)
    ])
    
    return {
      totalOrders,
      todayOrders,
      thisMonthOrders,
      recentOrders
    }
  },

  // Real-time subscriptions
  subscribeToOrders(callback) {
    return supabase
      .channel('orders')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'customer_orders' }, 
        callback
      )
      .subscribe()
  }
}