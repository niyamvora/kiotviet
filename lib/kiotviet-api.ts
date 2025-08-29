/**
 * KiotViet API integration service
 * Now uses backend API routes to avoid CORS issues
 */

interface KiotVietCredentials {
  clientId: string;
  secretKey: string;
  retailer?: string;
}

interface KiotVietResponse<T> {
  data: T;
  pageSize?: number;
  skip?: number;
  total?: number;
}

class KiotVietAPI {
  private credentials: KiotVietCredentials | null = null;
  private accessToken: string | null = null;

  constructor(credentials?: KiotVietCredentials) {
    if (credentials) {
      this.credentials = credentials;
    }
  }

  setCredentials(credentials: KiotVietCredentials) {
    this.credentials = credentials;
    this.accessToken = null; // Reset token when credentials change
  }

  private async authenticate(): Promise<string> {
    if (this.accessToken) {
      return this.accessToken;
    }

    if (!this.credentials) {
      throw new Error("KiotViet credentials not set");
    }

    console.log("🔐 Authenticating via backend API...");

    // Use our backend API route instead of direct KiotViet call
    const response = await fetch("/api/kiotviet/auth", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        clientId: this.credentials.clientId,
        secretKey: this.credentials.secretKey,
      }),
    });

    if (!response.ok) {
      const errorData = await response
        .json()
        .catch(() => ({ error: "Authentication failed" }));
      throw new Error(`Authentication failed: ${errorData.error}`);
    }

    const data = await response.json();
    this.accessToken = data.access_token;

    if (!this.accessToken) {
      throw new Error("No access token received");
    }

    console.log("✅ Authentication successful");
    return this.accessToken;
  }

  private async apiRequest<T>(
    endpoint: string,
    params: any = {}
  ): Promise<KiotVietResponse<T>> {
    const token = await this.authenticate();

    if (!this.credentials?.retailer) {
      throw new Error("Retailer name is required");
    }

    console.log(`📡 Making API request to ${endpoint}...`);

    // Use our backend API routes instead of direct KiotViet calls
    const response = await fetch(`/api/kiotviet/${endpoint}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        accessToken: token,
        retailer: this.credentials.retailer,
        ...params,
      }),
    });

    if (!response.ok) {
      const errorData = await response
        .json()
        .catch(() => ({ error: "API request failed" }));
      throw new Error(`${endpoint} API failed: ${errorData.error}`);
    }

    const data = await response.json();
    console.log(`✅ ${endpoint} request successful`);
    return data;
  }

  // Products API
  async getProducts(skip: number = 0, take: number = 1000) {
    return this.apiRequest<any[]>("products", { skip, take });
  }

  async getProductById(id: number) {
    return this.apiRequest<any>("products", { id });
  }

  // Customers API
  async getCustomers(skip: number = 0, take: number = 1000) {
    return this.apiRequest<any[]>("customers", { skip, take });
  }

  async getCustomerById(id: number) {
    return this.apiRequest<any>("customers", { id });
  }

  // Orders API
  async getOrders(
    skip: number = 0,
    take: number = 2000,
    fromDate?: string,
    toDate?: string
  ) {
    return this.apiRequest<any[]>("orders", { skip, take, fromDate, toDate });
  }

  async getOrderById(id: number) {
    return this.apiRequest<any>("orders", { id });
  }

  // Invoices API
  async getInvoices(
    skip: number = 0,
    take: number = 2000,
    fromDate?: string,
    toDate?: string
  ) {
    return this.apiRequest<any[]>("invoices", { skip, take, fromDate, toDate });
  }

  async getInvoiceById(id: number) {
    return this.apiRequest<any>("invoices", { id });
  }

  // Categories API
  async getCategories() {
    return this.apiRequest<any[]>("categories");
  }

  // Branches API
  async getBranches() {
    return this.apiRequest<any[]>("branches");
  }

  // Analytics helpers
  async getTotalRevenue(fromDate?: string, toDate?: string): Promise<number> {
    const invoices = await this.getInvoices(0, 1000, fromDate, toDate);
    return invoices.data.reduce(
      (total, invoice) => total + (invoice.total || 0),
      0
    );
  }

  async getTotalOrders(fromDate?: string, toDate?: string): Promise<number> {
    const orders = await this.getOrders(0, 1000, fromDate, toDate);
    return orders.total || orders.data.length;
  }

  async getTotalCustomers(): Promise<number> {
    const customers = await this.getCustomers(0, 1);
    return customers.total || 0;
  }

  async getTotalProducts(): Promise<number> {
    const products = await this.getProducts(0, 1);
    return products.total || 0;
  }
}

// Create a singleton instance
export const kiotVietAPI = new KiotVietAPI();

// Export types
export type { KiotVietCredentials, KiotVietResponse };
