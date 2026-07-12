import { MapPin, Truck, User } from "lucide-react";

function TripDetails({ trip, onStatusChange }) {
  return (
    <div className="bg-white p-5 rounded-xl shadow">
      <div className="flex justify-between">
        <div>
          <h2 className="text-xl font-bold flex items-center gap-2">
            <MapPin size={20} />
            {trip.source} → {trip.destination}
          </h2>

          <p className="flex items-center gap-2 mt-3 text-gray-600">
            <Truck size={18} />
            {trip.vehicle}
          </p>

          <p className="flex items-center gap-2 text-gray-600">
            <User size={18} />
            {trip.driver}
          </p>

          <p className="mt-2">
            Cargo: {trip.cargo} kg | Distance: {trip.distance} km
          </p>
        </div>

        <div className="flex flex-col gap-3">
          <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-center">
            {trip.status}
          </span>

          {trip.status === "Draft" && (
            <button
              onClick={() => onStatusChange(trip.id, "Dispatched")}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg"
            >
              Dispatch
            </button>
          )}

          {trip.status === "Dispatched" && (
            <button
              onClick={() => onStatusChange(trip.id, "Completed")}
              className="bg-green-600 text-white px-4 py-2 rounded-lg"
            >
              Complete
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default TripDetails;