import { useState, useEffect } from "react";
import { User, Mail, Shield, Calendar, Lock, CheckCircle2, AlertCircle, Save } from "lucide-react";
import styles from "./Profile.module.css";
import { getProfile, updateProfile, changePassword } from "../../services/userService";

function Profile() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("general");

  // Profile Form
  const [formData, setFormData] = useState({ name: "", phone: "" });
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState("");
  const [profileError, setProfileError] = useState("");

  // Password Form
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState("");
  const [passwordError, setPasswordError] = useState("");

  useEffect(() => {
    let cancelled = false;
    const fetchUser = async () => {
      try {
        const res = await getProfile();
        const data = res.data?.data || res.data || {};
        if (!cancelled) {
          setUser(data);
          setFormData({
            name: data.name || "",
            phone: data.phone || "",
          });
        }
      } catch (err) {
        if (!cancelled) {
          console.error("Failed to load profile:", err);
          const cached = JSON.parse(localStorage.getItem("user") || "null");
          if (cached) {
            setUser(cached);
            setFormData({ name: cached.name || "", phone: cached.phone || "" });
          }
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchUser();
    return () => {
      cancelled = true;
    };
  }, []);

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setProfileSaving(true);
    setProfileSuccess("");
    setProfileError("");

    try {
      const res = await updateProfile({
        name: formData.name,
        phone: formData.phone,
      });
      const updated = res.data?.data || res.data;
      setUser(updated);
      // Update local storage user
      const cached = JSON.parse(localStorage.getItem("user") || "{}");
      localStorage.setItem("user", JSON.stringify({ ...cached, ...updated }));
      setProfileSuccess("Personal profile updated successfully.");
    } catch (err) {
      setProfileError(err.response?.data?.message || "Failed to update profile.");
    } finally {
      setProfileSaving(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setPasswordSaving(true);
    setPasswordSuccess("");
    setPasswordError("");

    if (passwordData.newPassword.length < 6) {
      setPasswordError("New password must be at least 6 characters.");
      setPasswordSaving(false);
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordError("New password and confirmation do not match.");
      setPasswordSaving(false);
      return;
    }

    try {
      await changePassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      });
      setPasswordSuccess("Account password changed successfully.");
      setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } catch (err) {
      setPasswordError(err.response?.data?.message || "Failed to change password.");
    } finally {
      setPasswordSaving(false);
    }
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <div style={{ padding: "40px", textAlign: "center", color: "#64748b" }}>
          Loading profile...
        </div>
      </div>
    );
  }

  const creationDate = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString("en-IN", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "Member";

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.breadcrumb}>Account & Identity</div>
        <h1>Profile Overview</h1>
        <p>Manage your personal credentials, contact details, and account security.</p>
      </header>

      {/* User Card */}
      <div className={styles.overviewCard}>
        <div className={styles.userMain}>
          <div className={styles.avatar}>
            {user?.name ? user.name.charAt(0).toUpperCase() : "U"}
          </div>
          <div className={styles.userMeta}>
            <h2>{user?.name || "Fleet User"}</h2>
            <div className={styles.userEmail}>
              <Mail size={14} />
              <span>{user?.email || "user@transitops.internal"}</span>
            </div>
            <span className={styles.roleBadge}>{user?.role || "Fleet Manager"}</span>
          </div>
        </div>

        <div className={styles.tenureMeta}>
          <Calendar size={15} />
          <span>Member since {creationDate}</span>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className={styles.tabs}>
        <button
          type="button"
          className={`${styles.tab} ${activeTab === "general" ? styles.activeTab : ""}`}
          onClick={() => setActiveTab("general")}
        >
          <User size={16} />
          <span>General Info</span>
        </button>
        <button
          type="button"
          className={`${styles.tab} ${activeTab === "security" ? styles.activeTab : ""}`}
          onClick={() => setActiveTab("security")}
        >
          <Lock size={16} />
          <span>Password & Security</span>
        </button>
      </div>

      {/* General Tab */}
      {activeTab === "general" && (
        <div className={styles.formCard}>
          <div className={styles.sectionHeader}>
            <h3>Personal Information</h3>
            <p>Update your display name and registered phone number.</p>
          </div>

          {profileSuccess && (
            <div className={styles.notice}>
              <CheckCircle2 size={16} />
              <span>{profileSuccess}</span>
            </div>
          )}

          {profileError && (
            <div className={styles.errorBanner}>
              <AlertCircle size={16} />
              <span>{profileError}</span>
            </div>
          )}

          <form onSubmit={handleProfileSubmit}>
            <div className={styles.formGrid}>
              <div className={styles.field}>
                <label>Full Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>

              <div className={styles.field}>
                <label>Phone Number</label>
                <input
                  type="tel"
                  placeholder="+91 98765 43210"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
              </div>

              <div className={styles.field}>
                <label>Email Address</label>
                <input type="email" value={user?.email || ""} disabled />
                <span className={styles.helpText}>Email cannot be changed directly for audit integrity.</span>
              </div>

              <div className={styles.field}>
                <label>Assigned System Role</label>
                <input type="text" value={user?.role || "Driver"} disabled />
                <span className={styles.helpText}>Role permissions are controlled by organization administrators.</span>
              </div>
            </div>

            <button type="submit" className={styles.saveButton} disabled={profileSaving}>
              <Save size={16} />
              <span>{profileSaving ? "Saving..." : "Save Changes"}</span>
            </button>
          </form>
        </div>
      )}

      {/* Security Tab */}
      {activeTab === "security" && (
        <div className={styles.formCard}>
          <div className={styles.sectionHeader}>
            <h3>Change Password</h3>
            <p>Ensure your account remains safe by using a strong password with at least 6 characters.</p>
          </div>

          {passwordSuccess && (
            <div className={styles.notice}>
              <CheckCircle2 size={16} />
              <span>{passwordSuccess}</span>
            </div>
          )}

          {passwordError && (
            <div className={styles.errorBanner}>
              <AlertCircle size={16} />
              <span>{passwordError}</span>
            </div>
          )}

          <form onSubmit={handlePasswordSubmit}>
            <div className={styles.formGrid}>
              <div className={`${styles.field} ${styles.fullWidth}`}>
                <label>Current Password</label>
                <input
                  type="password"
                  value={passwordData.currentPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                  required
                />
              </div>

              <div className={styles.field}>
                <label>New Password</label>
                <input
                  type="password"
                  value={passwordData.newPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                  required
                />
              </div>

              <div className={styles.field}>
                <label>Confirm New Password</label>
                <input
                  type="password"
                  value={passwordData.confirmPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                  required
                />
              </div>
            </div>

            <button type="submit" className={styles.saveButton} disabled={passwordSaving}>
              <Shield size={16} />
              <span>{passwordSaving ? "Updating Password..." : "Update Password"}</span>
            </button>
          </form>
        </div>
      )}
    </div>
  );
}

export default Profile;
