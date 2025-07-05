"use client"

import { useState, useEffect } from "react"
import { Toaster } from "react-hot-toast"
import Dashboard from "./components/Dashboard"
import TransactionForm from "./components/TransactionForm"
import TransactionList from "./components/TransactionList"
import BudgetManager from "./components/BudgetManager"
import { transactionService } from "./services/api"
import "./index.css"

const PREDEFINED_CATEGORIES = [
  "Food & Dining",
  "Transportation",
  "Shopping",
  "Entertainment",
  "Bills & Utilities",
  "Healthcare",
  "Education",
  "Travel",
  "Groceries",
  "Other",
]

function App() {
  const [transactions, setTransactions] = useState([])
  const [budgets, setBudgets] = useState([])
  const [activeTab, setActiveTab] = useState("dashboard")
  const [editingTransaction, setEditingTransaction] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      const [transactionsData, budgetsData] = await Promise.all([
        transactionService.getAll(),
        transactionService.getBudgets(),
      ])
      setTransactions(transactionsData)
      setBudgets(budgetsData)
    } catch (error) {
      console.error("Error loading data:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleTransactionSubmit = async (transactionData) => {
    try {
      if (editingTransaction) {
        const updated = await transactionService.update(editingTransaction._id, transactionData)
        setTransactions((prev) => prev.map((t) => (t._id === editingTransaction._id ? updated : t)))
        setEditingTransaction(null)
      } else {
        const newTransaction = await transactionService.create(transactionData)
        setTransactions((prev) => [newTransaction, ...prev])
      }
      setActiveTab("transactions")
    } catch (error) {
      console.error("Error saving transaction:", error)
    }
  }

  const handleDeleteTransaction = async (id) => {
    try {
      await transactionService.delete(id)
      setTransactions((prev) => prev.filter((t) => t._id !== id))
    } catch (error) {
      console.error("Error deleting transaction:", error)
    }
  }

  const handleEditTransaction = (transaction) => {
    setEditingTransaction(transaction)
    setActiveTab("add")
  }

  const handleBudgetUpdate = async (budgetData) => {
    try {
      const currentMonth = new Date().toISOString().slice(0, 7)
      const budgetWithMonth = { ...budgetData, month: currentMonth }

      const existingBudget = budgets.find((b) => b.category === budgetData.category && b.month === currentMonth)

      if (existingBudget) {
        const updated = await transactionService.updateBudget(existingBudget._id, budgetWithMonth)
        setBudgets((prev) => prev.map((b) => (b._id === existingBudget._id ? updated : b)))
      } else {
        const newBudget = await transactionService.createBudget(budgetWithMonth)
        setBudgets((prev) => [...prev, newBudget])
      }
    } catch (error) {
      console.error("Error updating budget:", error)
    }
  }

  const handleDeleteBudget = async (budgetId) => {
    try {
      await transactionService.deleteBudget(budgetId)
      setBudgets((prev) => prev.filter((b) => b._id !== budgetId))
    } catch (error) {
      console.error("Error deleting budget:", error)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading ExpenseWise...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Toaster position="top-right" />

      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900">ExpenseWise</h1>
              <span className="ml-2 text-sm text-gray-500">Personal Finance Tracker</span>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8">
            {[
              { id: "dashboard", label: "Dashboard" },
              { id: "add", label: editingTransaction ? "Edit Transaction" : "Add Transaction" },
              { id: "transactions", label: "Transactions" },
              { id: "budgets", label: "Budgets" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id)
                  if (tab.id !== "add") setEditingTransaction(null)
                }}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? "border-primary-500 text-primary-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {activeTab === "dashboard" && (
          <Dashboard transactions={transactions} budgets={budgets} categories={PREDEFINED_CATEGORIES} />
        )}

        {activeTab === "add" && (
          <TransactionForm
            categories={PREDEFINED_CATEGORIES}
            onSubmit={handleTransactionSubmit}
            editingTransaction={editingTransaction}
            onCancel={() => {
              setEditingTransaction(null)
              setActiveTab("transactions")
            }}
          />
        )}

        {activeTab === "transactions" && (
          <TransactionList
            transactions={transactions}
            onEdit={handleEditTransaction}
            onDelete={handleDeleteTransaction}
          />
        )}

        {activeTab === "budgets" && (
          <BudgetManager
            categories={PREDEFINED_CATEGORIES}
            budgets={budgets}
            transactions={transactions}
            onBudgetUpdate={handleBudgetUpdate}
            onBudgetDelete={handleDeleteBudget}
          />
        )}
      </main>
    </div>
  )
}

export default App
