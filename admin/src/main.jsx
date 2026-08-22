import { useState } from "react";
import ReactDOM from "react-dom/client";
import axios from "axios";
import AdminDashboard from "../../frontend/src/admin/AdminDashboard";
import "./styles.css";

const API = import.meta.env.VITE_API_URL || "https://ecommerce-web-application-zjmw.onrender.com/api";

function Login({ onLogin }) {
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");

  const submit = async event => {
    event.preventDefault();
    setError("");
    try {
      const response = await axios.post(`${API}/auth/login`, form);
      if (response.data.user.role !== "admin") {
        setError("This account does not have admin access");
        return;
      }
      localStorage.setItem("adminToken", response.data.token);
      onLogin(response.data.token);
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Login failed");
    }
  };

  return <main className="login-shell">
    <form className="login-card" onSubmit={submit}>
      <p className="eyebrow">SHOPNEST ADMIN</p>
      <h1>Manage your store</h1>
      <p className="muted">Sign in to manage products and order status.</p>
      <input required type="email" placeholder="Admin email" value={form.email} onChange={event => setForm({ ...form, email: event.target.value })} />
      <input required type="password" placeholder="Password" value={form.password} onChange={event => setForm({ ...form, password: event.target.value })} />
      {error && <div className="error">{error}</div>}
      <button>Sign in</button>
    </form>
  </main>;
}

function AdminApp() {
  const [token, setToken] = useState(() => localStorage.getItem("adminToken") || "");

  if (!token) return <Login onLogin={setToken} />;

  const logout = () => {
    localStorage.removeItem("adminToken");
    setToken("");
  };

  return <>
    <header className="admin-header">
      <div className="admin-brand">
        <strong>ShopNest Admin</strong>
        <nav className="admin-nav" aria-label="Admin navigation">
          <a href="#dashboard">Dashboard</a>
          <a href="#products">Products</a>
          <a href="#add-product">Add Product</a>
          <a href="#orders">Orders</a>
        </nav>
      </div>
      <button className="secondary" onClick={logout}>Sign out</button>
    </header>
    <AdminDashboard API={API} token={token} onLogout={logout} />
  </>;
}

ReactDOM.createRoot(document.getElementById("root")).render(<AdminApp />);
