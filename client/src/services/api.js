import axios from "axios"

const API_BASE_URL = "http://localhost:3000/api"

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
})

export const transactionService = {
  // Transaction CRUD operations
  getAll: async () => {
    const response = await api.get("/transactions")
    return response.data
  },

  create: async (transactionData) => {
    const response = await api.post("/transactions", transactionData)
    return response.data
  },

  update: async (id, transactionData) => {
    const response = await api.put(`/transactions/${id}`, transactionData)
    return response.data
  },

  delete: async (id) => {
    const response = await api.delete(`/transactions/${id}`)
    return response.data
  },

  // Budget operations
  getBudgets: async () => {
    const response = await api.get("/budgets")
    return response.data
  },

  createBudget: async (budgetData) => {
    const response = await api.post("/budgets", budgetData)
    return response.data
  },

  updateBudget: async (id, budgetData) => {
    const response = await api.put(`/budgets/${id}`, budgetData)
    return response.data
  },

  // Add delete budget method
  deleteBudget: async (id) => {
    const response = await api.delete(`/budgets/${id}`)
    return response.data
  },
}

export default api
