import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const data = [
  { vehicle: "Van-01", efficiency: 14, cost: 12000 },
  { vehicle: "Truck-02", efficiency: 9, cost: 18500 },
  { vehicle: "Van-03", efficiency: 16, cost: 9500 },
  { vehicle: "Truck-04", efficiency: 8, cost: 21000 },
];

function Reports() {
  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-bold">Reports & Analytics</h1>

      <p className="text-gray-500 mb-6">
        Monitor fleet performance and operational costs
      </p>

      <div className="grid grid-cols-4 gap-4 mb-6">
        <Card title="Fleet Utilization" value="78%" />
        <Card title="Fuel Efficiency" value="12.4 km/L" />
        <Card title="Operational Cost" value="₹61,000" />
        <Card title="Average ROI" value="18.5%" />
      </div>

      <div className="bg-white p-6 rounded-xl shadow">
        <h2 className="text-xl font-bold mb-5">
          Vehicle Fuel Efficiency
        </h2>

        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data}>
              <XAxis dataKey="vehicle" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="efficiency" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

function Card({ title, value }) {
  return (
    <div className="bg-white p-5 rounded-xl shadow">
      <p className="text-gray-500">{title}</p>
      <h2 className="text-2xl font-bold mt-2">{value}</h2>
    </div>
  );
}

export default Reports;