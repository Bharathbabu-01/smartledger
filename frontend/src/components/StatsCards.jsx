export default function StatsCards({ stats }) {
  const cards = [
    { label: "Total Transactions", value: stats.total_transactions },
    { label: "Total Spend", value: `$${stats.total_spend.toFixed(2)}` },
    { label: "AI Agreement Rate", value: `${stats.agreement_rate}%` },
    { label: "Avg AI Confidence", value: `${stats.avg_confidence}%` },
  ]

  return (
    <div className="stats-grid">
      {cards.map((card, i) => (
        <div key={i} className="stat-card">
          <p className="stat-label">{card.label}</p>
          <p className="stat-value">{card.value}</p>
        </div>
      ))}
    </div>
  )
}
