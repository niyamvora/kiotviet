#!/usr/bin/env python3
"""
Interactive KiotViet API Test Script
Allows user to input retailer name and tests API endpoints
"""

import requests
import json
from datetime import datetime
import os
from dotenv import load_dotenv
import jwt
import base64

# Load environment variables
load_dotenv()

class InteractiveKiotVietAPI:
    def __init__(self):
        self.base_url = "https://public.kiotapi.com"
        
        # Get credentials from environment
        raw_client_id = os.getenv('CLIENT_ID', '')
        raw_secret_key = os.getenv('SECRET_KEY', '')
        
        self.client_id = raw_client_id.strip().strip('"').strip("'")
        self.secret_key = raw_secret_key.strip().strip('"').strip("'")
        self.access_token = None
        
        print(f"🔑 Loaded credentials - Client ID: {self.client_id[:10]}...")
        
    def authenticate(self):
        """Authenticate using the KiotViet OAuth2 endpoint"""
        auth_url = "https://id.kiotviet.vn/connect/token"
        
        auth_data = {
            'scopes': 'PublicApi.Access',
            'grant_type': 'client_credentials',
            'client_id': self.client_id,
            'client_secret': self.secret_key
        }
        
        headers = {
            'Content-Type': 'application/x-www-form-urlencoded'
        }
        
        try:
            print("🔄 Authenticating...")
            response = requests.post(auth_url, data=auth_data, headers=headers)
            
            if response.status_code == 200:
                auth_response = response.json()
                self.access_token = auth_response.get('access_token')
                expires_in = auth_response.get('expires_in')
                
                print("✅ Authentication successful!")
                print(f"⏰ Token expires in: {expires_in} seconds ({expires_in/3600:.1f} hours)")
                
                # Try to decode the JWT token to extract retailer information
                self.try_decode_token()
                
                return True
            else:
                print(f"❌ Authentication failed: {response.status_code}")
                print(f"Response: {response.text}")
                return False
                
        except Exception as e:
            print(f"❌ Authentication error: {str(e)}")
            return False
    
    def try_decode_token(self):
        """Try to decode JWT token to extract potential retailer information"""
        try:
            # JWT tokens are typically in the format: header.payload.signature
            # We can decode the payload (middle part) to see the claims
            token_parts = self.access_token.split('.')
            if len(token_parts) == 3:
                # Add padding if necessary
                payload = token_parts[1]
                payload += '=' * (4 - len(payload) % 4)
                
                # Decode base64
                decoded_bytes = base64.b64decode(payload)
                decoded_str = decoded_bytes.decode('utf-8')
                token_data = json.loads(decoded_str)
                
                print("\n🔍 Token Information:")
                interesting_claims = ['sub', 'aud', 'iss', 'client_id', 'scope', 'retailer', 'shop_name', 'name']
                for claim in interesting_claims:
                    if claim in token_data:
                        print(f"   {claim}: {token_data[claim]}")
                
                # Look for any claim that might contain retailer/shop info
                for key, value in token_data.items():
                    if any(keyword in key.lower() for keyword in ['retail', 'shop', 'store', 'merchant']):
                        print(f"   📍 Found potential shop info - {key}: {value}")
                        
                print()
                        
        except Exception as e:
            print(f"⚠️ Could not decode token: {e}")
    
    def get_retailer_name(self):
        """Get retailer name from user input"""
        print("\n" + "="*60)
        print("🏪 RETAILER NAME REQUIRED")
        print("="*60)
        print("The KiotViet API requires a 'Retailer' header with your shop name.")
        print("This should be the name of your store/shop in KiotViet.")
        print("Examples: 'myshop', 'taphoaxyz', 'cuahangabc'")
        print()
        
        retailer_name = input("📝 Please enter your shop/retailer name: ").strip()
        
        if not retailer_name:
            print("❌ No retailer name provided!")
            return None
            
        print(f"✅ Using retailer name: '{retailer_name}'")
        return retailer_name
    
    def test_single_endpoint(self, endpoint, name, retailer_name, params=None):
        """Test a single endpoint with the given retailer name"""
        url = f"{self.base_url}{endpoint}"
        
        headers = {
            'Authorization': f'Bearer {self.access_token}',
            'Content-Type': 'application/json',
            'Retailer': retailer_name
        }
        
        try:
            print(f"🔄 Testing {name} ({endpoint})")
            response = requests.get(url, headers=headers, params=params)
            
            if response.status_code == 200:
                data = response.json()
                print(f"✅ {name}: SUCCESS!")
                
                # Show data summary
                if isinstance(data, dict) and 'data' in data:
                    items_count = len(data['data']) if data['data'] else 0
                    total = data.get('total', 'unknown')
                    print(f"   📊 Found {items_count} items (total: {total})")
                    
                    if items_count > 0:
                        # Show sample item structure
                        sample_item = data['data'][0]
                        print(f"   📋 Sample item keys: {list(sample_item.keys()) if isinstance(sample_item, dict) else 'Not a dict'}")
                
                return data
                
            else:
                print(f"❌ {name}: FAILED (Status: {response.status_code})")
                error_msg = response.text[:200] + "..." if len(response.text) > 200 else response.text
                print(f"   Error: {error_msg}")
                return None
                
        except Exception as e:
            print(f"❌ {name}: ERROR - {str(e)}")
            return None
    
    def test_all_endpoints(self, retailer_name):
        """Test all available endpoints"""
        print(f"\n🧪 Testing all endpoints with retailer: '{retailer_name}'")
        print("="*60)
        
        endpoints = [
            ('/categories', 'Product Categories', {'pageSize': 10}),
            ('/products', 'Products', {'pageSize': 5}),
            ('/customers', 'Customers', {'pageSize': 5}),
            ('/orders', 'Orders', {'pageSize': 5}),
            ('/invoices', 'Invoices', {'pageSize': 5}),
            ('/branches', 'Branches', {}),
            ('/users', 'Users', {}),
            ('/suppliers', 'Suppliers', {'pageSize': 5}),
        ]
        
        successful_endpoints = {}
        
        for endpoint, name, params in endpoints:
            data = self.test_single_endpoint(endpoint, name, retailer_name, params)
            if data:
                successful_endpoints[name] = data
            print()
        
        return successful_endpoints
    
    def analyze_data_for_dashboard(self, successful_data):
        """Analyze the retrieved data and suggest dashboard components"""
        print("\n" + "="*60)
        print("📊 DASHBOARD ANALYSIS & SUGGESTIONS")
        print("="*60)
        
        if not successful_data:
            print("❌ No data retrieved. Cannot create dashboard suggestions.")
            return
        
        dashboard_components = []
        
        for endpoint_name, data in successful_data.items():
            print(f"\n📈 {endpoint_name} Analysis:")
            
            if isinstance(data, dict) and 'data' in data and data['data']:
                items = data['data']
                sample_item = items[0] if items else {}
                
                print(f"   • Total items available: {data.get('total', len(items))}")
                print(f"   • Sample data structure: {list(sample_item.keys()) if isinstance(sample_item, dict) else 'Unknown'}")
                
                # Suggest dashboard components based on endpoint
                if 'Products' in endpoint_name:
                    dashboard_components.extend([
                        "📦 Product Inventory Dashboard - Track stock levels, low inventory alerts",
                        "💰 Product Performance - Best/worst selling products, price analysis",
                        "📊 Category Analysis - Products by category, category performance"
                    ])
                elif 'Orders' in endpoint_name:
                    dashboard_components.extend([
                        "🛒 Sales Dashboard - Order trends, daily/monthly sales",
                        "📈 Revenue Analytics - Sales performance over time",
                        "🎯 Order Status Tracking - Pending, completed, cancelled orders"
                    ])
                elif 'Customers' in endpoint_name:
                    dashboard_components.extend([
                        "👥 Customer Analytics - Customer segmentation, purchase patterns",
                        "🔄 Customer Retention - Repeat customers, customer lifetime value",
                        "📍 Geographic Analysis - Customer distribution by location"
                    ])
                elif 'Invoices' in endpoint_name:
                    dashboard_components.extend([
                        "💳 Financial Dashboard - Revenue, profit margins, payment status",
                        "📋 Invoice Management - Outstanding invoices, payment tracking"
                    ])
                elif 'Branches' in endpoint_name:
                    dashboard_components.extend([
                        "🏢 Multi-Branch Analytics - Performance comparison across locations",
                        "📊 Branch Performance - Sales by branch, inventory distribution"
                    ])
        
        print(f"\n🎨 RECOMMENDED DASHBOARD COMPONENTS:")
        print("="*60)
        for i, component in enumerate(set(dashboard_components), 1):
            print(f"{i}. {component}")
        
        # Sample data preview
        print(f"\n📋 SAMPLE DATA PREVIEW:")
        print("="*60)
        for endpoint_name, data in list(successful_data.items())[:2]:  # Show first 2 endpoints
            if isinstance(data, dict) and 'data' in data and data['data']:
                print(f"\n{endpoint_name} - Sample Item:")
                sample = data['data'][0]
                formatted_sample = json.dumps(sample, indent=2, ensure_ascii=False)[:500]
                print(formatted_sample + ("..." if len(str(sample)) > 500 else ""))

def main():
    print("🚀 Interactive KiotViet API Explorer")
    print("="*60)
    
    api = InteractiveKiotVietAPI()
    
    # Authenticate first
    if not api.authenticate():
        print("❌ Authentication failed. Cannot proceed.")
        return
    
    # Get retailer name
    retailer_name = api.get_retailer_name()
    if not retailer_name:
        print("❌ Retailer name required. Exiting.")
        return
    
    # Test endpoints
    successful_data = api.test_all_endpoints(retailer_name)
    
    # Analyze for dashboard
    api.analyze_data_for_dashboard(successful_data)
    
    print(f"\n✅ API exploration complete!")
    print(f"📊 {len(successful_data)} endpoints returned data successfully.")

if __name__ == "__main__":
    main()
