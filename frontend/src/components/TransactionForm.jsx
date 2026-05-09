import { useState } from "react"

export default function TransactionForm({ onAdd, loading }) {
  const [description, setDescription] = useState("")
  const [amount, setAmount] = useState("")
  const [lastResult, setLastResult] = useState(null)

  async function handleSubmit() {
    if (!description.trim() || !amount) return
    const result = await onAdd(description, amount)
    setLastResult(result)
    setDescription("")
    setAmount("")
  }

  return (
    <div className="card">
      <h2 className="card-title">Add Transaction</h2>
      <div className="form">
        <div className="form-group">
          <label className="form-label">Transaction Description</label>
          <input
            className="form-input"
            placeholder="e.g. SQ*COFFEE HOUSE 482991"
            value={description}
            onChange={e => setDescription(e.target.value)}
            onKeyDown={e => e.key === "Enter" && handleSubmit()}
          />
        </div>
        <div className="form-group">
          <label className="form-label">Amount ($)</label>
          <input
            className="form-input"
            type="number"
            placeholder="0.00"
            value={amount}
            onChange={e => setAmount(e.target.value)}
            onKeyDown={e => e.key === "Enter" && handleSubmit()}
          />
        </div>
        <button
          className="btn-primary"
          onClick={handleSubmit}
          disabled={loading || !description.trim() || !amount}
        >
          {loading ? "Categorizing..." : "Categorize with AI"}
        </button>
      </div>

      {lastResult && (
        <div className="result-box">
          <div className="result-row">
            <span className="result-label">AI Category</span>
            <span className="badge badge-ai">{lastResult.ai_category}</span>
          </div>
          <div className="result-row">
            <span className="result-label">Rule-Based</span>
            <span className="badge badge-rule">{lastResult.rule_category}</span>
          </div>
          <div className="result-row">
            <span className="result-label">Confidence</span>
            <span className="result-value">{Math.round(lastResult.confidence * 100)}%</span>
          </div>
          <p className="result-reasoning">{lastResult.reasoning}</p>
        </div>
      )}
    </div>
  )
}
