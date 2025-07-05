const express = require("express")
const mongoose = require("mongoose")
const cors = require("cors")
require("dotenv").config()

const app = express()
const PORT = process.env.PORT || 3000

// Middleware
app.use(cors())
app.use(express.json())

// MongoDB Connection
const MONGODB_URI = process.env.MONGODB_URI;

mongoose
  .connect(MONGODB_URI)
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("MongoDB connection error:", err))

// Transaction Schema
const transactionSchema = new mongoose.Schema(
  {
    amount: { type: Number, required: true },
    description: { type: String, required: true },
    category: { type: String, required: true },
    date: { type: Date, default: Date.now },
    type: { type: String, enum: ["expense", "income"], default: "expense" },
  },
  { timestamps: true },
)

// Budget Schema
const budgetSchema = new mongoose.Schema(
  {
    category: { type: String, required: true, unique: true },
    amount: { type: Number, required: true },
    month: { type: String, required: true }, // Format: YYYY-MM
  },
  { timestamps: true },
)

const Transaction = mongoose.model("Transaction", transactionSchema)
const Budget = mongoose.model("Budget", budgetSchema)

// Routes

// Get all transactions
app.get("/api/transactions", async (req, res) => {
  try {
    const transactions = await Transaction.find().sort({ date: -1 })
    res.json(transactions)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// Create transaction
app.post("/api/transactions", async (req, res) => {
  try {
    const transaction = new Transaction(req.body)
    await transaction.save()
    res.status(201).json(transaction)
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
})

// Update transaction
app.put("/api/transactions/:id", async (req, res) => {
  try {
    const transaction = await Transaction.findByIdAndUpdate(req.params.id, req.body, { new: true })
    res.json(transaction)
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
})

// Delete transaction
app.delete("/api/transactions/:id", async (req, res) => {
  try {
    await Transaction.findByIdAndDelete(req.params.id)
    res.json({ message: "Transaction deleted successfully" })
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
})

// Budget routes
app.get("/api/budgets", async (req, res) => {
  try {
    const budgets = await Budget.find()
    res.json(budgets)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

app.post("/api/budgets", async (req, res) => {
  try {
    const budget = new Budget(req.body)
    await budget.save()
    res.status(201).json(budget)
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
})

app.put("/api/budgets/:id", async (req, res) => {
  try {
    const budget = await Budget.findByIdAndUpdate(req.params.id, req.body, { new: true })
    res.json(budget)
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
})

// Delete budget
app.delete("/api/budgets/:id", async (req, res) => {
  try {
    await Budget.findByIdAndDelete(req.params.id)
    res.json({ message: "Budget deleted successfully" })
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
})

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
