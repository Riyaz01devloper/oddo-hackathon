import { Bell, User } from "lucide-react";

function Navbar() {
  return (
    <header className="h-16 bg-white border-b flex items-center justify-between px-6 sticky top-0 z-10">
      <div>
        <h2 className="font-semibold text-gray-800">
          Transport Operations
        </h2>
      </div>

      <div className="flex items-center gap-5">
        <button className="relative">
          <Bell size={22} />
          <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full" />
        </button>

        <div className="flex items-center gap-2">
          <div className="bg-gray-200 p-2 rounded-full">
            <User size={20} />
          </div>

          <div>
            <p className="text-sm font-semibold">Fleet Manager</p>
            <p className="text-xs text-gray-500">Admin</p>
          </div>
        </div>
      </div>
    </header>
  );
}

export default Navbar;