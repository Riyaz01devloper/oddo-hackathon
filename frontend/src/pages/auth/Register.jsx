import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import styles from "./Register.module.css";

const initialForm = {
  name: "",
  email: "",
  password: "",
  role: "",
};

function Register() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState(initialForm);
  const [errors, setErrors] = useState({});

  function handleChange(e) {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  function validate() {
    const validationErrors = {};

    if (!formData.name.trim()) {
      validationErrors.name = "Full name is required.";
    }

    if (!formData.email.trim()) {
      validationErrors.email = "Email is required.";
    }

    if (!formData.password.trim()) {
      validationErrors.password = "Password is required.";
    }

    if (!formData.role) {
      validationErrors.role = "Role is required.";
    }

    setErrors(validationErrors);

    return Object.keys(validationErrors).length === 0;
  }

  function handleSubmit(e) {
    e.preventDefault();

    if (!validate()) return;

    // TODO: POST /register

    navigate("/login");
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
          <h2>Create Account</h2>

          <form onSubmit={handleSubmit}>
            <div className={styles.group}>
              <label>Full Name</label>

              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
              />

              {errors.name && (
                <span className={styles.error}>
                  {errors.name}
                </span>
              )}
            </div>

            <div className={styles.group}>
              <label>Email Address</label>

              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
              />

              {errors.email && (
                <span className={styles.error}>
                  {errors.email}
                </span>
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
                <span className={styles.error}>
                  {errors.password}
                </span>
              )}
            </div>

            <div className={styles.group}>
              <label>Role</label>

              <select
                name="role"
                value={formData.role}
                onChange={handleChange}
              >
                <option value="">Select Role</option>
                <option>Fleet Manager</option>
                <option>Driver</option>
                <option>Safety Officer</option>
                <option>Financial Analyst</option>
              </select>

              {errors.role && (
                <span className={styles.error}>
                  {errors.role}
                </span>
              )}
            </div>

            <button
              type="submit"
              className={styles.button}
            >
              Create Account
            </button>
          </form>

          <p className={styles.footer}>
            Already have an account?{" "}
            <Link to="/login">Login</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Register;