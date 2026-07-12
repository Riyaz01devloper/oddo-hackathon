import { useState } from "react";
import { Plus, MapPin } from "lucide-react";

const initialTrips = [
  {
    id: 1,
    source: "Delhi",
    destination: "Jaipur",
    vehicle: "DL-01-AB-1234",
    driver: "Alex Kumar",
    cargo: 450,
    distance: 280,
    status: "Dispatched",
  },
];

function Trips() {
  const [trips, setTrips] = useState(initialTrips);
  const [showForm, setShowForm] = useState(false);

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

    setTrips([
      ...trips,
      {
        ...form,
        id: Date.now(),
        status: "Draft",
      },
    ]);

    setShowForm(false);
  };

  const updateStatus = (id, status) => {
    setTrips(
      trips.map((trip) =>
        trip.id === id ? { ...trip, status } : trip
      )
    );
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="flex justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">Trips</h1>
          <p className="text-gray-500">Manage transport operations</p>
        </div>

        <button
          onClick={() => setShowForm(!showForm)}
          className="flex gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg"
        >
          <Plus size={20} />
          Create Trip
        </button>
      </div>

      {showForm && (
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
          </select>

          <select
            required
            className="border p-3 rounded-lg"
            onChange={(e) => setForm({ ...form, driver: e.target.value })}
          >
            <option value="">Select Driver</option>
            <option>Alex Kumar</option>
          </select>

          <input
            type="number"
            placeholder="Cargo Weight (kg)"
            className="border p-3 rounded-lg"
            onChange={(e) => setForm({ ...form, cargo: e.target.value })}
          />

          <input
            type="number"
            placeholder="Planned Distance (km)"
            className="border p-3 rounded-lg"
            onChange={(e) => setForm({ ...form, distance: e.target.value })}
          />

          <button className="bg-green-600 text-white p-3 rounded-lg">
            Create Trip
          </button>
        </form>
      )}

      <div className="grid gap-4">
        {trips.map((trip) => (
          <div
            key={trip.id}
            className="bg-white p-5 rounded-xl shadow flex justify-between"
          >
            <div>
              <div className="flex items-center gap-2 text-xl font-semibold">
                <MapPin />
                {trip.source} → {trip.destination}
              </div>

              <p className="text-gray-500 mt-2">
                Vehicle: {trip.vehicle}
              </p>

              <p className="text-gray-500">
                Driver: {trip.driver}
              </p>

              <p>
                Cargo: {trip.cargo} kg | Distance: {trip.distance} km
              </p>
            </div>

            <div className="flex flex-col gap-2">
              <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full">
                {trip.status}
              </span>

              {trip.status === "Draft" && (
                <button
                  onClick={() => updateStatus(trip.id, "Dispatched")}
                  className="bg-blue-600 text-white px-3 py-2 rounded"
                >
                  Dispatch
                </button>
              )}

              {trip.status === "Dispatched" && (
                <button
                  onClick={() => updateStatus(trip.id, "Completed")}
                  className="bg-green-600 text-white px-3 py-2 rounded"
                >
                  Complete
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Trips;