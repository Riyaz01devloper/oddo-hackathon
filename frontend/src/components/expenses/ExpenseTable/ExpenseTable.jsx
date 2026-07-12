import styles from "./ExpenseTable.module.css";

function ExpenseTable({ expenses, onEdit, onDelete }) {
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
              <tr key={expense.id}>
                <td>{expense.vehicleName}</td>

                <td>{expense.expenseType}</td>

                <td>₹{expense.amount.toLocaleString()}</td>

                <td>{expense.date}</td>

                <td>
                  <div className={styles.actions}>
                    <button
                      className={styles.edit}
                      onClick={() => onEdit(expense)}
                    >
                      Edit
                    </button>

                    <button
                      className={styles.delete}
                      onClick={() => onDelete(expense.id)}
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