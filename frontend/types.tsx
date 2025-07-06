export interface Transaction {
  _id: string
  amount: number
  category: string
  description: string
  date: Date
  type: "income" | "expense"
  createdAt?: Date
  updatedAt?: Date
}
