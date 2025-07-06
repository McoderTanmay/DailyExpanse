"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { MoreHorizontal, Search, Filter, Edit, Trash2 } from "lucide-react"
import type { Transaction } from "@/types"

interface TransactionListProps {
  onTransactionChange?: () => void
}

export function TransactionList({ onTransactionChange }: TransactionListProps) {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [editTransaction, setEditTransaction] = useState<Transaction | null>(null)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [editForm, setEditForm] = useState({
    description: "",
    amount: "",
    category: "",
    type: "",
    date: "",
  })

  const categories = ["Food", "Transport", "Entertainment", "Utilities", "Other", "all"]

  const fetchTransactions = async () => {
    try {
      setLoading(true)
      setError(null)

      const queryParams = new URLSearchParams()
      if (categoryFilter !== "all") {
        queryParams.append("category", categoryFilter)
      }

      const response = await fetch(`http://localhost:5000/api/finance?${queryParams.toString()}`)
      const data = await response.json()

      if (response.ok && data.success && data.data) {
        setTransactions(data.data)
      } else {
        setError(data.error || "Failed to fetch transactions")
      }
    } catch (err) {
      setError("Failed to fetch transactions")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTransactions()
  }, [categoryFilter])

  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(`http://localhost:5000/api/finance/${id}`, {
        method: "DELETE",
      })

      const data = await response.json()

      if (response.ok && data.success) {
        await fetchTransactions()
        onTransactionChange?.()
      } else {
        setError(data.error || "Failed to delete transaction")
      }
    } catch (err) {
      setError("Failed to delete transaction")
    }
  }

  const handleUpdate = async () => {
    if (!editTransaction) return
    const response = await fetch(`http://localhost:5000/api/finance/${editTransaction._id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...editForm,
        amount: parseFloat(editForm.amount),
        date: new Date(editForm.date),
      }),
    })

    const data = await response.json()
    if (response.ok) {
      setIsEditModalOpen(false)
      setEditTransaction(null)
      await fetchTransactions()
    } else {
      alert("Failed to update: " + (data.message || ""))
    }
  }

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      Food: "bg-blue-900 text-blue-300",
      Transport: "bg-green-900 text-green-300",
      Entertainment: "bg-red-900 text-red-300",
      Utilities: "bg-purple-900 text-purple-300",
      Other: "bg-cyan-900 text-cyan-300",
      Income: "bg-emerald-900 text-emerald-300",
    }
    return colors[category] || "bg-gray-900 text-gray-300"
  }

  return (
    <>
      <Card className="bg-gray-900 border-gray-800">
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="text-white">Recent Transactions</CardTitle>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="bg-gray-800 border-gray-700 text-white w-48">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-gray-800 border-gray-700">
                {categories.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat === "all" ? "All Categories" : cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {loading && <div className="text-center text-gray-400">Loading...</div>}
          {error && <div className="text-center text-red-400">Error: {error}</div>}
          {!loading && !error && (
            <Table>
              <TableHeader>
                <TableRow className="border-gray-800">
                  <TableHead className="text-gray-400">Date</TableHead>
                  <TableHead className="text-gray-400">Description</TableHead>
                  <TableHead className="text-gray-400">Category</TableHead>
                  <TableHead className="text-gray-400 text-right">Amount</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {transactions.map((transaction) => (
                  <TableRow key={transaction._id} className="hover:bg-gray-800/50">
                    <TableCell className="text-gray-300">{new Date(transaction.date).toLocaleDateString()}</TableCell>
                    <TableCell className="text-white font-medium">{transaction.description}</TableCell>
                    <TableCell>
                      <Badge className={getCategoryColor(transaction.category)}>{transaction.category}</Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <span className={transaction.type === "income" ? "text-green-400" : "text-red-400"}>
                        {transaction.type === "income" ? "+" : "-"}${Math.abs(transaction.amount).toFixed(2)}
                      </span>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="bg-gray-800 border-gray-700">
                          <DropdownMenuItem asChild>
                            <button
                              className="text-gray-300 hover:bg-gray-700 w-full flex items-center"
                              onClick={() => {
                                setEditTransaction(transaction)
                                setEditForm({
                                  description: transaction.description,
                                  amount: transaction.amount.toString(),
                                  category: transaction.category,
                                  type: transaction.type,
                                  date: new Date(transaction.date).toISOString().slice(0, 10),
                                })
                                setIsEditModalOpen(true)
                              }}
                            >
                              <Edit className="w-4 h-4 mr-2" /> Edit
                            </button>
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-red-400 hover:bg-gray-700"
                            onClick={() => handleDelete(transaction._id)}
                          >
                            <Trash2 className="w-4 h-4 mr-2" /> Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Edit Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="bg-gray-900 border-gray-700 text-white">
          <DialogHeader>
            <DialogTitle>Edit Transaction</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-4">
            <Input
              placeholder="Description"
              value={editForm.description}
              onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
              className="bg-gray-800 text-white"
            />
            <Input
              type="number"
              placeholder="Amount"
              value={editForm.amount}
              onChange={(e) => setEditForm({ ...editForm, amount: e.target.value })}
              className="bg-gray-800 text-white"
            />
            <Input
              type="date"
              value={editForm.date}
              onChange={(e) => setEditForm({ ...editForm, date: e.target.value })}
              className="bg-gray-800 text-white"
            />
            <Select
              value={editForm.category}
              onValueChange={(value) => setEditForm({ ...editForm, category: value })}
            >
              <SelectTrigger className="bg-gray-800 text-white">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent className="bg-gray-800 text-white">
                {categories.filter((c) => c !== "all").map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select
              value={editForm.type}
              onValueChange={(value) => setEditForm({ ...editForm, type: value })}
            >
              <SelectTrigger className="bg-gray-800 text-white">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent className="bg-gray-800 text-white">
                <SelectItem value="income">Income</SelectItem>
                <SelectItem value="expense">Expense</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <DialogFooter className="mt-4">
            <Button className="bg-green-600 hover:bg-green-700 text-white" onClick={handleUpdate}>
              Update
            </Button>
            <Button
              variant="outline"
              className="border-gray-600 text-white"
              onClick={() => setIsEditModalOpen(false)}
            >
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
