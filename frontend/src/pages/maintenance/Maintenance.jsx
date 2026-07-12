import { useState } from "react";
import { Plus, Wrench } from "lucide-react";

function Maintenance() {
  const [records, setRecords] = useState([
    {
      id: 1,
      vehicle: "DL-01-AB-1234",
      service: "Oil Change",
      cost: 2500,
      status: "Active",
    },
  ]);

  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    vehicle: "",
    service: "",
    cost: "",
  });

  const handleSubmit = (e) => {
    e.preventDefault();

    setRecords([
      ...records,
      {
        ...form,
        id: Date.now(),
        cost: Number(form.cost),
        status: "Active",
      },
    ]);

    setShowForm(false);
  };

  const closeMaintenance = (id) => {
    setRecords(
      records.map((record) =>
        record.id === id
          ? { ...record, status: "Completed" }
          : record
      )
    );
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="flex justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">Maintenance</h1>
          <p className="text-gray-500">
            Manage vehicle maintenance
          </p>
        </div>

        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg flex gap-2"
        >
          <Plus size={20} />
          Add Maintenance
        </button>
      </div>

      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="bg-white p-5 rounded-xl shadow mb-6 grid grid-cols-3 gap-4"
        >
          <input
            required
            placeholder="Vehicle Registration"
            className="border p-3 rounded-lg"
            onChange={(e) =>
              setForm({ ...form, vehicle: e.target.value })
            }
          />

          <input
            required
            placeholder="Service Type"
            className="border p-3 rounded-lg"
            onChange={(e) =>
              setForm({ ...form, service: e.target.value })
            }
          />

          <input
            type="number"
            placeholder="Cost"
            className="border p-3 rounded-lg"
            onChange={(e) =>
              setForm({ ...form, cost: e.target.value })
            }
          />

          <button className="bg-green-600 text-white p-3 rounded-lg">
            Create Record
          </button>
        </form>
      )}

      <div className="grid gap-4">
        {records.map((record) => (
          <div
            key={record.id}
            className="bg-white p-5 rounded-xl shadow flex justify-between"
          >
            <div>
              <h2 className="font-bold text-lg flex gap-2">
                <Wrench />
                {record.service}
              </h2>

              <p className="text-gray-500">
                Vehicle: {record.vehicle}
              </p>

              <p>Cost: ₹{record.cost}</p>
            </div>

            <div>
              <p className="mb-3">{record.status}</p>

              {record.status === "Active" && (
                <button
                  onClick={() => closeMaintenance(record.id)}
                  className="bg-green-600 text-white px-4 py-2 rounded"
                >
                  Close Maintenance
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Maintenance;