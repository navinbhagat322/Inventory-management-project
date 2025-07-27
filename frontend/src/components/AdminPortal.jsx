import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

function AdminPortal() {
  const [products, setProducts] = useState([]);
  const [form, setForm] = useState({ name: '', type: '', sku: '', image_url: '', description: '', price: '', quantity: '' });
  const [editingId, setEditingId] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const [analytics, setAnalytics] = useState({ mostAdded: [], topExpensive: [], totalValue: 0 });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [productsResponse, analyticsResponse] = await Promise.all([
        axios.get(`/api/products?page=${page}&limit=5&name=${encodeURIComponent(search)}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        }),
        axios.get('/api/products/analytics', {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        })
      ]);
      setProducts(productsResponse.data.products);
      setTotalPages(productsResponse.data.pages);
      setAnalytics(analyticsResponse.data);
    } catch (err) {
      console.error('Error fetching data:', err.response?.data, err.message);
      setError(err.response?.data?.error || 'Failed to load data');
    } finally {
      setLoading(false);
    }
  }, [page, search]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const token = localStorage.getItem('token');
    try {
      const productData = {
        ...form,
        quantity: parseInt(form.quantity, 10),
        price: parseFloat(form.price)
      };
      if (editingId) {
        const response = await axios.put(`/api/products/${editingId}`, productData, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setProducts(products.map((p) => (p._id === editingId ? response.data : p)));
        setEditingId(null);
      } else {
        const response = await axios.post('/api/products', productData, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setProducts([...products, response.data]);
      }
      setForm({ name: '', type: '', sku: '', image_url: '', description: '', price: '', quantity: '' });
      fetchData();
    } catch (err) {
      console.error('Error saving product:', err.response?.data, err.message);
      setError(err.response?.data?.error || 'Failed to save product');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (product) => {
    setForm({
      name: product.name,
      type: product.type,
      sku: product.sku,
      image_url: product.image_url || '',
      description: product.description || '',
      price: product.price.toString(),
      quantity: product.quantity.toString()
    });
    setEditingId(product._id);
  };

  const handleUpdateQuantity = async (id, quantity) => {
    setError('');
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.put(`/api/products/${id}/quantity`, { quantity: parseInt(quantity, 10) }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setProducts(products.map((p) => (p._id === id ? response.data : p)));
    } catch (err) {
      console.error('Error updating quantity:', err.response?.data, err.message);
      setError(err.response?.data?.error || 'Failed to update quantity');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    setError('');
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`/api/products/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setProducts(products.filter((p) => p._id !== id));
      fetchData();
    } catch (err) {
      console.error('Error deleting product:', err.response?.data, err.message);
      setError(err.response?.data?.error || 'Failed to delete product');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#F5F1E9' }}>
      <nav className="p-4 text-white shadow-lg" style={{ backgroundColor: '#4A7046' }}>
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold">Admin Portal</h1>
          <Link to="/" className="bg-white text-[#4A7046] px-4 py-2 rounded-lg hover:bg-[#5A6F50] hover:text-white transition duration-200">
            Back to Dashboard
          </Link>
        </div>
      </nav>
      <div className="container mx-auto mt-8 px-4">
        <h2 className="text-3xl font-bold mb-6" style={{ color: '#4A7046' }}>Manage Products</h2>
        {error && <p className="text-red-500 mb-4 p-3 bg-red-100 rounded-lg">{error}</p>}
        {loading && <p className="mb-4" style={{ color: '#4A7046' }}>Loading...</p>}

        {/* Analytics Section */}
        <div className="mb-8 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-6 rounded-lg shadow-lg" style={{ backgroundColor: '#5A6F50' }}>
            <h3 className="text-lg font-medium mb-3" style={{ color: '#F5F1E9' }}>Most Added Products</h3>
            <ul className="list-disc pl-5" style={{ color: '#F5F1E9' }}>
              {analytics.mostAdded.map((item) => (
                <li key={item._id}>{item._id}: {item.count} times</li>
              ))}
            </ul>
          </div>
          <div className="p-6 rounded-lg shadow-lg" style={{ backgroundColor: '#5A6F50' }}>
            <h3 className="text-lg font-medium mb-3" style={{ color: '#F5F1E9' }}>Top Expensive Products</h3>
            <ul className="list-disc pl-5" style={{ color: '#F5F1E9' }}>
              {analytics.topExpensive.map((item) => (
                <li key={item._id}>{item.name}: ${item.price.toFixed(2)}</li>
              ))}
            </ul>
          </div>
          <div className="p-6 rounded-lg shadow-lg" style={{ backgroundColor: '#5A6F50' }}>
            <h3 className="text-lg font-medium mb-3" style={{ color: '#F5F1E9' }}>Total Inventory Value</h3>
            <p style={{ color: '#F5F1E9' }}>${analytics.totalValue.toFixed(2)}</p>
          </div>
        </div>

        {/* Search Bar */}
        <div className="mb-6">
          <input
            type="text"
            placeholder="Search by product name..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5A6F50] shadow-sm transition duration-200"
            style={{ borderColor: '#4A7046', color: '#000000' }}
          />
        </div>

        {/* Product Form */}
        <form onSubmit={handleSubmit} className="mb-8 bg-white p-6 rounded-lg shadow-lg">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block font-medium mb-2" style={{ color: '#4A7046' }} htmlFor="name">Name</label>
              <input
                type="text"
                id="name"
                name="name"
                value={form.name}
                onChange={handleInputChange}
                placeholder="Enter product name"
                className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5A6F50] transition duration-200"
                style={{ borderColor: '#4A7046', color: '#000000' }}
                required
              />
            </div>
            <div>
              <label className="block font-medium mb-2" style={{ color: '#4A7046' }} htmlFor="type">Type</label>
              <input
                type="text"
                id="type"
                name="type"
                value={form.type}
                onChange={handleInputChange}
                placeholder="Enter product type"
                className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5A6F50] transition duration-200"
                style={{ borderColor: '#4A7046', color: '#000000' }}
                required
              />
            </div>
            <div>
              <label className="block font-medium mb-2" style={{ color: '#4A7046' }} htmlFor="sku">SKU</label>
              <input
                type="text"
                id="sku"
                name="sku"
                value={form.sku}
                onChange={handleInputChange}
                placeholder="Enter SKU"
                className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5A6F50] transition duration-200"
                style={{ borderColor: '#4A7046', color: '#000000' }}
                required
              />
            </div>
            <div>
              <label className="block font-medium mb-2" style={{ color: '#4A7046' }} htmlFor="image_url">Image URL</label>
              <input
                type="text"
                id="image_url"
                name="image_url"
                value={form.image_url}
                onChange={handleInputChange}
                placeholder="Enter image URL"
                className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5A6F50] transition duration-200"
                style={{ borderColor: '#4A7046', color: '#000000' }}
              />
            </div>
            <div>
              <label className="block font-medium mb-2" style={{ color: '#4A7046' }} htmlFor="description">Description</label>
              <input
                type="text"
                id="description"
                name="description"
                value={form.description}
                onChange={handleInputChange}
                placeholder="Enter description"
                className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5A6F50] transition duration-200"
                style={{ borderColor: '#4A7046', color: '#000000' }}
                required
              />
            </div>
            <div>
              <label className="block font-medium mb-2" style={{ color: '#4A7046' }} htmlFor="price">Price</label>
              <input
                type="number"
                id="price"
                name="price"
                value={form.price}
                onChange={handleInputChange}
                placeholder="Enter price"
                className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5A6F50] transition duration-200"
                style={{ borderColor: '#4A7046', color: '#000000' }}
                required
                step="0.01"
              />
            </div>
            <div>
              <label className="block font-medium mb-2" style={{ color: '#4A7046' }} htmlFor="quantity">Quantity</label>
              <input
                type="number"
                id="quantity"
                name="quantity"
                value={form.quantity}
                onChange={handleInputChange}
                placeholder="Enter quantity"
                className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5A6F50] transition duration-200"
                style={{ borderColor: '#4A7046', color: '#000000' }}
                required
                step="1"
              />
            </div>
          </div>
          <button
            type="submit"
            disabled={loading}
            className="mt-4 px-4 py-2 rounded-lg text-white transition duration-200 disabled:bg-[#5A6F50] disabled:opacity-70"
            style={{ backgroundColor: loading ? '#5A6F50' : '#4A7046' }}
          >
            {editingId ? 'Update Product' : 'Add Product'}
          </button>
        </form>

        {/* Product Table */}
        <div className="bg-white rounded-lg shadow-lg overflow-x-auto mb-6">
          <table className="min-w-full">
            <thead>
              <tr style={{ backgroundColor: '#5A6F50' }}>
                <th className="p-3 text-left font-semibold" style={{ color: '#F5F1E9' }}>Name</th>
                <th className="p-3 text-left font-semibold" style={{ color: '#F5F1E9' }}>Type</th>
                <th className="p-3 text-left font-semibold" style={{ color: '#F5F1E9' }}>SKU</th>
                <th className="p-3 text-left font-semibold" style={{ color: '#F5F1E9' }}>Image</th>
                <th className="p-3 text-left font-semibold" style={{ color: '#F5F1E9' }}>Description</th>
                <th className="p-3 text-left font-semibold" style={{ color: '#F5F1E9' }}>Price</th>
                <th className="p-3 text-left font-semibold" style={{ color: '#F5F1E9' }}>Quantity</th>
                <th className="p-3 text-left font-semibold" style={{ color: '#F5F1E9' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr key={product._id} className="border-t hover:bg-[#C1D3C0] transition duration-200">
                  <td className="p-3" style={{ color: '#000000' }}>{product.name}</td>
                  <td className="p-3" style={{ color: '#000000' }}>{product.type}</td>
                  <td className="p-3" style={{ color: '#000000' }}>{product.sku}</td>
                  <td className="p-3">
                    {product.image_url ? (
                      <img src={product.image_url} alt={product.name} className="h-12 w-12 object-cover rounded" />
                    ) : (
                      <span style={{ color: '#000000' }}>No image</span>
                    )}
                  </td>
                  <td className="p-3" style={{ color: '#000000' }}>{product.description}</td>
                  <td className="p-3" style={{ color: '#000000' }}>${product.price}</td>
                  <td className="p-3">
                    <div className="flex items-center">
                      <span style={{ color: '#000000' }}>{product.quantity}</span>
                      <input
                        type="number"
                        min="0"
                        defaultValue={product.quantity}
                        onBlur={(e) => handleUpdateQuantity(product._id, parseInt(e.target.value))}
                        className="ml-2 w-16 p-1 border rounded transition duration-200"
                        style={{ borderColor: '#4A7046', color: '#000000' }}
                      />
                    </div>
                  </td>
                  <td className="p-3">
                    <button
                      onClick={() => handleEdit(product)}
                      className="px-3 py-1 rounded mr-2 text-white transition duration-200 hover:bg-[#5A6F50]"
                      style={{ backgroundColor: '#4A7046' }}
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(product._id)}
                      className="px-3 py-1 rounded text-white transition duration-200 hover:bg-[#5A6F50]"
                      style={{ backgroundColor: '#4A7046' }}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="mt-4 mb-6 flex justify-between items-center">
          <button
            onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
            disabled={page === 1 || loading}
            className="px-4 py-2 rounded-lg text-white transition duration-200 disabled:bg-[#5A6F50] disabled:opacity-70"
            style={{ backgroundColor: page === 1 || loading ? '#5A6F50' : '#4A7046' }}
          >
            Previous
          </button>
          <span style={{ color: '#4A7046' }}>Page {page} of {totalPages}</span>
          <button
            onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))}
            disabled={page === totalPages || loading}
            className="px-4 py-2 rounded-lg text-white transition duration-200 disabled:bg-[#5A6F50] disabled:opacity-70"
            style={{ backgroundColor: page === totalPages || loading ? '#5A6F50' : '#4A7046' }}
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}

export default AdminPortal;