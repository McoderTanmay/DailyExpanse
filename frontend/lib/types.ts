export interface Transaction {
  _id?: string
  amount: number
  category: string
  description: string
  date: Date
  type: "income" | "expense"
  userId?: string
  createdAt?: Date
  updatedAt?: Date
}

export interface Budget {
  _id?: string
  category: string
  amount: number
  period: "weekly" | "monthly" | "yearly"
  userId?: string
  createdAt?: Date
  updatedAt?: Date
}

export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

export interface DashboardStats {
  totalExpenses: number
  totalIncome: number
  categoryBreakdown: Array<{
    name: string
    value: number
    color: string
  }>
  monthlyExpenses: Array<{
    month: string
    amount: number
  }>
}
