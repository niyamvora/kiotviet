#!/usr/bin/env python3
"""
KiotViet API Test Script
Test various GET endpoints to understand available data for dashboard creation
"""

import requests
import json
from datetime import datetime
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

class KiotVietAPI:
    def __init__(self):
        self.base_url = "https://public.kiotapi.com"
        
        # Debug: Check raw environment variables
        raw_client_id = os.getenv('CLIENT_ID', '')
        raw_secret_key = os.getenv('SECRET_KEY', '')
        print(f"Raw CLIENT_ID from env: '{raw_client_id}'")
        print(f"Raw SECRET_KEY from env: '{raw_secret_key}'")
        
        self.client_id = raw_client_id.strip().strip('"').strip("'")
        self.secret_key = raw_secret_key.strip().strip('"').strip("'")
        
        print(f"Cleaned CLIENT_ID: '{self.client_id}'")
        print(f"Cleaned SECRET_KEY: '{self.secret_key}'")
        
        self.access_token = None
        self.retailer_id = None
        
    def authenticate(self):
        """Authenticate using the correct KiotViet OAuth2 endpoint"""
        
        # Correct authentication endpoint from documentation
        auth_url = "https://id.kiotviet.vn/connect/token"
        
        print(f"Attempting authentication with client_id: {self.client_id[:10]}...")
        print(f"Client ID length: {len(self.client_id)}")
        print(f"Client Secret length: {len(self.secret_key)}")
        
        # OAuth2 client credentials flow as per documentation
        auth_data = {
            'scopes': 'PublicApi.Access',
            'grant_type': 'client_credentials',
            'client_id': self.client_id,
            'client_secret': self.secret_key
        }
        
        print(f"Auth data being sent: {dict(auth_data)}")
        
        headers = {
            'Content-Type': 'application/x-www-form-urlencoded'
        }
        
        try:
            print(f"Making request to: {auth_url}")
            response = requests.post(auth_url, data=auth_data, headers=headers)
            print(f"Auth response status: {response.status_code}")
            
            if response.status_code == 200:
                auth_response = response.json()
                self.access_token = auth_response.get('access_token')
                token_type = auth_response.get('token_type')
                expires_in = auth_response.get('expires_in')
                
                print("✅ Authentication successful!")
                print(f"Token type: {token_type}")
                print(f"Expires in: {expires_in} seconds")
                print(f"Access token (first 20 chars): {self.access_token[:20]}...")
                
                return True
            else:
                print(f"❌ Authentication failed: {response.status_code}")
                print(f"Response: {response.text}")
                return False
                
        except Exception as e:
            print(f"❌ Authentication error: {str(e)}")
            return False
    
    def make_request(self, endpoint, params=None, retailer_name=None):
        """Make authenticated GET request to API endpoint"""
        if not self.access_token:
            print("❌ No access token. Please authenticate first.")
            return None
            
        url = f"{self.base_url}{endpoint}"
        
        # Use correct headers as per documentation
        headers = {
            'Authorization': f'Bearer {self.access_token}',
            'Content-Type': 'application/json'
        }
        
        # Add retailer header if provided (we'll try without it first)
        if retailer_name:
            headers['Retailer'] = retailer_name
        
        try:
            print(f"🔄 Making request to: {endpoint}")
            if retailer_name:
                print(f"Using retailer: {retailer_name}")
                
            response = requests.get(url, headers=headers, params=params)
            print(f"Response status: {response.status_code}")
            
            if response.status_code == 200:
                print("✅ Request successful!")
                return response.json()
            else:
                print(f"❌ Request failed: {response.status_code}")
                print(f"Response: {response.text[:500]}")
                
                # If we get a 400/401 and didn't try with retailer header, suggest that
                if response.status_code in [400, 401] and not retailer_name:
                    print("💡 Tip: You may need to provide a 'Retailer' header with your store name")
                
                return None
                
        except Exception as e:
            print(f"❌ Request error: {str(e)}")
            return None
    
    def test_endpoints(self):
        """Test various GET endpoints to see available data"""
        endpoints_to_test = [
            ('/categories', 'Categories'),  # Start with categories as mentioned in docs
            ('/products', 'Products'),
            ('/customers', 'Customers'),
            ('/orders', 'Orders'),
            ('/invoices', 'Invoices'),
            ('/branches', 'Branches'),
            ('/cashFlow', 'Cash Flow'),
            ('/priceBooks', 'Price Books'),
            ('/customerGroups', 'Customer Groups')
        ]
        
        results = {}
        
        # Try common retailer names in case one works
        potential_retailers = [None, 'taphoaxyz', 'store', 'shop', self.client_id[:10]]
        
        for endpoint, name in endpoints_to_test:
            print(f"\n{'='*50}")
            print(f"Testing {name} endpoint: {endpoint}")
            print('='*50)
            
            # Add pagination parameters
            params = {
                'pageSize': 5,  # Small page size for testing
                'currentItem': 0
            }
            
            # Try without retailer first, then with potential retailer names
            data = None
            for retailer in potential_retailers:
                print(f"\n--- Trying {'without retailer' if not retailer else f'with retailer: {retailer}'} ---")
                data = self.make_request(endpoint, params, retailer)
                if data:
                    break
            
            if data:
                results[name] = data
                self.analyze_response(name, data)
            else:
                print(f"❌ No data retrieved for {name} with any retailer option")
                
        return results
    
    def analyze_response(self, endpoint_name, data):
        """Analyze and display response structure"""
        print(f"\n📊 Analysis for {endpoint_name}:")
        print(f"Response type: {type(data)}")
        
        if isinstance(data, dict):
            print("Response keys:", list(data.keys()))
            
            # Look for common pagination fields
            if 'data' in data:
                print(f"Data items count: {len(data['data']) if data['data'] else 0}")
                if data['data'] and len(data['data']) > 0:
                    print("Sample item keys:", list(data['data'][0].keys()) if isinstance(data['data'][0], dict) else "Not a dict")
                    print("Sample item:")
                    print(json.dumps(data['data'][0], indent=2, ensure_ascii=False)[:500] + "..." if len(str(data['data'][0])) > 500 else json.dumps(data['data'][0], indent=2, ensure_ascii=False))
            
            # Print other relevant fields
            for key in ['total', 'pageSize', 'currentItem']:
                if key in data:
                    print(f"{key}: {data[key]}")
        
        elif isinstance(data, list):
            print(f"List with {len(data)} items")
            if data and len(data) > 0:
                print("Sample item:", data[0])
        
        print()

def main():
    print("🚀 KiotViet API Testing Script")
    print("=" * 50)
    
    api = KiotVietAPI()
    
    # Authenticate
    if not api.authenticate():
        print("❌ Authentication failed. Cannot proceed with API testing.")
        return
    
    # Test endpoints
    print("\n🔍 Testing available endpoints...")
    results = api.test_endpoints()
    
    # Summary
    print("\n" + "="*50)
    print("📋 SUMMARY OF AVAILABLE DATA")
    print("="*50)
    
    for endpoint_name, data in results.items():
        if data:
            print(f"✅ {endpoint_name}: Data available")
        else:
            print(f"❌ {endpoint_name}: No data or access denied")
    
    # Dashboard suggestions
    print("\n" + "="*50)
    print("💡 DASHBOARD POSSIBILITIES")
    print("="*50)
    
    dashboard_suggestions = []
    
    if results.get('Products'):
        dashboard_suggestions.append("📦 Product Management: Inventory levels, product performance, category analysis")
    
    if results.get('Customers'):
        dashboard_suggestions.append("👥 Customer Analytics: Customer segmentation, purchase history, demographics")
    
    if results.get('Orders'):
        dashboard_suggestions.append("🛒 Sales Dashboard: Order trends, sales performance, order status tracking")
    
    if results.get('Invoices'):
        dashboard_suggestions.append("💰 Financial Dashboard: Revenue tracking, invoice status, payment analytics")
    
    if results.get('Cash Flow'):
        dashboard_suggestions.append("💳 Cash Flow Analysis: Financial transactions, money flow patterns")
    
    if results.get('Branches'):
        dashboard_suggestions.append("🏢 Multi-branch Analytics: Performance comparison across locations")
    
    for suggestion in dashboard_suggestions:
        print(f"• {suggestion}")
    
    if not dashboard_suggestions:
        print("⚠️ No data available for dashboard creation. Check API access permissions.")

if __name__ == "__main__":
    main()
