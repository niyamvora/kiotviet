/**
 * Comprehensive KiotViet API Data Fetching Test Script
 * Tests both basic API calls and enhanced pagination to determine actual data limits
 */

// Node.js v18+ has native fetch support

// Your credentials from .env
const CREDENTIALS = {
  CLIENT_ID: '761c0672-a038-4c85-9c2e-11890aacc5d2',
  SECRET_KEY: '59D98EA30A4F6B4B80EAA2F099904A8AB3906C23',
  SHOP_NAME: 'ChezBebe'
};

const BASE_URL = 'https://public.kiotapi.com';
const AUTH_URL = 'https://id.kiotviet.vn/connect/token';

let accessToken = null;

/**
 * Authenticate with KiotViet API
 */
async function authenticate() {
  console.log('🔐 Authenticating with KiotViet API...');
  
  try {
    const response = await fetch(AUTH_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: new URLSearchParams({
        'client_id': CREDENTIALS.CLIENT_ID,
        'client_secret': CREDENTIALS.SECRET_KEY,
        'grant_type': 'client_credentials',
        'scope': 'PublicApi.Access'
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Authentication failed: ${response.status} ${errorText}`);
    }

    const data = await response.json();
    accessToken = data.access_token;
    
    console.log('✅ Authentication successful');
    console.log(`🔑 Access token: ${accessToken.substring(0, 50)}...`);
    
    return accessToken;
  } catch (error) {
    console.error('❌ Authentication failed:', error.message);
    throw error;
  }
}

/**
 * Make API request to KiotViet
 */
async function makeApiRequest(endpoint, params = {}) {
  if (!accessToken) {
    throw new Error('Not authenticated. Call authenticate() first.');
  }

  const queryParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      queryParams.append(key, value.toString());
    }
  });

  const url = `${BASE_URL}/${endpoint}${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
  
  console.log(`📡 Making API request: ${url}`);

  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Retailer': CREDENTIALS.SHOP_NAME,
      'Content-Type': 'application/json'
    }
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`API request failed: ${response.status} ${errorText}`);
  }

  const data = await response.json();
  return data;
}

/**
 * Test basic API calls with different parameters
 */
async function testBasicApiCalls() {
  console.log('\n🧪 Testing Basic API Calls...');
  console.log('=' .repeat(50));

  const endpoints = [
    { name: 'Products', endpoint: 'products' },
    { name: 'Customers', endpoint: 'customers' },
    { name: 'Orders', endpoint: 'orders' },
    { name: 'Invoices', endpoint: 'invoices' }
  ];

  for (const { name, endpoint } of endpoints) {
    console.log(`\n📦 Testing ${name}...`);
    
    try {
      // Test 1: Default call
      console.log(`  Testing default parameters...`);
      const defaultResult = await makeApiRequest(endpoint);
      console.log(`  ✅ Default: ${defaultResult.data?.length || 0} items, total: ${defaultResult.total || 'unknown'}`);

      // Test 2: With skip=0, take=50
      console.log(`  Testing skip=0, take=50...`);
      const smallBatchResult = await makeApiRequest(endpoint, { skip: 0, take: 50 });
      console.log(`  ✅ Small batch: ${smallBatchResult.data?.length || 0} items, total: ${smallBatchResult.total || 'unknown'}`);

      // Test 3: With skip=0, take=100
      console.log(`  Testing skip=0, take=100...`);
      const mediumBatchResult = await makeApiRequest(endpoint, { skip: 0, take: 100 });
      console.log(`  ✅ Medium batch: ${mediumBatchResult.data?.length || 0} items, total: ${mediumBatchResult.total || 'unknown'}`);

      // Test 4: With skip=0, take=1000
      console.log(`  Testing skip=0, take=1000...`);
      const largeBatchResult = await makeApiRequest(endpoint, { skip: 0, take: 1000 });
      console.log(`  ✅ Large batch: ${largeBatchResult.data?.length || 0} items, total: ${largeBatchResult.total || 'unknown'}`);

      // Test 5: Check pagination - second page
      if (defaultResult.total > 20) {
        console.log(`  Testing pagination - skip=20, take=20...`);
        const paginatedResult = await makeApiRequest(endpoint, { skip: 20, take: 20 });
        console.log(`  ✅ Second page: ${paginatedResult.data?.length || 0} items`);
      }

      // Store first result for detailed analysis
      if (defaultResult.data?.length > 0) {
        console.log(`  📊 Sample ${name.toLowerCase().slice(0, -1)} structure:`, 
          JSON.stringify(defaultResult.data[0], null, 2).substring(0, 200) + '...');
      }

      // Add delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 500));

    } catch (error) {
      console.error(`  ❌ Error testing ${name}:`, error.message);
    }
  }
}

/**
 * Test enhanced pagination system
 */
async function testEnhancedPagination(endpoint, maxItems = 100) {
  console.log(`\n🚀 Testing Enhanced Pagination for ${endpoint}...`);
  
  const batchSize = 20; // Start with small batches
  let allData = [];
  let skip = 0;
  let hasMore = true;
  let requestCount = 0;
  const maxRequests = 10; // Safety limit

  while (hasMore && allData.length < maxItems && requestCount < maxRequests) {
    try {
      console.log(`  📈 Batch ${requestCount + 1}: skip=${skip}, take=${batchSize}`);
      
      const batch = await makeApiRequest(endpoint, { skip, take: batchSize });
      requestCount++;

      if (batch && batch.data && batch.data.length > 0) {
        allData = [...allData, ...batch.data];
        skip += batch.data.length;

        console.log(`    ✅ Received ${batch.data.length} items, total so far: ${allData.length}`);
        console.log(`    📊 API reported total: ${batch.total || 'unknown'}`);

        // Check if we've reached the end
        hasMore = batch.data.length === batchSize;
        
        // If API provides total, use that to determine if we should continue
        if (batch.total && allData.length >= batch.total) {
          hasMore = false;
          console.log(`    🎯 Reached API reported total: ${batch.total}`);
        }
      } else {
        hasMore = false;
        console.log(`    🛑 No more data available`);
      }

      // Add delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 300));

    } catch (error) {
      console.error(`    ❌ Error in batch ${requestCount + 1}:`, error.message);
      hasMore = false;
    }
  }

  console.log(`  📊 Enhanced pagination result: ${allData.length} total items from ${requestCount} requests`);
  return allData;
}

/**
 * Test time-based filtering
 */
async function testTimeBasedFiltering() {
  console.log('\n⏰ Testing Time-Based Filtering...');
  console.log('=' .repeat(50));

  const now = new Date();
  const timeFilters = [
    {
      name: '1 Week',
      fromDate: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      toDate: now.toISOString()
    },
    {
      name: '1 Month', 
      fromDate: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString(),
      toDate: now.toISOString()
    },
    {
      name: '1 Year',
      fromDate: new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000).toISOString(),
      toDate: now.toISOString()
    }
  ];

  const timeBasedEndpoints = ['orders', 'invoices'];

  for (const endpoint of timeBasedEndpoints) {
    console.log(`\n📅 Testing ${endpoint} with time filters...`);
    
    // Test without date filter first
    try {
      console.log(`  Testing ${endpoint} without date filter...`);
      const noFilterResult = await makeApiRequest(endpoint, { take: 100 });
      console.log(`  ✅ No filter: ${noFilterResult.data?.length || 0} items, total: ${noFilterResult.total || 'unknown'}`);
    } catch (error) {
      console.error(`  ❌ Error testing ${endpoint} without filter:`, error.message);
    }

    // Test with each time filter
    for (const filter of timeFilters) {
      try {
        console.log(`  Testing ${endpoint} for ${filter.name}...`);
        const result = await makeApiRequest(endpoint, {
          take: 100,
          fromDate: filter.fromDate,
          toDate: filter.toDate
        });
        console.log(`  ✅ ${filter.name}: ${result.data?.length || 0} items, total: ${result.total || 'unknown'}`);
        
        await new Promise(resolve => setTimeout(resolve, 300));
      } catch (error) {
        console.error(`  ❌ Error testing ${endpoint} for ${filter.name}:`, error.message);
      }
    }
  }
}

/**
 * Analyze data quality and structure
 */
async function analyzeDataQuality() {
  console.log('\n🔍 Analyzing Data Quality...');
  console.log('=' .repeat(50));

  try {
    const products = await makeApiRequest('products', { take: 50 });
    const customers = await makeApiRequest('customers', { take: 50 });
    const orders = await makeApiRequest('orders', { take: 50 });
    const invoices = await makeApiRequest('invoices', { take: 50 });

    console.log('\n📊 Data Analysis Results:');
    
    // Products analysis
    if (products.data?.length > 0) {
      console.log(`\n📦 Products (${products.data.length} items):`);
      const sampleProduct = products.data[0];
      console.log(`  - Sample fields: ${Object.keys(sampleProduct).join(', ')}`);
      console.log(`  - Has prices: ${products.data.filter(p => p.basePrice > 0).length}/${products.data.length}`);
      console.log(`  - Has categories: ${products.data.filter(p => p.categoryName).length}/${products.data.length}`);
      console.log(`  - Has inventory: ${products.data.filter(p => p.inventories?.length > 0).length}/${products.data.length}`);
    }

    // Customers analysis
    if (customers.data?.length > 0) {
      console.log(`\n👥 Customers (${customers.data.length} items):`);
      const sampleCustomer = customers.data[0];
      console.log(`  - Sample fields: ${Object.keys(sampleCustomer).join(', ')}`);
      console.log(`  - Has names: ${customers.data.filter(c => c.name).length}/${customers.data.length}`);
      console.log(`  - Has locations: ${customers.data.filter(c => c.locationName || c.address).length}/${customers.data.length}`);
    }

    // Orders analysis
    if (orders.data?.length > 0) {
      console.log(`\n🛒 Orders (${orders.data.length} items):`);
      const sampleOrder = orders.data[0];
      console.log(`  - Sample fields: ${Object.keys(sampleOrder).join(', ')}`);
      console.log(`  - Has customer IDs: ${orders.data.filter(o => o.customerId).length}/${orders.data.length}`);
      console.log(`  - Has totals: ${orders.data.filter(o => o.total > 0).length}/${orders.data.length}`);
      console.log(`  - Status distribution:`, 
        [...new Set(orders.data.map(o => o.status))].join(', '));
    }

    // Invoices analysis  
    if (invoices.data?.length > 0) {
      console.log(`\n💰 Invoices (${invoices.data.length} items):`);
      const sampleInvoice = invoices.data[0];
      console.log(`  - Sample fields: ${Object.keys(sampleInvoice).join(', ')}`);
      console.log(`  - Has totals: ${invoices.data.filter(i => i.total > 0).length}/${invoices.data.length}`);
      const totalRevenue = invoices.data.reduce((sum, inv) => sum + (inv.total || 0), 0);
      console.log(`  - Total revenue: ${totalRevenue.toLocaleString('vi-VN')} VND`);
    }

  } catch (error) {
    console.error('❌ Error analyzing data quality:', error.message);
  }
}

/**
 * Main test runner
 */
async function runComprehensiveTest() {
  console.log('🚀 Starting Comprehensive KiotViet API Data Fetching Test');
  console.log('=' .repeat(80));
  console.log(`🏪 Shop: ${CREDENTIALS.SHOP_NAME}`);
  console.log(`🔑 Client ID: ${CREDENTIALS.CLIENT_ID}`);
  console.log(`⏰ Test started: ${new Date().toLocaleString()}`);

  try {
    // Step 1: Authenticate
    await authenticate();

    // Step 2: Test basic API calls
    await testBasicApiCalls();

    // Step 3: Test enhanced pagination
    console.log('\n🚀 Testing Enhanced Pagination...');
    console.log('=' .repeat(50));
    
    const endpoints = ['products', 'customers', 'orders', 'invoices'];
    for (const endpoint of endpoints) {
      await testEnhancedPagination(endpoint, 200);
      await new Promise(resolve => setTimeout(resolve, 1000)); // Longer delay between endpoints
    }

    // Step 4: Test time-based filtering
    await testTimeBasedFiltering();

    // Step 5: Analyze data quality
    await analyzeDataQuality();

    console.log('\n✅ Comprehensive test completed successfully!');
    console.log('=' .repeat(80));

  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    console.error('Stack trace:', error.stack);
  }
}

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    authenticate,
    makeApiRequest,
    testBasicApiCalls,
    testEnhancedPagination,
    runComprehensiveTest
  };
}

// Run the test if this script is executed directly
if (require.main === module) {
  runComprehensiveTest();
}
