import { useEffect, useState } from "react";
import axios from "axios";

const emptyForm = { name: "", price: "", category: "", stock: "", image: "" };
const fallbackImage = "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80";

export default function AdminDashboard({ API, token, onLogout }) {
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [saving, setSaving] = useState(false);
  const [productSearch, setProductSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [section, setSection] = useState(() => window.location.hash.replace("#", "") || "dashboard");
  const headers = { Authorization: `Bearer ${token}` };

  const categories = ["All", ...new Set(products.map(product => product.category).filter(Boolean))];
  const visibleProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(productSearch.toLowerCase());
    const matchesCategory = categoryFilter === "All" || product.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });
  const lowStockCount = products.filter(product => product.stock < 10).length;
  const openOrdersCount = orders.filter(order => !["Delivered", "Cancelled"].includes(order.status)).length;
  const orderStatusSummary = ["Placed", "Processing", "Shipped", "Delivered", "Cancelled"].map(status => ({
    status,
    count: orders.filter(order => order.status === status).length
  }));
  const categorySuggestions = [...new Set([
    ...categories.filter(category => category !== "All"),
    "Electronics",
    "Fashion",
    "Home",
    "Books",
    "Fitness",
    "Outdoor",
    "Travel",
    "Pets"
  ])];

  const load = async () => {
    try {
      const [productsResponse, ordersResponse] = await Promise.all([
        axios.get(`${API}/products`),
        axios.get(`${API}/orders`, { headers })
      ]);
      setProducts(productsResponse.data);
      setOrders(ordersResponse.data);
      setError("");
    } catch (requestError) {
      if (requestError.response?.status === 401) {
        onLogout();
        return;
      }
      setError(requestError.response?.data?.message || "Could not load dashboard data");
    }
  };

  useEffect(() => { load(); }, []);

  useEffect(() => {
    const handleHashChange = () => setSection(window.location.hash.replace("#", "") || "dashboard");
    window.addEventListener("hashchange", handleHashChange);
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, []);

  useEffect(() => {
    if (!success) return undefined;
    const timeout = window.setTimeout(() => setSuccess(""), 3000);
    return () => window.clearTimeout(timeout);
  }, [success]);

  const saveProduct = async event => {
    event.preventDefault();
    setError("");
    setSuccess("");
    setSaving(true);
    try {
      const wasEditing = Boolean(editingId);
      const payload = { ...form, price: Number(form.price), stock: Number(form.stock) };
      if (editingId) await axios.put(`${API}/products/${editingId}`, payload, { headers });
      else await axios.post(`${API}/products`, payload, { headers });
      setForm(emptyForm);
      setEditingId(null);
      setSuccess(wasEditing ? "Product updated successfully." : "Product added successfully.");
      await load();
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Could not save product");
    } finally {
      setSaving(false);
    }
  };

  const edit = product => {
    setEditingId(product._id);
    setForm({
      name: product.name,
      price: product.price,
      category: product.category,
      stock: product.stock,
      image: product.image || ""
    });
    setError("");
    setSuccess("");
  };

  const cancelEdit = () => {
    setEditingId(null);
    setForm(emptyForm);
    setError("");
    setSuccess("");
  };

  const remove = async id => {
    if (!confirm("Delete this product?")) return;
    try {
      await axios.delete(`${API}/products/${id}`, { headers });
      if (editingId === id) cancelEdit();
      await load();
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Could not delete product");
    }
  };

  const updateOrderStatus = async (id, value) => {
    await axios.patch(`${API}/orders/${id}/status`, { status: value }, { headers });
    await load();
  };

  const productList = <div id="products">
    <div className="products-toolbar">
      <div><h3>Manage Products</h3><small>{visibleProducts.length} of {products.length} items</small></div>
      <input aria-label="Search products" placeholder="Search products" value={productSearch} onChange={event => setProductSearch(event.target.value)} />
      <select aria-label="Filter products by category" value={categoryFilter} onChange={event => setCategoryFilter(event.target.value)}>
        {categories.map(category => <option key={category}>{category}</option>)}
      </select>
    </div>
    {visibleProducts.map(product => <div className="admin-row" key={product._id}>
      <div className="product-summary">
        {product.image ? <img src={product.image} alt="" onError={event => { event.currentTarget.onerror = null; event.currentTarget.src = fallbackImage; }} /> : <div className="image-placeholder">No image</div>}
        <span><strong>{product.name}</strong><small>{product.category} · ₹{product.price} · Stock {product.stock}</small></span>
      </div>
      <div className="row-actions"><button className="secondary" onClick={() => edit(product)}>Edit</button><button className="danger" onClick={() => remove(product._id)}>Delete</button></div>
    </div>)}
  </div>;

  const productForm = <form className="admin-form" id="add-product" onSubmit={saveProduct}>
    <h3>{editingId ? "Edit Product" : "Add New Product"}</h3>
    <input required placeholder="Product name" value={form.name} onChange={event => setForm({ ...form, name: event.target.value })} />
    <input required min="0" step="0.01" type="number" placeholder="Price" value={form.price} onChange={event => setForm({ ...form, price: event.target.value })} />
    <input required list="category-suggestions" placeholder="Category" value={form.category} onChange={event => setForm({ ...form, category: event.target.value })} />
    <datalist id="category-suggestions">
      {categorySuggestions.map(category => <option key={category} value={category} />)}
    </datalist>
    <input required min="0" step="1" type="number" placeholder="Stock" value={form.stock} onChange={event => setForm({ ...form, stock: event.target.value })} />
    <input type="url" placeholder="Image URL (https://...)" value={form.image} onChange={event => setForm({ ...form, image: event.target.value })} />
    {error && <div className="error">{error}</div>}
    {success && <div className="success" role="status">{success}</div>}
    <div className="form-actions">
      <button disabled={saving}>{saving ? "Saving..." : editingId ? "Save Changes" : "Add Product"}</button>
      {editingId && <button type="button" className="secondary" onClick={cancelEdit}>Cancel</button>}
    </div>
  </form>;

  const orderList = <section id="orders">
    <h3 className="section-title">Orders</h3>
    {orders.map(order => <div className="admin-row" key={order._id}>
      <span><strong>#{order._id.slice(-8).toUpperCase()} · {order.user?.name}</strong><small>₹{order.totalAmount.toLocaleString("en-IN")} · {order.status}</small></span>
      <select value={order.status} onChange={event => updateOrderStatus(order._id, event.target.value)}><option>Placed</option><option>Processing</option><option>Shipped</option><option>Delivered</option><option>Cancelled</option></select>
    </div>)}
  </section>;

  return <div className="page" id="dashboard">
    <div className="dashboard-heading">
      <div><p className="eyebrow">STORE CONTROL</p><h2>Admin Dashboard</h2></div>
      <button onClick={() => { cancelEdit(); window.location.hash = "add-product"; }}>+ Add Product</button>
    </div>
    {section === "dashboard" && <section className="dashboard-overview" aria-label="Store overview">
      <div className="overview-card"><small>Total Products</small><strong>{products.length}</strong><span>{categories.length - 1} categories</span></div>
      <div className="overview-card"><small>Low Stock</small><strong>{lowStockCount}</strong><span>Items below 10 units</span></div>
      <div className="overview-card"><small>Total Orders</small><strong>{orders.length}</strong><span>{openOrdersCount} need attention</span></div>
      <div className="overview-card status-card"><small>Order Details</small><div>{orderStatusSummary.map(item => <span key={item.status}>{item.status}: <strong>{item.count}</strong></span>)}</div></div>
    </section>}
    {section === "products" && productList}
    {section === "add-product" && productForm}
    {section === "orders" && orderList}
  </div>;
}
