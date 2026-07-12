import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import styles from "./Login.module.css";

const initialForm = {
  email: "",
  password: "",
  rememberMe: false,
};

function Login() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState(initialForm);
  const [errors, setErrors] = useState({});

  function handleChange(e) {
    const { name, value, type, checked } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  }

  function validate() {
    const validationErrors = {};

    if (!formData.email.trim()) {
      validationErrors.email = "Email is required.";
    }

    if (!formData.password.trim()) {
      validationErrors.password = "Password is required.";
    }

    setErrors(validationErrors);

    return Object.keys(validationErrors).length === 0;
  }

  function handleSubmit(e) {
    e.preventDefault();

    if (!validate()) return;

    // TODO: POST /login

    navigate("/");
  }

  return (
    <div className={styles.page}>
      <div className={styles.left}>
        <div className={styles.brand}>
          <h1>TransitOps</h1>

          <p>Smart Transport Operations Platform</p>

          <div className={styles.roles}>
            <h3>Available Roles</h3>

            <ul>
              <li>Fleet Manager</li>
              <li>Driver</li>
              <li>Safety Officer</li>
              <li>Financial Analyst</li>
            </ul>
          </div>
        </div>
      </div>

      <div className={styles.right}>
        <div className={styles.card}>
          <h2>Sign In</h2>

          <form onSubmit={handleSubmit}>
            <div className={styles.group}>
              <label>Email Address</label>

              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
              />

              {errors.email && (
                <span className={styles.error}>{errors.email}</span>
              )}
            </div>

            <div className={styles.group}>
              <label>Password</label>

              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
              />

              {errors.password && (
                <span className={styles.error}>{errors.password}</span>
              )}
            </div>

            <label className={styles.checkbox}>
              <input
                type="checkbox"
                name="rememberMe"
                checked={formData.rememberMe}
                onChange={handleChange}
              />

              Remember Me
            </label>

            <button
              type="submit"
              className={styles.button}
            >
              Sign In
            </button>
          </form>

          <p className={styles.footer}>
            Don't have an account?{" "}
            <Link to="/register">Register</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Login;