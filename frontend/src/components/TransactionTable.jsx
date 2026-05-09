export default function TransactionTable({ transactions, onDelete }) {
  if (transactions.length === 0) {
    return (
      <div className="card">
        <h2 className="card-title">Transaction History</h2>
        <p className="empty-state">No transactions yet. Add one above.</p>
      </div>
    )
  }

  return (
    <div className="card">
      <h2 className="card-title">Transaction History</h2>
      <div className="table-wrapper">
        <table className="table">
          <thead>
            <tr>
              <th>Description</th>
              <th>Amount</th>
              <th>AI Category</th>
              <th>Rule Category</th>
              <th>Match</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {transactions.map(tx => (
              <tr key={tx.id}>
                <td className="td-desc" title={tx.description}>{tx.description}</td>
                <td className="td-amount">${tx.amount.toFixed(2)}</td>
                <td><span className="badge badge-ai">{tx.ai_category}</span></td>
                <td><span className="badge badge-rule">{tx.rule_category}</span></td>
                <td>
                  {tx.ai_category === tx.rule_category
                    ? <span className="match-yes">✓</span>
                    : <span className="match-no">✗</span>}
                </td>
                <td>
                  <button className="btn-delete" onClick={() => onDelete(tx.id)}>×</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
