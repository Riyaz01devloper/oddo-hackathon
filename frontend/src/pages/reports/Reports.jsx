function Reports() {
  const stats = [
    { title: "Fleet Utilization", value: "87%" },
    { title: "Fuel Efficiency", value: "12.4 km/L" },
    { title: "Operational Cost", value: "₹61,000" },
    { title: "Average ROI", value: "18.5%" },
  ];

  return (
    <main style={styles.page}>
      <h1>Reports & Analytics</h1>
      <p>Monitor fleet performance and operational costs.</p>

      <div style={styles.grid}>
        {stats.map((stat) => (
          <div key={stat.title} style={styles.card}>
            <p>{stat.title}</p>
            <h2>{stat.value}</h2>
          </div>
        ))}
      </div>

      <div style={styles.report}>
        <h2>Fleet Performance Summary</h2>
        <p>
          View vehicle utilization, fuel efficiency and overall
          operational performance.
        </p>
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
    background: "white",
    padding: "25px",
    borderRadius: "12px",
    boxShadow: "0 2px 10px rgba(0,0,0,0.08)",
  },
  report: {
    background: "white",
    marginTop: "30px",
    padding: "25px",
    borderRadius: "12px",
  },
};

export default Reports;