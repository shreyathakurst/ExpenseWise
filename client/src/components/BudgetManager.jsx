"use client"

import { useState } from "react"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { useForm } from "react-hook-form"
import { Target, TrendingUp, AlertTriangle, Trash2 } from "lucide-react"
import toast from "react-hot-toast"

const BudgetManager = ({ categories, budgets, transactions, onBudgetUpdate, onBudgetDelete }) => {
  const { register, handleSubmit, reset } = useForm()
  const [selectedCategory, setSelectedCategory] = useState("")

  const currentMonth = new Date().toISOString().slice(0, 7)

  // Calculate actual spending per category for current month
  const getActualSpending = () => {
    const currentMonthTransactions = transactions.filter((t) => {
      const transactionMonth = new Date(t.date).toISOString().slice(0, 7)
      return transactionMonth === currentMonth && t.type === "expense"
    })

    const categorySpending = {}
    currentMonthTransactions.forEach((t) => {
      categorySpending[t.category] = (categorySpending[t.category] || 0) + t.amount
    })

    return categorySpending
  }

  const actualSpending = getActualSpending()
  const currentMonthBudgets = budgets.filter((b) => b.month === currentMonth)

  // Prepare data for budget vs actual chart
  const getBudgetComparisonData = () => {
    return categories
      .map((category) => {
        const budget = currentMonthBudgets.find((b) => b.category === category)
        const actual = actualSpending[category] || 0

        return {
          category: category.length > 12 ? category.substring(0, 12) + "..." : category,
          fullCategory: category,
          budget: budget ? budget.amount : 0,
          actual: actual,
          remaining: budget ? Math.max(0, budget.amount - actual) : 0,
          overspent: budget ? Math.max(0, actual - budget.amount) : 0,
        }
      })
      .filter((item) => item.budget > 0 || item.actual > 0)
  }

  const budgetData = getBudgetComparisonData()

  const onSubmit = async (data) => {
    try {
      await onBudgetUpdate({
        category: data.category,
        amount: Number.parseFloat(data.amount),
      })
      toast.success("Budget updated successfully!")
      reset()
      setSelectedCategory("")
    } catch (error) {
      toast.error("Error updating budget")
    }
  }

  const handleDeleteBudget = async (budgetId, category) => {
    if (window.confirm(`Are you sure you want to delete the budget for "${category}"?`)) {
      try {
        await onBudgetDelete(budgetId)
        toast.success("Budget deleted successfully!")
      } catch (error) {
        toast.error("Error deleting budget")
      }
    }
  }

  // Calculate insights
  const totalBudget = currentMonthBudgets.reduce((sum, b) => sum + b.amount, 0)
  const totalSpent = Object.values(actualSpending).reduce((sum, amount) => sum + amount, 0)
  const categoriesOverBudget = budgetData.filter((item) => item.overspent > 0).length

  return (
    <div className="space-y-6">
      {/* Budget Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Target className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Budget</p>
              <p className="text-2xl font-bold text-gray-900">${totalBudget.toFixed(2)}</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <TrendingUp className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Spent</p>
              <p className="text-2xl font-bold text-gray-900">${totalSpent.toFixed(2)}</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="p-2 bg-red-100 rounded-lg">
              <AlertTriangle className="h-6 w-6 text-red-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Over Budget</p>
              <p className="text-2xl font-bold text-gray-900">{categoriesOverBudget}</p>
              <p className="text-xs text-gray-500">categories</p>
            </div>
          </div>
        </div>
      </div>

      {/* Budget vs Actual Chart */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Budget vs Actual Spending</h3>
        {budgetData.length > 0 ? (
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={budgetData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="category" />
              <YAxis />
              <Tooltip
                formatter={(value, name) => [`$${value.toFixed(2)}`, name === "budget" ? "Budget" : "Actual"]}
                labelFormatter={(label) => {
                  const item = budgetData.find((d) => d.category === label)
                  return item ? item.fullCategory : label
                }}
              />
              <Bar dataKey="budget" fill="#3b82f6" name="budget" />
              <Bar dataKey="actual" fill="#ef4444" name="actual" />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="text-center py-12 text-gray-500">
            <Target className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p>No budget data available</p>
          </div>
        )}
      </div>

      {/* Set Budget Form */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Set Category Budget</h3>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
              <select
                className="input-field"
                {...register("category", { required: true })}
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
              >
                <option value="">Select a category</option>
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Budget Amount</label>
              <input
                type="number"
                step="0.01"
                min="0"
                className="input-field"
                placeholder="0.00"
                {...register("amount", { required: true, min: 0.01 })}
              />
            </div>
          </div>

          <button type="submit" className="btn-primary">
            Set Budget
          </button>
        </form>
      </div>

      {/* Budget Details */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Budget Details</h3>
        {budgetData.length > 0 ? (
          <div className="space-y-4">
            {budgetData.map((item) => {
              const budget = currentMonthBudgets.find((b) => b.category === item.fullCategory)
              return (
                <div key={item.fullCategory} className="border rounded-lg p-4">
                  <div className="flex justify-between items-center mb-2">
                    <h4 className="font-medium text-gray-900">{item.fullCategory}</h4>
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-sm px-2 py-1 rounded-full ${
                          item.overspent > 0 ? "bg-red-100 text-red-800" : "bg-green-100 text-green-800"
                        }`}
                      >
                        {item.overspent > 0 ? `Over by $${item.overspent.toFixed(2)}` : "On track"}
                      </span>
                      {budget && (
                        <button
                          onClick={() => handleDeleteBudget(budget._id, item.fullCategory)}
                          className="p-1 text-red-600 hover:bg-red-100 rounded transition-colors"
                          title="Delete budget"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Budget: ${item.budget.toFixed(2)}</span>
                      <span>Spent: ${item.actual.toFixed(2)}</span>
                    </div>

                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${item.actual > item.budget ? "bg-red-500" : "bg-green-500"}`}
                        style={{
                          width: `${Math.min(100, (item.actual / item.budget) * 100)}%`,
                        }}
                      ></div>
                    </div>

                    <div className="text-xs text-gray-600">
                      {item.budget > 0 && <span>{((item.actual / item.budget) * 100).toFixed(1)}% of budget used</span>}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          <p className="text-gray-500 text-center py-8">No budgets set yet</p>
        )}
      </div>
    </div>
  )
}

export default BudgetManager
