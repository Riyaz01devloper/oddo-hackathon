import { useState } from "react";
import { Plus, Fuel, IndianRupee } from "lucide-react";

function Expenses() {
  const [expenses, setExpenses] = useState([
    {
      id: 1,
      vehicle: "DL-01-AB-1234",
      type: "Fuel",
      amount: 3500,
      liters: 40,
      date: "2026-07-12",
    },
  ]);

  const [form, setForm] = useState({
    vehicle: "",
    type: "Fuel",
    amount: "",
    liters: "",
    date: "",
  });

  const [showForm, setShowForm] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();

    setExpenses([
      ...expenses,
      {
        ...form,
        id: Date.now(),
        amount: Number(form.amount),
        liters: Number(form.liters),
      },
    ]);

    setShowForm(false);
  };

  const totalExpense = expenses.reduce(
    (total, expense) => total + expense.amount,
    0
  );

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Fuel & Expenses</h1>
          <p className="text-gray-500">
            Track fleet operational expenses
          </p>
        </div>

        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg"
        >
          <Plus size={20} />
          Add Expense
        </button>
      </div>

      <div className="bg-white p-5 rounded-xl shadow mb-6">
        <p className="text-gray-500">Total Operational Cost</p>

        <h2 className="text-3xl font-bold flex items-center">
          <IndianRupee size={26} />
          {totalExpense.toLocaleString()}
        </h2>
      </div>

      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="bg-white p-5 rounded-xl shadow mb-6 grid grid-cols-2 gap-4"
        >
          <input
            required
            placeholder="Vehicle Registration"
            className="border p-3 rounded-lg"
            onChange={(e) =>
              setForm({ ...form, vehicle: e.target.value })
            }
          />

          <select
            className="border p-3 rounded-lg"
            onChange={(e) =>
              setForm({ ...form, type: e.target.value })
            }
          >
            <option>Fuel</option>
            <option>Maintenance</option>
            <option>Toll</option>
            <option>Other</option>
          </select>

          <input
            required
            type="number"
            placeholder="Amount"
            className="border p-3 rounded-lg"
            onChange={(e) =>
              setForm({ ...form, amount: e.target.value })
            }
          />

          <input
            type="number"
            placeholder="Fuel Liters (if applicable)"
            className="border p-3 rounded-lg"
            onChange={(e) =>
              setForm({ ...form, liters: e.target.value })
            }
          />

          <input
            required
            type="date"
            className="border p-3 rounded-lg"
            onChange={(e) =>
              setForm({ ...form, date: e.target.value })
            }
          />

          <button className="bg-green-600 text-white p-3 rounded-lg">
            Save Expense
          </button>
        </form>
      )}

      <div className="bg-white rounded-xl shadow overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-4">Vehicle</th>
              <th>Type</th>
              <th>Amount</th>
              <th>Fuel</th>
              <th>Date</th>
            </tr>
          </thead>

          <tbody>
            {expenses.map((expense) => (
              <tr key={expense.id} className="border-t">
                <td className="p-4">{expense.vehicle}</td>

                <td className="flex items-center gap-2 py-4">
                  {expense.type === "Fuel" && <Fuel size={18} />}
                  {expense.type}
                </td>

                <td>₹{expense.amount}</td>
                <td>{expense.liters || "-"} L</td>
                <td>{expense.date}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Expenses;