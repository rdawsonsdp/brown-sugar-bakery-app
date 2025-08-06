#!/usr/bin/env python3
"""
Railway Function - Enhanced Shopify to Supabase Sync System
Complete production-ready sync with line items, attributes, and reconciliation
"""

import os
import requests
import json
import logging
from datetime import datetime, timedelta
from supabase import create_client
from typing import Dict, List, Optional
import hashlib
import hmac

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)

class ShopifySupabaseSync:
    def __init__(self):
        # Get credentials from environment variables
        self.supabase_url = os.getenv("SUPABASE_URL", "https://ohvtwtjnxbazawkuavwk.supabase.co")
        self.supabase_service_key = os.getenv("SUPABASE_SERVICE_KEY", "")
        self.shopify_shop_url = os.getenv("SHOPIFY_SHOP_URL", "https://brown-sugar-bakery-chicago.myshopify.com")
        self.shopify_access_token = os.getenv("SHOPIFY_ACCESS_TOKEN", "")
        self.webhook_secret = os.getenv("WEBHOOK_SECRET", "")
        
        if not all([self.supabase_url, self.supabase_service_key, self.shopify_shop_url, self.shopify_access_token]):
            raise ValueError("Missing required environment variables")
        
        # Initialize Supabase client
        self.supabase = create_client(self.supabase_url, self.supabase_service_key)
        
        logging.info("✅ Shopify-Supabase sync system initialized")

    def get_shopify_orders(self, since_id: Optional[int] = None, limit: int = 250) -> List[Dict]:
        """Fetch orders from Shopify Admin API"""
        if not self.shopify_access_token:
            logging.error("❌ Shopify access token not configured")
            return []
        
        url = f"{self.shopify_shop_url}/admin/api/2023-07/orders.json"
        headers = {
            'X-Shopify-Access-Token': self.shopify_access_token,
            'Content-Type': 'application/json'
        }
        
        params = {
            'limit': limit,
            'status': 'any',
            'financial_status': 'any',
            'fulfillment_status': 'any'
        }
        
        if since_id:
            params['since_id'] = since_id
        else:
            # Get orders from last 24 hours if no since_id
            since_date = (datetime.now() - timedelta(days=1)).isoformat()
            params['created_at_min'] = since_date
        
        try:
            response = requests.get(url, headers=headers, params=params, timeout=30)
            response.raise_for_status()
            
            data = response.json()
            orders = data.get('orders', [])
            
            logging.info(f"📦 Fetched {len(orders)} orders from Shopify")
            return orders
            
        except requests.exceptions.RequestException as e:
            logging.error(f"❌ Error fetching Shopify orders: {e}")
            return []

    def extract_note_attribute(self, note_attributes: List[Dict], attribute_name: str) -> Optional[str]:
        """Extract value from Shopify note_attributes"""
        if not isinstance(note_attributes, list):
            return None
        
        for attr in note_attributes:
            if attr.get('name') == attribute_name:
                return attr.get('value')
        return None

    def process_shopify_order(self, shopify_order: Dict) -> bool:
        """Convert Shopify order to Supabase format and insert/update"""
        try:
            order_id = f"WEB{shopify_order['order_number']}"
            
            # Check if order already exists
            existing = self.supabase.table('customer_orders').select('*').eq('order_id', order_id).execute()
            if existing.data:
                # Check if order needs updating
                if self.should_update_order(shopify_order, existing.data[0]):
                    logging.info(f"🔄 Order {order_id} needs updating")
                    return self.update_existing_order(shopify_order, order_id)
                else:
                    logging.info(f"⏭️  Order {order_id} is up to date, skipping")
                    return True
            
            # Prepare order data
            order_data = self.prepare_order_data(shopify_order, order_id)
            
            # Insert order
            order_response = self.supabase.table('customer_orders').insert(order_data).execute()
            
            if hasattr(order_response, 'error') and order_response.error:
                logging.error(f"❌ Failed to insert order {order_id}: {order_response.error}")
                return False
            
            logging.info(f"✅ Inserted order: {order_id}")
            
            # Process line items
            self.process_line_items(shopify_order, order_id)
            
            return True
            
        except Exception as e:
            logging.error(f"❌ Error processing order {shopify_order.get('order_number', 'unknown')}: {e}")
            return False

    def process_line_items(self, shopify_order: Dict, order_id: str):
        """Process and insert line items for an order"""
        line_items = shopify_order.get('line_items', [])
        
        for index, item in enumerate(line_items):
            try:
                # Handle variant_title properly
                variant_title = item.get('variant_title')
                if variant_title == 'None' or variant_title is None:
                    variant_title = ''
                
                line_item_data = {
                    'order_id': order_id,
                    'line_item': chr(65 + index),  # A, B, C, etc.
                    'type': item.get('title', ''),
                    'size': variant_title,
                    'product_description': f"{item.get('title', '')} {variant_title}".strip(),
                    'unit_price': float(item.get('price', 0)),
                    'cake_qty': int(item.get('quantity', 1)),
                    'category': self.determine_category(item.get('title', ''))
                }
                
                # Extract line item properties
                properties = item.get('properties', [])
                if properties:
                    for prop in properties:
                        if prop.get('name') == 'Cake Writing':
                            line_item_data['writing_notes'] = prop.get('value', '')
                        elif prop.get('name') == 'Writing-Color':
                            line_item_data['color'] = prop.get('value', '')
                
                # Insert line item
                response = self.supabase.table('order_line_items').insert(line_item_data).execute()
                
                if hasattr(response, 'error') and response.error:
                    logging.error(f"❌ Failed to insert line item for {order_id}: {response.error}")
                else:
                    logging.info(f"✅ Inserted line item {line_item_data['line_item']} for {order_id}")
                    
            except Exception as e:
                logging.error(f"❌ Error processing line item for {order_id}: {e}")

    def determine_category(self, title: str) -> str:
        """Determine product category based on title"""
        if not title:
            return 'Cake'
        
        title_lower = title.lower()
        
        if 'sheet cake' in title_lower:
            return 'Sheet Cake'
        elif 'mini cupcakes' in title_lower or 'mini cupcake' in title_lower:
            return 'Mini Cupcakes'
        elif 'pie' in title_lower:
            return 'Pie'
        elif 'cheesecake' in title_lower:
            return 'Cheesecake'
        elif 'thanksgiving special' in title_lower:
            return 'Special'
        else:
            return 'Cake'

    def should_update_order(self, shopify_order: Dict, existing_order: Dict) -> bool:
        """Check if Shopify order has changes that require database update"""
        try:
            # Compare timestamps
            shopify_updated = shopify_order.get('updated_at', '')
            db_updated = existing_order.get('updated_at', '')
            
            if shopify_updated and db_updated:
                shopify_time = datetime.fromisoformat(shopify_updated.replace('Z', '+00:00'))
                db_time = datetime.fromisoformat(db_updated.replace('Z', '+00:00'))
                
                if shopify_time > db_time:
                    logging.info(f"📅 Shopify order updated: {shopify_updated} > DB: {db_updated}")
                    return True
            
            # Compare totals
            shopify_total = float(shopify_order.get('total_price', 0))
            db_total = float(existing_order.get('total', 0))
            
            if abs(shopify_total - db_total) > 0.01:
                logging.info(f"💰 Total changed: Shopify ${shopify_total} vs DB ${db_total}")
                return True
            
            # Compare fulfillment status
            shopify_fulfillment = shopify_order.get('fulfillment_status', '')
            db_fulfillment = existing_order.get('fulfillment_status', '')
            
            if shopify_fulfillment != db_fulfillment:
                logging.info(f"📦 Fulfillment status changed: {shopify_fulfillment} vs {db_fulfillment}")
                return True
            
            return False
            
        except Exception as e:
            logging.warning(f"⚠️  Error checking if order needs update: {e}")
            return True

    def update_existing_order(self, shopify_order: Dict, order_id: str) -> bool:
        """Update existing order with new data from Shopify"""
        try:
            # Prepare updated order data
            order_data = self.prepare_order_data(shopify_order, order_id)
            
            # Update order
            order_response = self.supabase.table('customer_orders').update(order_data).eq('order_id', order_id).execute()
            
            if hasattr(order_response, 'error') and order_response.error:
                logging.error(f"❌ Failed to update order {order_id}: {order_response.error}")
                return False
            
            logging.info(f"✅ Updated order: {order_id}")
            
            # Delete and recreate line items
            delete_response = self.supabase.table('order_line_items').delete().eq('order_id', order_id).execute()
            if hasattr(delete_response, 'error') and delete_response.error:
                logging.warning(f"⚠️  Failed to delete old line items for {order_id}: {delete_response.error}")
            
            # Process line items
            self.process_line_items(shopify_order, order_id)
            
            return True
            
        except Exception as e:
            logging.error(f"❌ Error updating order {order_id}: {e}")
            return False

    def prepare_order_data(self, shopify_order: Dict, order_id: str) -> Dict:
        """Prepare order data dictionary from Shopify order"""
        order_data = {
            'order_id': order_id,
            'web_order_id': int(shopify_order['order_number']),
            'order_date': datetime.fromisoformat(shopify_order['created_at'].replace('Z', '+00:00')).strftime('%Y-%m-%d'),
            'customer_first_name': shopify_order.get('customer', {}).get('first_name', '') or '',
            'customer_last_name': shopify_order.get('customer', {}).get('last_name', '') or '',
            'email': shopify_order.get('contact_email') or shopify_order.get('email', ''),
            'phone_number': shopify_order.get('phone', ''),
            'total': float(shopify_order.get('total_price', 0)),
            'fulfillment_status': shopify_order.get('fulfillment_status') or '',
            'order_type': 'Web',
            'order_taker': 'Web',
            'status': 'New',
            'updated_at': datetime.now().isoformat()
        }
        
        # Extract pickup information from note_attributes
        note_attributes = shopify_order.get('note_attributes', [])
        if note_attributes:
            pickup_date = self.extract_note_attribute(note_attributes, 'Pickup-Date')
            pickup_time = self.extract_note_attribute(note_attributes, 'Pickup-Time')
            checkout_method = self.extract_note_attribute(note_attributes, 'Checkout-Method')
            
            # Also check for Shipping-Date
            if not pickup_date:
                pickup_date = self.extract_note_attribute(note_attributes, 'Shipping-Date')
            
            if pickup_date:
                try:
                    # Handle both formats: YYYY/MM/DD and YYYY-MM-DD
                    if '/' in pickup_date:
                        parsed_date = datetime.strptime(pickup_date, '%Y/%m/%d')
                    else:
                        parsed_date = datetime.strptime(pickup_date, '%Y-%m-%d')
                    order_data['due_pickup_date'] = parsed_date.strftime('%Y-%m-%d')
                except ValueError as e:
                    logging.warning(f"Invalid pickup date format '{pickup_date}': {e}")
            
            if pickup_time:
                order_data['due_pickup_time'] = pickup_time
            
            if checkout_method:
                order_data['special'] = checkout_method
        
        # Capture order notes
        if shopify_order.get('note'):
            existing_special = order_data.get('special', '')
            order_note = shopify_order.get('note', '')
            if existing_special:
                order_data['special'] = f"{existing_special} | Note: {order_note}"
            else:
                order_data['special'] = f"Note: {order_note}"
        
        return order_data

    def sync_orders(self) -> bool:
        """Main sync function - fetch new orders and sync to Supabase"""
        logging.info("🔄 Starting Shopify to Supabase sync...")
        
        if not self.shopify_access_token:
            logging.error("❌ Cannot sync - Shopify access token not configured")
            return False
        
        # Fetch recent orders from Shopify (last 24 hours)
        orders = self.get_shopify_orders()
        
        if not orders:
            logging.info("✅ No new orders to sync")
            return True
        
        success_count = 0
        
        # Process each order
        for order in orders:
            if self.process_shopify_order(order):
                success_count += 1
        
        logging.info(f"✅ Sync completed: {success_count}/{len(orders)} orders processed")
        return True

def handler(event=None, context=None):
    """Railway Function handler - called by cron schedule"""
    try:
        logging.info("🚀 Railway Function triggered - Starting Shopify sync...")
        sync = ShopifySupabaseSync()
        
        if sync.sync_orders():
            logging.info("✅ Sync completed successfully")
            return {
                "statusCode": 200,
                "body": "Sync completed successfully"
            }
        else:
            logging.error("❌ Sync failed")
            return {
                "statusCode": 500,
                "body": "Sync failed"
            }
            
    except Exception as e:
        logging.error(f"💥 Function error: {e}")
        return {
            "statusCode": 500,
            "body": f"Error: {str(e)}"
        }

# For local testing
if __name__ == "__main__":
    handler()