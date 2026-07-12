function StatusBadge({ status }) {
  const styles = {
    Available: "bg-green-100 text-green-700",
    "On Trip": "bg-blue-100 text-blue-700",
    "In Shop": "bg-orange-100 text-orange-700",
    Retired: "bg-gray-200 text-gray-700",
    Draft: "bg-gray-100 text-gray-700",
    Dispatched: "bg-blue-100 text-blue-700",
    Completed: "bg-green-100 text-green-700",
    Cancelled: "bg-red-100 text-red-700",
  };

  return (
    <span
      className={`px-3 py-1 rounded-full text-sm ${
        styles[status] || "bg-gray-100"
      }`}
    >
      {status}
    </span>
  );
}

export default StatusBadge;