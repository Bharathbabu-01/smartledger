import { useState, useEffect } from "react"
import TransactionForm from "./components/TransactionForm"
import TransactionTable from "./components/TransactionTable"
import StatsCards from "./components/StatsCards"
import SpendingChart from "./components/SpendingChart"

const API = "http://localhost:8000"

export default function App() {
  const [transactions, setTransactions] = useState([])
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(false)

  async function fetchData() {
    const [txRes, statsRes] = await Promise.all([
      fetch(`${API}/transactions`),
      fetch(`${API}/stats`)
    ])
    setTransactions(await txRes.json())
    setStats(await statsRes.json())
  }

  useEffect(() => {
    fetchData()
  }, [])

  async function addTransaction(description, amount) {
    setLoading(true)
    try {
      const res = await fetch(`${API}/transactions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ description, amount: parseFloat(amount) })
      })
      const tx = await res.json()
      await fetchData()
      return tx
    } finally {
      setLoading(false)
    }
  }

  async function deleteTransaction(id) {
    await fetch(`${API}/transactions/${id}`, { method: "DELETE" })
    await fetchData()
  }

  return (
    <div className="app">
      <header className="header">
        <div className="header-inner">
          <div className="logo">
            <span className="logo-icon">◈</span>
            <span className="logo-text">SmartLedger</span>
          </div>
          <span className="header-sub">AI-Powered Transaction Categorizer</span>
        </div>
      </header>

      <main className="main">
        {stats && <StatsCards stats={stats} />}

        <div className="grid">
          <div className="left-col">
            <TransactionForm onAdd={addTransaction} loading={loading} />
            <TransactionTable transactions={transactions} onDelete={deleteTransaction} />
          </div>
          <div className="right-col">
            {stats && <SpendingChart stats={stats} />}
          </div>
        </div>
      </main>
    </div>
  )
}
