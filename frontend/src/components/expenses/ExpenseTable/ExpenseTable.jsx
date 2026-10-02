import styles from "./ExpenseTable.module.css";

function ExpenseTable({ expenses = [], onDelete }) {
  return (
    <div className={styles.wrapper}>
      <table className={styles.table}>
        <thead>
          <tr>
            <th>Vehicle</th>
            <th>Expense Type</th>
            <th>Amount</th>
            <th>Date</th>
            <th>Actions</th>
          </tr>
        </thead>

        <tbody>
          {expenses.length > 0 ? (
            expenses.map((expense) => (
              <tr key={expense._id || expense.id}>
                <td>
                  {expense.vehicle?.name ||
                    expense.vehicleName ||
                    "Unknown Vehicle"}
                </td>

                <td>{expense.type || expense.expenseType || "-"}</td>

                <td>
                  ₹
                  {Number(expense.amount || 0).toLocaleString("en-IN")}
                </td>

                <td>
                  {expense.createdAt || expense.date
                    ? new Date(
                        expense.createdAt || expense.date
                      ).toLocaleDateString("en-IN")
                    : "-"}
                </td>

                <td>
                  <div className={styles.actions}>
                    <button
                      className={styles.delete}
                      onClick={() =>
                        onDelete(expense._id || expense.id)
                      }
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="5" className={styles.empty}>
                No expense records found.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

export default ExpenseTable;
