import type { Transaction, Budget, ApiResponse, DashboardStats } from "./types"

const API_BASE = "/api"

class ApiClient {
  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
    try {
      const response = await fetch(`${API_BASE}${endpoint}`, {
        headers: {
          "Content-Type": "application/json",
          ...options.headers,
        },
        ...options,
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "An error occurred")
      }

      return data
    } catch (error) {
      console.error("API request failed:", error)
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      }
    }
  }

  // Transaction methods
  async getTransactions(params?: {
    page?: number
    limit?: number
    category?: string
    search?: string
  }): Promise<ApiResponse<{ transactions: Transaction[]; total: number }>> {
    const searchParams = new URLSearchParams()
    if (params?.page) searchParams.set("page", params.page.toString())
    if (params?.limit) searchParams.set("limit", params.limit.toString())
    if (params?.category) searchParams.set("category", params.category)
    if (params?.search) searchParams.set("search", params.search)

    const query = searchParams.toString()
    return this.request(`/transactions${query ? `?${query}` : ""}`)
  }

  async createTransaction(
    transaction: Omit<Transaction, "_id" | "createdAt" | "updatedAt">,
  ): Promise<ApiResponse<Transaction>> {
    return this.request("/transactions", {
      method: "POST",
      body: JSON.stringify(transaction),
    })
  }

  async updateTransaction(id: string, transaction: Partial<Transaction>): Promise<ApiResponse<Transaction>> {
    return this.request(`/transactions/${id}`, {
      method: "PUT",
      body: JSON.stringify(transaction),
    })
  }

  async deleteTransaction(id: string): Promise<ApiResponse<void>> {
    return this.request(`/transactions/${id}`, {
      method: "DELETE",
    })
  }

  // Budget methods
  async getBudgets(): Promise<ApiResponse<Budget[]>> {
    return this.request("/budgets")
  }

  async createBudget(budget: Omit<Budget, "_id" | "createdAt" | "updatedAt">): Promise<ApiResponse<Budget>> {
    return this.request("/budgets", {
      method: "POST",
      body: JSON.stringify(budget),
    })
  }

  async updateBudget(id: string, budget: Partial<Budget>): Promise<ApiResponse<Budget>> {
    return this.request(`/budgets/${id}`, {
      method: "PUT",
      body: JSON.stringify(budget),
    })
  }

  async deleteBudget(id: string): Promise<ApiResponse<void>> {
    return this.request(`/budgets/${id}`, {
      method: "DELETE",
    })
  }

  // Dashboard stats
  async getDashboardStats(): Promise<ApiResponse<DashboardStats>> {
    return this.request("/dashboard/stats")
  }
}

export const apiClient = new ApiClient()
