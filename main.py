#!/usr/bin/env python3
"""
Railway Function for Shopify to Supabase Sync
Triggered by cron schedule every 5 minutes
"""

import os
import requests
import logging
from datetime import datetime
from supabase import create_client

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)

class ShopifySync:
    def __init__(self):
        # Get credentials from environment variables
        self.supabase_url = os.getenv("SUPABASE_URL")
        self.supabase_key = os.getenv("SUPABASE_SERVICE_KEY")
        self.shopify_url = os.getenv("SHOPIFY_SHOP_URL")
        self.shopify_token = os.getenv("SHOPIFY_ACCESS_TOKEN")
        
        if not all([self.supabase_url, self.supabase_key, self.shopify_url, self.shopify_token]):
            raise ValueError("Missing required environment variables")
            
        self.supabase = create_client(self.supabase_url, self.supabase_key)
        logging.info("✅ Shopify sync initialized")

    def sync_orders(self):
        """Sync recent orders from Shopify to Supabase"""
        try:
            # Get recent orders from Shopify
            headers = {"X-Shopify-Access-Token": self.shopify_token}
            response = requests.get(f"{self.shopify_url}/admin/api/2023-04/orders.json", headers=headers)
            
            if response.status_code != 200:
                logging.error(f"Shopify API error: {response.status_code}")
                return False
                
            orders = response.json().get("orders", [])
            logging.info(f"Found {len(orders)} orders from Shopify")
            
            # Process each order
            synced_count = 0
            for order in orders:
                if self.process_order(order):
                    synced_count += 1
                    
            logging.info(f"Successfully synced {synced_count} orders")
            return True
            
        except Exception as e:
            logging.error(f"Sync error: {e}")
            return False

    def process_order(self, order):
        """Process a single order and insert to Supabase"""
        try:
            order_data = {
                "order_id": f"WEB{order['order_number']}",
                "web_order_id": int(order['order_number']),
                "order_date": order['created_at'][:10],
                "customer_first_name": order.get('customer', {}).get('first_name', ''),
                "customer_last_name": order.get('customer', {}).get('last_name', ''),
                "email": order.get('email', ''),
                "phone_number": order.get('phone', ''),
                "total": float(order.get('total_price', 0)),
                "order_type": "Web",
                "order_taker": "Web",
                "status": "New"
            }
            
            # Insert or update order
            result = self.supabase.table("customer_orders").upsert(order_data).execute()
            return len(result.data) > 0
            
        except Exception as e:
            logging.error(f"Error processing order {order.get('order_number')}: {e}")
            return False

def handler(event=None, context=None):
    """Railway Function handler - called by cron schedule"""
    try:
        logging.info("🚀 Railway Function triggered - Starting Shopify sync...")
        sync = ShopifySync()
        
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