import { useState } from "react";
import { Plus, Search, User } from "lucide-react";

const initialDrivers = [
  {
    id: 1,
    name: "Alex Kumar",
    license: "DL123456",
    category: "Heavy",
    expiry: "2027-05-10",
    phone: "9876543210",
    safetyScore: 92,
    status: "Available",
  },
];

function Drivers() {
  const [drivers, setDrivers] = useState(initialDrivers);
  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState("");

  const [form, setForm] = useState({
    name: "",
    license: "",
    category: "",
    expiry: "",
    phone: "",
    safetyScore: "",
    status: "Available",
  });

  const handleSubmit = (e) => {
    e.preventDefault();

    setDrivers([
      ...drivers,
      {
        ...form,
        id: Date.now(),
      },
    ]);

    setShowForm(false);
  };

  const filteredDrivers = drivers.filter((driver) =>
    driver.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="flex justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">Drivers</h1>
          <p className="text-gray-500">Manage fleet drivers</p>
        </div>

        <button
          onClick={() => setShowForm(!showForm)}
          className="flex gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg"
        >
          <Plus size={20} />
          Add Driver
        </button>
      </div>

      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="bg-white p-5 rounded-xl shadow mb-6 grid grid-cols-2 gap-4"
        >
          <input
            required
            placeholder="Driver Name"
            className="border p-3 rounded-lg"
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />

          <input
            required
            placeholder="License Number"
            className="border p-3 rounded-lg"
            onChange={(e) => setForm({ ...form, license: e.target.value })}
          />

          <input
            placeholder="License Category"
            className="border p-3 rounded-lg"
            onChange={(e) => setForm({ ...form, category: e.target.value })}
          />

          <input
            type="date"
            className="border p-3 rounded-lg"
            onChange={(e) => setForm({ ...form, expiry: e.target.value })}
          />

          <input
            placeholder="Contact Number"
            className="border p-3 rounded-lg"
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
          />

          <input
            type="number"
            placeholder="Safety Score"
            className="border p-3 rounded-lg"
            onChange={(e) =>
              setForm({ ...form, safetyScore: e.target.value })
            }
          />

          <button className="bg-green-600 text-white p-3 rounded-lg">
            Save Driver
          </button>
        </form>
      )}

      <div className="bg-white rounded-xl shadow">
        <div className="p-4 flex gap-2 border-b">
          <Search />
          <input
            placeholder="Search driver..."
            className="outline-none"
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <table className="w-full text-left">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-4">Driver</th>
              <th>License</th>
              <th>Expiry</th>
              <th>Safety Score</th>
              <th>Status</th>
            </tr>
          </thead>

          <tbody>
            {filteredDrivers.map((driver) => (
              <tr key={driver.id} className="border-t">
                <td className="p-4 flex gap-2">
                  <User size={20} />
                  {driver.name}
                </td>
                <td>{driver.license}</td>
                <td>{driver.expiry}</td>
                <td>{driver.safetyScore}/100</td>
                <td>{driver.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Drivers;