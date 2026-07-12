import { useState } from "react";

function DriverForm({ onAdd, onClose }) {
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

    onAdd({
      ...form,
      id: Date.now(),
      safetyScore: Number(form.safetyScore),
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
  );
}

export default DriverForm;