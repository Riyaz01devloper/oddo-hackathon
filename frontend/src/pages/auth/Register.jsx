import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../../services/api";

function Register() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "Driver",
  });

  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      await api.post("/users/register", form);
      navigate("/login");
    } catch (err) {
      setError(
        err.response?.data?.message || "Registration failed"
      );
    }
  };

  return (
    <div style={styles.page}>
      <form style={styles.form} onSubmit={handleSubmit}>
        <h1>Register</h1>

        {error && <p style={styles.error}>{error}</p>}

        <input
          style={styles.input}
          placeholder="Name"
          onChange={(e) =>
            setForm({ ...form, name: e.target.value })
          }
          required
        />

        <input
          style={styles.input}
          type="email"
          placeholder="Email"
          onChange={(e) =>
            setForm({ ...form, email: e.target.value })
          }
          required
        />

        <input
          style={styles.input}
          type="password"
          placeholder="Strong Password"
          onChange={(e) =>
            setForm({ ...form, password: e.target.value })
          }
          required
        />

        <select
          style={styles.input}
          value={form.role}
          onChange={(e) =>
            setForm({ ...form, role: e.target.value })
          }
        >
          <option>Fleet Manager</option>
          <option>Driver</option>
          <option>Safety Officer</option>
          <option>Financial Analyst</option>
        </select>

        <button style={styles.button} type="submit">
          Register
        </button>

        <p>
          Already registered?{" "}
          <Link to="/login">Login</Link>
        </p>
      </form>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    background: "#f4f6f8",
  },
  form: {
    width: "350px",
    padding: "30px",
    background: "white",
    borderRadius: "12px",
    display: "flex",
    flexDirection: "column",
    gap: "15px",
    boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
  },
  input: {
    padding: "12px",
    fontSize: "16px",
  },
  button: {
    padding: "12px",
    cursor: "pointer",
    background: "#2563eb",
    color: "white",
    border: "none",
    borderRadius: "6px",
  },
  error: {
    color: "red",
  },
};

export default Register;