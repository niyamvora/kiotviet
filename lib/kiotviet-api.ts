/**
 * KiotViet API integration service
 * Handles authentication and data fetching from KiotViet APIs
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
  private baseURL = "https://public.kiotapi.com";

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

    const response = await fetch(`${this.baseURL}/oauth2/token`, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        client_id: this.credentials.clientId,
        client_secret: this.credentials.secretKey,
        grant_type: "client_credentials",
        scopes: "PublicApi.Access",
      }),
    });

    if (!response.ok) {
      throw new Error("Failed to authenticate with KiotViet API");
    }

    const data = await response.json();
    this.accessToken = data.access_token;

    return this.accessToken;
  }

  private async apiRequest<T>(
    endpoint: string,
    options?: RequestInit
  ): Promise<KiotVietResponse<T>> {
    const token = await this.authenticate();

    const response = await fetch(`${this.baseURL}${endpoint}`, {
      ...options,
      headers: {
        Authorization: `Bearer ${token}`,
        Retailer: this.credentials?.retailer || "chezbebe",
        "Content-Type": "application/json",
        ...options?.headers,
      },
    });

    if (!response.ok) {
      throw new Error(
        `KiotViet API error: ${response.status} ${response.statusText}`
      );
    }

    return response.json();
  }

  // Products API
  async getProducts(skip: number = 0, take: number = 100) {
    return this.apiRequest<any[]>(`/products?skip=${skip}&take=${take}`);
  }

  async getProductById(id: number) {
    return this.apiRequest<any>(`/products/${id}`);
  }

  // Customers API
  async getCustomers(skip: number = 0, take: number = 100) {
    return this.apiRequest<any[]>(`/customers?skip=${skip}&take=${take}`);
  }

  async getCustomerById(id: number) {
    return this.apiRequest<any>(`/customers/${id}`);
  }

  // Orders API
  async getOrders(
    skip: number = 0,
    take: number = 100,
    fromDate?: string,
    toDate?: string
  ) {
    let endpoint = `/orders?skip=${skip}&take=${take}`;
    if (fromDate) endpoint += `&fromDate=${fromDate}`;
    if (toDate) endpoint += `&toDate=${toDate}`;
    return this.apiRequest<any[]>(endpoint);
  }

  async getOrderById(id: number) {
    return this.apiRequest<any>(`/orders/${id}`);
  }

  // Invoices API
  async getInvoices(
    skip: number = 0,
    take: number = 100,
    fromDate?: string,
    toDate?: string
  ) {
    let endpoint = `/invoices?skip=${skip}&take=${take}`;
    if (fromDate) endpoint += `&fromDate=${fromDate}`;
    if (toDate) endpoint += `&toDate=${toDate}`;
    return this.apiRequest<any[]>(endpoint);
  }

  async getInvoiceById(id: number) {
    return this.apiRequest<any>(`/invoices/${id}`);
  }

  // Categories API
  async getCategories() {
    return this.apiRequest<any[]>("/categories");
  }

  // Branches API
  async getBranches() {
    return this.apiRequest<any[]>("/branches");
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
