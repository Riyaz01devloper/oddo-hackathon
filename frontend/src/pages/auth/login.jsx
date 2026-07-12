import { useState } from "react";
import { useNavigate } from "react-router-dom";

function Login() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const handleSubmit = (e) => {
    e.preventDefault();

    localStorage.setItem("token", "demo-token");
    navigate("/dashboard");
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center">
      <form
        onSubmit={handleSubmit}
        className="bg-white w-full max-w-md p-8 rounded-2xl shadow"
      >
        <h1 className="text-3xl font-bold text-center">
          TransitOps
        </h1>

        <p className="text-gray-500 text-center mb-6">
          Sign in to manage your fleet
        </p>

        <input
          required
          type="email"
          placeholder="Email"
          className="w-full border p-3 rounded-lg mb-4"
          onChange={(e) =>
            setForm({ ...form, email: e.target.value })
          }
        />

        <input
          required
          type="password"
          placeholder="Password"
          className="w-full border p-3 rounded-lg mb-4"
          onChange={(e) =>
            setForm({ ...form, password: e.target.value })
          }
        />

        <button className="w-full bg-blue-600 text-white p-3 rounded-lg">
          Login
        </button>
      </form>
    </div>
  );
}

export default Login;