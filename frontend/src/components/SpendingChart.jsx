import {
  PieChart, Pie, Cell, BarChart, Bar,
  XAxis, YAxis, Tooltip, Legend, ResponsiveContainer
} from "recharts"

const COLORS = {
  "Food & Dining": "#f97316",
  "Transport": "#3b82f6",
  "Shopping": "#8b5cf6",
  "Utilities": "#10b981",
  "Entertainment": "#f59e0b",
  "Healthcare": "#ef4444",
  "Travel": "#06b6d4",
  "Education": "#84cc16",
  "Other": "#94a3b8"
}

export default function SpendingChart({ stats }) {
  const pieData = stats.ai_by_category

  const allCategories = new Set([
    ...stats.ai_by_category.map(d => d.category),
    ...stats.rule_by_category.map(d => d.category)
  ])

  const comparisonData = Array.from(allCategories).map(cat => ({
    category: cat.replace("Food & Dining", "Food").replace("Entertainment", "Entertain"),
    AI: stats.ai_by_category.find(d => d.category === cat)?.amount || 0,
    Rule: stats.rule_by_category.find(d => d.category === cat)?.amount || 0,
  }))

  return (
    <div>
      <div className="card">
        <h2 className="card-title">Spending by Category (AI)</h2>
        {pieData.length === 0 ? (
          <p className="empty-state">No data yet</p>
        ) : (
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie
                data={pieData}
                dataKey="amount"
                nameKey="category"
                cx="50%"
                cy="50%"
                innerRadius={65}
                outerRadius={100}
                paddingAngle={3}
              >
                {pieData.map((entry, i) => (
                  <Cell key={i} fill={COLORS[entry.category] || "#94a3b8"} />
                ))}
              </Pie>
              <Tooltip formatter={(v) => `$${v.toFixed(2)}`} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        )}
      </div>

      <div className="card" style={{ marginTop: "16px" }}>
        <h2 className="card-title">AI vs Rule-Based Comparison</h2>
        {comparisonData.length === 0 ? (
          <p className="empty-state">No data yet</p>
        ) : (
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={comparisonData} margin={{ top: 5, right: 10, left: 0, bottom: 60 }}>
              <XAxis dataKey="category" angle={-35} textAnchor="end" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip formatter={(v) => `$${v.toFixed(2)}`} />
              <Legend />
              <Bar dataKey="AI" fill="#4f46e5" radius={[4, 4, 0, 0]} />
              <Bar dataKey="Rule" fill="#cbd5e1" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  )
}
