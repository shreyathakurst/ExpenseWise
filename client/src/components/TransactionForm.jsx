import { useEffect } from "react"
import { useForm } from "react-hook-form"
import toast from "react-hot-toast"
import { Save, X } from "lucide-react"

const TransactionForm = ({ categories, onSubmit, editingTransaction, onCancel }) => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm()

  useEffect(() => {
    if (editingTransaction) {
      reset({
        amount: editingTransaction.amount,
        description: editingTransaction.description,
        category: editingTransaction.category,
        type: editingTransaction.type,
        date: new Date(editingTransaction.date).toISOString().split("T")[0],
      })
    } else {
      reset({
        amount: "",
        description: "",
        category: categories[0],
        type: "expense",
        date: new Date().toISOString().split("T")[0],
      })
    }
  }, [editingTransaction, reset, categories])

  const onFormSubmit = async (data) => {
    try {
      await onSubmit({
        ...data,
        amount: Number.parseFloat(data.amount),
        date: new Date(data.date),
      })

      if (!editingTransaction) {
        reset()
      }

      toast.success(editingTransaction ? "Transaction updated!" : "Transaction added!")
    } catch (error) {
      toast.error("Error saving transaction")
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="card">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">
            {editingTransaction ? "Edit Transaction" : "Add New Transaction"}
          </h2>
          {editingTransaction && (
            <button onClick={onCancel} className="p-2 text-gray-400 hover:text-gray-600">
              <X className="h-5 w-5" />
            </button>
          )}
        </div>

        <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Amount *</label>
              <input
                type="number"
                step="0.01"
                min="0"
                className="input-field"
                placeholder="0.00"
                {...register("amount", {
                  required: "Amount is required",
                  min: { value: 0.01, message: "Amount must be greater than 0" },
                })}
              />
              {errors.amount && <p className="mt-1 text-sm text-red-600">{errors.amount.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Type *</label>
              <select className="input-field" {...register("type", { required: true })}>
                <option value="expense">Expense</option>
                <option value="income">Income</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Description *</label>
            <input
              type="text"
              className="input-field"
              placeholder="Enter transaction description"
              {...register("description", {
                required: "Description is required",
                minLength: { value: 3, message: "Description must be at least 3 characters" },
              })}
            />
            {errors.description && <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Category *</label>
              <select className="input-field" {...register("category", { required: "Category is required" })}>
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Date *</label>
              <input type="date" className="input-field" {...register("date", { required: "Date is required" })} />
              {errors.date && <p className="mt-1 text-sm text-red-600">{errors.date.message}</p>}
            </div>
          </div>

          <div className="flex gap-4 pt-4">
            <button type="submit" className="btn-primary flex items-center gap-2">
              <Save className="h-4 w-4" />
              {editingTransaction ? "Update Transaction" : "Add Transaction"}
            </button>

            {editingTransaction && (
              <button type="button" onClick={onCancel} className="btn-secondary">
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  )
}

export default TransactionForm
