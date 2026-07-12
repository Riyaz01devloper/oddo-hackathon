import { useState } from "react";
import { Plus, Search, Truck } from "lucide-react";

const initialVehicles = [
  {
    id: 1,
    registration: "DL-01-AB-1234",
    model: "Tata Ace",
    type: "Mini Truck",
    capacity: 750,
    odometer: 24500,
    status: "Available",
  },
  {
    id: 2,
    registration: "DL-02-CD-5678",
    model: "Mahindra Bolero",
    type: "Pickup",
    capacity: 1200,
    odometer: 18200,
    status: "On Trip",
  },
];

function Vehicles() {
  const [vehicles, setVehicles] = useState(initialVehicles);
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);

  const [form, setForm] = useState({
    registration: "",
    model: "",
    type: "",
    capacity: "",
    odometer: "",
    status: "Available",
  });

  const handleSubmit = (e) => {
    e.preventDefault();

    setVehicles([
      ...vehicles,
      {
        ...form,
        id: Date.now(),
        capacity: Number(form.capacity),
        odometer: Number(form.odometer),
      },
    ]);

    setForm({
      registration: "",
      model: "",
      type: "",
      capacity: "",
      odometer: "",
      status: "Available",
    });

    setShowForm(false);
  };

  const filteredVehicles = vehicles.filter((vehicle) =>
    vehicle.registration.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Vehicles</h1>
          <p className="text-gray-500">Manage your fleet vehicles</p>
        </div>

        <button
          onClick={() => setShowForm(!showForm)}
          className="flex gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg"
        >
          <Plus size={20} />
          Add Vehicle
        </button>
      </div>

      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="bg-white p-5 rounded-xl shadow mb-6 grid grid-cols-2 gap-4"
        >
          <input
            required
            placeholder="Registration Number"
            className="border p-3 rounded-lg"
            value={form.registration}
            onChange={(e) =>
              setForm({ ...form, registration: e.target.value })
            }
          />

          <input
            required
            placeholder="Vehicle Model"
            className="border p-3 rounded-lg"
            value={form.model}
            onChange={(e) => setForm({ ...form, model: e.target.value })}
          />

          <input
            placeholder="Vehicle Type"
            className="border p-3 rounded-lg"
            value={form.type}
            onChange={(e) => setForm({ ...form, type: e.target.value })}
          />

          <input
            type="number"
            placeholder="Maximum Capacity (kg)"
            className="border p-3 rounded-lg"
            value={form.capacity}
            onChange={(e) => setForm({ ...form, capacity: e.target.value })}
          />

          <input
            type="number"
            placeholder="Odometer"
            className="border p-3 rounded-lg"
            value={form.odometer}
            onChange={(e) => setForm({ ...form, odometer: e.target.value })}
          />

          <select
            className="border p-3 rounded-lg"
            value={form.status}
            onChange={(e) => setForm({ ...form, status: e.target.value })}
          >
            <option>Available</option>
            <option>On Trip</option>
            <option>In Shop</option>
            <option>Retired</option>
          </select>

          <button className="bg-green-600 text-white p-3 rounded-lg">
            Save Vehicle
          </button>
        </form>
      )}

      <div className="bg-white rounded-xl shadow">
        <div className="p-4 flex items-center gap-2 border-b">
          <Search size={20} />
          <input
            placeholder="Search registration number..."
            className="outline-none w-full"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <table className="w-full text-left">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-4">Vehicle</th>
              <th>Registration</th>
              <th>Type</th>
              <th>Capacity</th>
              <th>Status</th>
            </tr>
          </thead>

          <tbody>
            {filteredVehicles.map((vehicle) => (
              <tr key={vehicle.id} className="border-t">
                <td className="p-4 flex items-center gap-2">
                  <Truck size={20} />
                  {vehicle.model}
                </td>
                <td>{vehicle.registration}</td>
                <td>{vehicle.type}</td>
                <td>{vehicle.capacity} kg</td>
                <td>
                  <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full">
                    {vehicle.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Vehicles;