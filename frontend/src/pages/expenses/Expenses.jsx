import { useState } from "react";

function Expenses() {
  const [expenses] = useState([
    { id: 1, type: "Fuel", amount: 5000, date: "2026-07-12" },
    { id: 2, type: "Maintenance", amount: 8500, date: "2026-07-11" },
  ]);

  return (
    <main style={styles.page}>
      <h1>Expenses</h1>
      <p>Track and manage fleet expenses.</p>

      <div style={styles.grid}>
        {expenses.map((expense) => (
          <div key={expense.id} style={styles.card}>
            <h3>{expense.type}</h3>
            <h2>₹{expense.amount.toLocaleString()}</h2>
            <p>{expense.date}</p>
          </div>
        ))}
      </div>
    </main>
  );
}

const styles = {
  page: { padding: "30px" },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
    gap: "20px",
    marginTop: "25px",
  },
  card: {
    padding: "20px",
    background: "white",
    borderRadius: "12px",
    boxShadow: "0 2px 10px rgba(0,0,0,0.08)",
  },
};

export default Expenses;