import {
//   LayoutDashboard,
  Truck,
  Users,
  Route,
  Wrench,
  TrendingUp,
} from "lucide-react";
// const links = [
// //   {
// //     name: "Dashboard",
// //     path: "/dashboard",
// //     icon: LayoutDashboard,
// //   },
//   { name: "Vehicles", path: "/vehicles", icon: Truck },
//   { name: "Drivers", path: "/drivers", icon: Users },
//   { name: "Trips", path: "/trips", icon: Route },
//   {
//     name: "Maintenance",
//     path: "/maintenance",
//     icon: Wrench,
//   },
//   { name: "Expenses", path: "/expenses", icon: Fuel },
//   { name: "Reports", path: "/reports", icon: BarChart3 },
// ];
const stats = [
  { title: "Active Vehicles", value: "24", icon: Truck },
  { title: "Available Vehicles", value: "12", icon: Truck },
  { title: "Active Trips", value: "8", icon: Route },
  { title: "Drivers On Duty", value: "15", icon: Users },
  { title: "In Maintenance", value: "4", icon: Wrench },
  { title: "Fleet Utilization", value: "78%", icon: TrendingUp },
];

function Dashboard() {
  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-gray-500">
          Overview of your transport operations
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {stats.map(({ title, value, icon: Icon }) => (
          <div
            key={title}
            className="bg-white p-6 rounded-xl shadow"
          >
            <div className="flex justify-between items-center">
              <div>
                <p className="text-gray-500">{title}</p>
                <h2 className="text-3xl font-bold mt-2">{value}</h2>
              </div>

              <div className="bg-blue-100 p-3 rounded-xl">
                <Icon className="text-blue-600" size={28} />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-6 mt-6">
        <div className="bg-white p-6 rounded-xl shadow">
          <h2 className="text-xl font-bold mb-4">Recent Trips</h2>

          <div className="space-y-4">
            <Trip route="Delhi → Jaipur" status="Dispatched" />
            <Trip route="Noida → Agra" status="Completed" />
            <Trip route="Delhi → Chandigarh" status="Draft" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow">
          <h2 className="text-xl font-bold mb-4">
            Fleet Status
          </h2>

          <Status label="Available" value="12" />
          <Status label="On Trip" value="8" />
          <Status label="In Shop" value="4" />
        </div>
      </div>
    </div>
  );
}

function Trip({ route, status }) {
  return (
    <div className="flex justify-between border-b pb-3">
      <span>{route}</span>
      <span className="text-blue-600">{status}</span>
    </div>
  );
}

function Status({ label, value }) {
  return (
    <div className="flex justify-between border-b py-3">
      <span>{label}</span>
      <span className="font-bold">{value}</span>
    </div>
  );
}

export default Dashboard;