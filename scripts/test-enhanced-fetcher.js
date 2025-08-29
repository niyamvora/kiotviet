/**
 * Test the enhanced data fetcher specifically for KiotViet pagination
 * This tests our enhanced pagination system that understands KiotViet's 20-item limit
 */

const {
  testEnhancedDataFetch,
  fetchComprehensiveData,
} = require("../lib/data/enhanced-data-fetcher.ts");

// Simulate the environment for testing
global.console = console;

async function testEnhancedFetcher() {
  console.log("🚀 Testing Enhanced Data Fetcher with KiotViet API");
  console.log("=".repeat(80));
  console.log(`⏰ Test started: ${new Date().toLocaleString()}`);

  try {
    console.log("\n📊 Testing fetchComprehensiveData function...");

    // Test with different time filters and limits
    const testConfigs = [
      {
        name: "Small Test (100 items max)",
        config: {
          timeFilter: "1m",
          maxItems: 100,
          includeDetails: true,
        },
      },
      {
        name: "Medium Test (500 items max)",
        config: {
          timeFilter: "1y",
          maxItems: 500,
          includeDetails: true,
        },
      },
    ];

    for (const test of testConfigs) {
      console.log(`\n🔬 Running ${test.name}...`);
      console.log("-".repeat(50));

      try {
        const startTime = Date.now();
        const data = await fetchComprehensiveData(test.config);
        const endTime = Date.now();
        const duration = ((endTime - startTime) / 1000).toFixed(2);

        console.log(`\n✅ ${test.name} completed in ${duration}s`);
        console.log("📊 Results Summary:");
        console.log(
          `  Products: ${data.products.total} items (${data.products.categories.length} categories)`
        );
        console.log(
          `  Customers: ${data.customers.total} items (${
            Object.keys(data.customers.segments).length
          } segments)`
        );
        console.log(`  Orders: ${data.orders.total} items`);
        console.log(`  Invoices: ${data.invoices.total} items`);
        console.log(
          `  Total Revenue: ${data.summary.totalRevenue.toLocaleString(
            "vi-VN"
          )} VND`
        );
        console.log(
          `  Average Order Value: ${data.summary.avgOrderValue.toLocaleString(
            "vi-VN"
          )} VND`
        );

        // Show sample data structure
        if (data.products.data.length > 0) {
          console.log(`\n📦 Sample Product:`, {
            name: data.products.data[0].fullName || data.products.data[0].name,
            category: data.products.data[0].categoryName,
            price: data.products.data[0].basePrice,
          });
        }

        if (data.orders.data.length > 0) {
          console.log(`🛒 Sample Order:`, {
            code: data.orders.data[0].code,
            total: data.orders.data[0].total,
            status: data.orders.data[0].status,
            date: data.orders.data[0].purchaseDate,
          });
        }

        if (data.invoices.data.length > 0) {
          console.log(`💰 Sample Invoice:`, {
            code: data.invoices.data[0].code,
            total: data.invoices.data[0].total,
            date: data.invoices.data[0].purchaseDate,
          });
        }
      } catch (error) {
        console.error(`❌ ${test.name} failed:`, error.message);
        console.error("Stack trace:", error.stack);
      }

      // Wait between tests to avoid rate limiting
      if (testConfigs.indexOf(test) < testConfigs.length - 1) {
        console.log("\n⏳ Waiting 5 seconds before next test...");
        await new Promise((resolve) => setTimeout(resolve, 5000));
      }
    }

    console.log("\n✅ All enhanced data fetcher tests completed!");
    console.log("=".repeat(80));
  } catch (error) {
    console.error("\n❌ Enhanced data fetcher test failed:", error.message);
    console.error("Stack trace:", error.stack);
  }
}

// Export for use in other scripts
if (typeof module !== "undefined" && module.exports) {
  module.exports = {
    testEnhancedFetcher,
  };
}

// Run the test if this script is executed directly
if (require.main === module) {
  testEnhancedFetcher();
}
