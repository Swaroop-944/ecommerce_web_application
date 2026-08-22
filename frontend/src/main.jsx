import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Link, Navigate, Route, Routes, useNavigate } from "react-router-dom";
import axios from "axios";
import "./styles.css";

const fallbackImage = "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80";
import "./admin.css";
import AdminDashboard from "./admin/AdminDashboard";

const API = import.meta.env.VITE_API_URL || "https://ecommerce-web-application-zjmw.onrender.com";
const StoreContext = createContext();

function StoreProvider({ children }) {
  const [user, setUser] = useState(() => JSON.parse(localStorage.getItem("user") || "null"));
  const [token, setToken] = useState(() => localStorage.getItem("token") || "");
  const [cart, setCart] = useState(() => JSON.parse(localStorage.getItem("cart") || "[]"));

  useEffect(() => localStorage.setItem("cart", JSON.stringify(cart)), [cart]);

  const auth = async (url, data) => {
    const res = await axios.post(`${API}/auth/${url}`, data);
    setUser(res.data.user);
    setToken(res.data.token);
    localStorage.setItem("user", JSON.stringify(res.data.user));
    localStorage.setItem("token", res.data.token);
  };

  const logout = () => {
    setUser(null); setToken("");
    localStorage.removeItem("user"); localStorage.removeItem("token");
  };

  const addToCart = (product) => {
    setCart(prev => {
      const found = prev.find(i => i.product === product._id);
      if (found) return prev.map(i => i.product === product._id ? { ...i, quantity: i.quantity + 1 } : i);
      return [...prev, { product: product._id, name: product.name, image: product.image, price: product.price, quantity: 1 }];
    });
  };

  const updateCart = (id, quantity) => {
    setCart(prev => prev.map(i => i.product === id ? { ...i, quantity: Math.max(1, quantity) } : i));
  };

  const removeFromCart = id => setCart(prev => prev.filter(i => i.product !== id));
  const cartTotal = useMemo(() => cart.reduce((sum, i) => sum + i.price * i.quantity, 0), [cart]);

  return (
    <StoreContext.Provider value={{ API, user, token, cart, cartTotal, auth, logout, addToCart, updateCart, removeFromCart, setCart }}>
      {children}
    </StoreContext.Provider>
  );
}

const useStore = () => useContext(StoreContext);

function Navbar() {
  const { user, logout, cart } = useStore();
  return (
    <nav className="navbar">
      <Link className="brand" to="/">ShopNest</Link>
      <div className="navlinks">
        <Link to="/">Products</Link>
        {user && <Link to="/orders">My Orders</Link>}
        {user?.role === "admin" && <Link to="/admin">Admin</Link>}
        <Link to="/cart">Cart ({cart.reduce((a, i) => a + i.quantity, 0)})</Link>
        {user ? (
          <button className="link-btn" onClick={logout}>Logout</button>
        ) : <Link to="/login">Login</Link>}
      </div>
    </nav>
  );
}

function Home() {
  const { API, addToCart } = useStore();
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [categories, setCategories] = useState(["All"]);

  const load = async () => {
    const [p, c] = await Promise.all([
      axios.get(`${API}/products`, { params: { search, category } }),
      axios.get(`${API}/products/categories`)
    ]);
    setProducts(p.data); setCategories(c.data);
  };

  useEffect(() => { load(); }, [search, category]);

  return (
    <div className="page">
      <section className="hero">
        <div>
          <p className="eyebrow">ONLINE STORE</p>
          <h1>Everything you need, delivered.</h1>
          <p>Browse quality products, add them to your cart and track your orders.</p>
        </div>
      </section>

      <div className="toolbar">
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search products..." />
        <select value={category} onChange={e => setCategory(e.target.value)}>
          {categories.map(c => <option key={c}>{c}</option>)}
        </select>
      </div>

      <div className="grid">
        {products.map(p => (
          <article className="card" key={p._id}>
            <img src={p.image || fallbackImage} alt={p.name} onError={event => { event.currentTarget.onerror = null; event.currentTarget.src = fallbackImage; }} />
            <div className="card-body">
              <span className="tag">{p.category}</span>
              <h3>{p.name}</h3>
              <div className="card-footer">
                <strong>₹{p.price.toLocaleString("en-IN")}</strong>
                <button disabled={p.stock === 0} onClick={() => addToCart(p)}>
                  {p.stock ? "Add to Cart" : "Out of Stock"}
                </button>
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}

function Login() {
  const { auth } = useStore();
  const nav = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");

  const submit = async e => {
    e.preventDefault();
    try { await auth("login", form); nav("/"); }
    catch (err) { setError(err.response?.data?.message || "Login failed"); }
  };

  return <AuthForm title="Welcome back" button="Login" form={form} setForm={setForm} submit={submit} error={error} extra={<p>New user? <Link to="/register">Create an account</Link></p>} />;
}

function Register() {
  const { auth } = useStore();
  const nav = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");

  const submit = async e => {
    e.preventDefault();
    try { await auth("register", form); nav("/"); }
    catch (err) { setError(err.response?.data?.message || "Registration failed"); }
  };

  return <AuthForm title="Create account" button="Register" form={form} setForm={setForm} submit={submit} error={error} register extra={<p>Already registered? <Link to="/login">Login</Link></p>} />;
}

function AuthForm({ title, button, form, setForm, submit, error, register, extra }) {
  return (
    <div className="auth-page">
      <form className="auth-card" onSubmit={submit}>
        <h2>{title}</h2>
        {register && <input placeholder="Full name" required value={form.name} onChange={e => setForm({...form, name: e.target.value})} />}
        <input type="email" placeholder="Email" required value={form.email} onChange={e => setForm({...form, email: e.target.value})} />
        <input type="password" placeholder="Password" minLength="6" required value={form.password} onChange={e => setForm({...form, password: e.target.value})} />
        {error && <div className="error">{error}</div>}
        <button>{button}</button>
        {extra}
      </form>
    </div>
  );
}

function Cart() {
  const { cart, cartTotal, updateCart, removeFromCart, user } = useStore();
  return (
    <div className="page">
      <h2>Your Cart</h2>
      {!cart.length ? <div className="empty">Your cart is empty. <Link to="/">Continue shopping</Link></div> :
        <div className="cart-layout">
          <div>
            {cart.map(i => <div className="cart-row" key={i.product}>
              <img src={i.image} alt={i.name} />
              <div><h3>{i.name}</h3><p>₹{i.price.toLocaleString("en-IN")}</p></div>
              <input type="number" min="1" value={i.quantity} onChange={e => updateCart(i.product, Number(e.target.value))} />
              <strong>₹{(i.price * i.quantity).toLocaleString("en-IN")}</strong>
              <button className="danger" onClick={() => removeFromCart(i.product)}>Remove</button>
            </div>)}
          </div>
          <div className="summary">
            <h3>Order Summary</h3>
            <p>Subtotal <strong>₹{cartTotal.toLocaleString("en-IN")}</strong></p>
            <p>Shipping <strong>Free</strong></p>
            <hr />
            <p className="total">Total <strong>₹{cartTotal.toLocaleString("en-IN")}</strong></p>
            {user ? <Link className="btn full" to="/checkout">Proceed to Checkout</Link> : <Link className="btn full" to="/login">Login to Checkout</Link>}
          </div>
        </div>}
    </div>
  );
}

function Checkout() {
  const { API, token, cart, cartTotal, setCart } = useStore();
  const nav = useNavigate();
  const [form, setForm] = useState({ fullName: "", phone: "", address: "", city: "", state: "", pincode: "" });
  const [error, setError] = useState("");

  const submit = async e => {
    e.preventDefault();
    try {
      await axios.post(`${API}/orders`, { items: cart.map(i => ({ product: i.product, quantity: i.quantity })), shippingAddress: form }, { headers: { Authorization: `Bearer ${token}` }});
      setCart([]);
      nav("/orders");
    } catch (err) { setError(err.response?.data?.message || "Could not place order"); }
  };

  return <div className="page narrow">
    <h2>Checkout</h2>
    <form className="checkout" onSubmit={submit}>
      {Object.keys(form).map(k => <input key={k} required placeholder={k.replace(/([A-Z])/g, " $1")} value={form[k]} onChange={e => setForm({...form, [k]: e.target.value})} />)}
      {error && <div className="error">{error}</div>}
      <div className="checkout-total">Total: ₹{cartTotal.toLocaleString("en-IN")}</div>
      <button>Place Order</button>
    </form>
  </div>;
}

function Orders() {
  const { API, token } = useStore();
  const [orders, setOrders] = useState([]);
  useEffect(() => {
    axios.get(`${API}/orders/my`, { headers: { Authorization: `Bearer ${token}` }}).then(r => setOrders(r.data));
  }, []);
  return <div className="page"><h2>My Orders</h2>
    {!orders.length ? <div className="empty">No orders yet.</div> :
      orders.map(o => <div className="order-card" key={o._id}>
        <div><strong>Order #{o._id.slice(-8).toUpperCase()}</strong><span className={`status ${o.status.toLowerCase()}`}>{o.status}</span></div>
        <p>{new Date(o.createdAt).toLocaleString()} · {o.items.length} item(s) · ₹{o.totalAmount.toLocaleString("en-IN")}</p>
        <div className="progress"><span className={["Placed","Processing","Shipped","Delivered"].includes(o.status) ? "active" : ""}>Placed</span><span className={["Processing","Shipped","Delivered"].includes(o.status) ? "active" : ""}>Processing</span><span className={["Shipped","Delivered"].includes(o.status) ? "active" : ""}>Shipped</span><span className={o.status === "Delivered" ? "active" : ""}>Delivered</span></div>
      </div>)}
  </div>;
}

function Admin() {
  const { API, token } = useStore();
  return <AdminDashboard API={API} token={token} />;
}

function Protected({ children, admin = false }) {
  const { user } = useStore();
  if (!user) return <Navigate to="/login" replace />;
  if (admin && user.role !== "admin") return <Navigate to="/" replace />;
  return children;
}

function App() {
  return <>
    <Navbar />
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/cart" element={<Cart />} />
      <Route path="/checkout" element={<Protected><Checkout /></Protected>} />
      <Route path="/orders" element={<Protected><Orders /></Protected>} />
      <Route path="/admin" element={<Protected admin><Admin /></Protected>} />
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
    <footer>© 2026 ShopNest · Full-Stack E-Commerce Demo</footer>
  </>;
}

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode><BrowserRouter><StoreProvider><App /></StoreProvider></BrowserRouter></React.StrictMode>
);
