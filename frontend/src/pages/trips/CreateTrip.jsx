import { useState } from "react";

function CreateTrip({ onAdd, onClose }) {
  const [form, setForm] = useState({
    source: "",
    destination: "",
    vehicle: "",
    driver: "",
    cargo: "",
    distance: "",
  });

  const handleSubmit = (e) => {
    e.preventDefault();

    onAdd({
      ...form,
      id: Date.now(),
      cargo: Number(form.cargo),
      distance: Number(form.distance),
      status: "Draft",
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
        placeholder="Source"
        className="border p-3 rounded-lg"
        onChange={(e) => setForm({ ...form, source: e.target.value })}
      />

      <input
        required
        placeholder="Destination"
        className="border p-3 rounded-lg"
        onChange={(e) =>
          setForm({ ...form, destination: e.target.value })
        }
      />

      <select
        required
        className="border p-3 rounded-lg"
        onChange={(e) => setForm({ ...form, vehicle: e.target.value })}
      >
        <option value="">Select Vehicle</option>
        <option>DL-01-AB-1234</option>
        <option>DL-02-CD-5678</option>
      </select>

      <select
        required
        className="border p-3 rounded-lg"
        onChange={(e) => setForm({ ...form, driver: e.target.value })}
      >
        <option value="">Select Driver</option>
        <option>Alex Kumar</option>
        <option>Rahul Singh</option>
      </select>

      <input
        type="number"
        required
        placeholder="Cargo Weight (kg)"
        className="border p-3 rounded-lg"
        onChange={(e) => setForm({ ...form, cargo: e.target.value })}
      />

      <input
        type="number"
        required
        placeholder="Distance (km)"
        className="border p-3 rounded-lg"
        onChange={(e) => setForm({ ...form, distance: e.target.value })}
      />

      <button className="bg-green-600 text-white p-3 rounded-lg">
        Create Trip
      </button>
    </form>
  );
}

export default CreateTrip;