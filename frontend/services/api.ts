// Frontend API Client Service
// Handles all communication with the backend

const API_BASE_URL = (import.meta as any).env?.VITE_API_URL || "http://localhost:5000/api";


interface RequestConfig {
  headers?: Record<string, string>;
  body?: any;
}

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
  }

  private async request(
    endpoint: string,
    method: "GET" | "POST" | "PUT" | "DELETE" = "GET",
    data?: any
  ) {
    const url = `${this.baseUrl}${endpoint}`;
    const config: RequestInit = {
      method,
      headers: {
        "Content-Type": "application/json",
      },
    };

    // Add authorization header if token exists
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers = {
        ...config.headers,
        "Authorization": `Bearer ${token}`,
      };
    }

    if (data) {
      config.body = JSON.stringify(data);
    }

    try {
      const response = await fetch(url, config);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`API Error [${method} ${endpoint}]:`, error);
      throw error;
    }
  }

  // Objectives API
  objectives = {
    list: () => this.request("/objectives"),
    get: (id: string) => this.request(`/objectives/${id}`),
    create: (data: {
      title: string;
      description?: string;
      category: string;
      color: string;
      quarter?: string;
      endDate?: string;
      ownerId: string;
      parentId?: string;
    }) => {
      // Filter out empty/null parentId
      const cleanData = {
        ...data,
        parentId: data.parentId && data.parentId.trim() ? data.parentId : undefined
      };
      // Remove undefined fields
      Object.keys(cleanData).forEach(key => 
        cleanData[key as keyof typeof cleanData] === undefined && delete cleanData[key as keyof typeof cleanData]
      );
      return this.request("/objectives", "POST", cleanData);
    },
    update: (
      id: string,
      data: Record<string, any>
    ) => this.request(`/objectives/${id}`, "PUT", data),
    delete: (id: string) => this.request(`/objectives/${id}`, "DELETE"),
    getKeyResults: (id: string) =>
      this.request(`/objectives/${id}/key-results`),
  };

  // Users API
  users = {
    list: () => this.request("/users"),
    get: (id: string) => this.request(`/users/${id}`),
    create: (data: { id?: string; name: string; email: string; avatar?: string }) =>
      this.request("/users", "POST", data),
  };

  // Authentication API
  auth = {
    login: (username: string, password: string) =>
      this.request("/auth/login", "POST", { username, password }),
    register: (data: { username: string; password: string; name: string; email: string; role?: string }) =>
      this.request("/auth/register", "POST", data),
    verify: (token: string) =>
      this.request("/auth/verify", "POST", { token }),
  };

  // Key Results API (for future implementation)
  keyResults = {
    create: (objectiveId: string, data: Record<string, any>) =>
      this.request("/key-results", "POST", { ...data, objectiveId }),
    update: (id: string, data: Record<string, any>) =>
      this.request(`/key-results/${id}`, "PUT", data),
    delete: (id: string) => this.request(`/key-results/${id}`, "DELETE"),
  };
}

export const apiClient = new ApiClient();
