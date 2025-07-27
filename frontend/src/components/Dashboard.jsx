import { Link, useNavigate } from 'react-router-dom';
import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';

function Dashboard({ userRole }) {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [analytics, setAnalytics] = useState({ mostAdded: [], topExpensive: [], totalValue: 0 });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [productsResponse, analyticsResponse] = await Promise.all([
        axios.get('/api/products?page=1&limit=10', {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        }),
        axios.get('/api/products/analytics', {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        })
      ]);
      setProducts(productsResponse.data.products);
      setAnalytics(analyticsResponse.data);
    } catch (err) {
      console.error('Error fetching data:', err.response?.data, err.message);
      setError(err.response?.data?.error || 'Failed to load data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    navigate('/login');
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#F5F1E9', marginBottom: '100px' }}>
      <nav className="p-4 text-white shadow-lg" style={{ backgroundColor: '#4A7046' }}>
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold">Inventory Management</h1>
          <div>
            {userRole === 'admin' && (
              <Link to="/admin" className="bg-white text-[#4A7046] px-4 py-2 rounded-lg hover:bg-[#5A6F50] hover:text-white mr-4 transition duration-200">
                Admin Portal
              </Link>
            )}
            <button
              onClick={handleLogout}
              className="bg-white text-[#4A7046] px-4 py-2 rounded-lg hover:bg-[#5A6F50] hover:text-white transition duration-200"
            >
              Logout
            </button>
          </div>
        </div>
      </nav>
      <div className="container mx-auto mt-8 px-4">
        <h2 className="text-3xl font-bold mb-6" style={{ color: '#4A7046' }}>Welcome to the Dashboard</h2>
        <p className="mb-6" style={{ color: '#000000' }}>Manage your inventory efficiently.</p>
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

        {/* Products Table */}
        <div className="bg-white rounded-lg shadow-lg overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr style={{ backgroundColor: '#5A6F50' }}>
                <th className="p-3 text-left font-semibold" style={{ color: '#F5F1E9' }}>Name</th>
                <th className="p-3 text-left font-semibold" style={{ color: '#F5F1E9' }}>Type</th>
                <th className="p-3 text-left font-semibold" style={{ color: '#F5F1E9' }}>SKU</th>
                <th className="p-3 text-left font-semibold" style={{ color: '#F5F1E9' }}>Price</th>
                <th className="p-3 text-left font-semibold" style={{ color: '#F5F1E9' }}>Quantity</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr key={product._id} className="border-t hover:bg-[#C1D3C0] transition duration-200">
                  <td className="p-3" style={{ color: '#000000' }}>{product.name}</td>
                  <td className="p-3" style={{ color: '#000000' }}>{product.type}</td>
                  <td className="p-3" style={{ color: '#000000' }}>{product.sku}</td>
                  <td className="p-3" style={{ color: '#000000' }}>${product.price}</td>
                  <td className="p-3" style={{ color: '#000000' }}>{product.quantity}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;