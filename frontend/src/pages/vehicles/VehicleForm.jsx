import { useState } from "react";

function VehicleForm({ onAdd, onClose }) {
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

    onAdd({
      ...form,
      id: Date.now(),
      capacity: Number(form.capacity),
      odometer: Number(form.odometer),
    });

    onClose();
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white p-5 rounded-xl shadow mb-6 grid grid-cols-2 gap-4"
    >
      <input
        required
        placeholder="Registration Number"
        className="border p-3 rounded-lg"
        onChange={(e) =>
          setForm({ ...form, registration: e.target.value })
        }
      />

      <input
        required
        placeholder="Vehicle Model"
        className="border p-3 rounded-lg"
        onChange={(e) => setForm({ ...form, model: e.target.value })}
      />

      <input
        placeholder="Vehicle Type"
        className="border p-3 rounded-lg"
        onChange={(e) => setForm({ ...form, type: e.target.value })}
      />

      <input
        type="number"
        placeholder="Capacity (kg)"
        className="border p-3 rounded-lg"
        onChange={(e) => setForm({ ...form, capacity: e.target.value })}
      />

      <input
        type="number"
        placeholder="Odometer"
        className="border p-3 rounded-lg"
        onChange={(e) => setForm({ ...form, odometer: e.target.value })}
      />

      <select
        className="border p-3 rounded-lg"
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
  );
}

export default VehicleForm;