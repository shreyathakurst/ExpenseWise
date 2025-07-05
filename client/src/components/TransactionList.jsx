import { useState } from "react"
import { format } from "date-fns"
import { Edit2, Trash2, Search, Filter } from "lucide-react"
import toast from "react-hot-toast"

const TransactionList = ({ transactions, onEdit, onDelete }) => {
  const [searchTerm, setSearchTerm] = useState("")
  const [filterCategory, setFilterCategory] = useState("")
  const [filterType, setFilterType] = useState("")

  const categories = [...new Set(transactions.map((t) => t.category))]

  const filteredTransactions = transactions.filter((transaction) => {
    const matchesSearch =
      transaction.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.category.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = !filterCategory || transaction.category === filterCategory
    const matchesType = !filterType || transaction.type === filterType

    return matchesSearch && matchesCategory && matchesType
  })

  const handleDelete = async (id, description) => {
    if (window.confirm(`Are you sure you want to delete "${description}"?`)) {
      try {
        await onDelete(id)
        toast.success("Transaction deleted successfully")
      } catch (error) {
        toast.error("Error deleting transaction")
      }
    }
  }

  return (
    <div className="space-y-6">
      <div className="card">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">All Transactions</h2>

        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <input
              type="text"
              placeholder="Search transactions..."
              className="input-field pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <select className="input-field" value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)}>
            <option value="">All Categories</option>
            {categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>

          <select className="input-field" value={filterType} onChange={(e) => setFilterType(e.target.value)}>
            <option value="">All Types</option>
            <option value="expense">Expenses</option>
            <option value="income">Income</option>
          </select>
        </div>

        {/* Transaction List */}
        {filteredTransactions.length > 0 ? (
          <div className="space-y-3">
            {filteredTransactions.map((transaction) => (
              <div
                key={transaction._id}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-4">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900">{transaction.description}</h3>
                      <div className="flex items-center gap-4 mt-1">
                        <span className="text-sm text-gray-600">{transaction.category}</span>
                        <span className="text-sm text-gray-500">
                          {format(new Date(transaction.date), "MMM dd, yyyy")}
                        </span>
                        <span
                          className={`text-xs px-2 py-1 rounded-full ${
                            transaction.type === "expense" ? "bg-red-100 text-red-800" : "bg-green-100 text-green-800"
                          }`}
                        >
                          {transaction.type}
                        </span>
                      </div>
                    </div>

                    <div className="text-right">
                      <p
                        className={`text-lg font-semibold ${
                          transaction.type === "expense" ? "text-red-600" : "text-green-600"
                        }`}
                      >
                        {transaction.type === "expense" ? "-" : "+"}${transaction.amount.toFixed(2)}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 ml-4">
                  <button
                    onClick={() => onEdit(transaction)}
                    className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
                    title="Edit transaction"
                  >
                    <Edit2 className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(transaction._id, transaction.description)}
                    className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                    title="Delete transaction"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <Filter className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No transactions found</p>
            {(searchTerm || filterCategory || filterType) && (
              <button
                onClick={() => {
                  setSearchTerm("")
                  setFilterCategory("")
                  setFilterType("")
                }}
                className="mt-2 text-primary-600 hover:text-primary-700"
              >
                Clear filters
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default TransactionList
