import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function Login({ setIsAuthenticated, setUserRole }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('/api/auth/login', {
        username,
        password,
      });
      console.log('Login response:', response.data);
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('role', response.data.user.role || 'user');
      setIsAuthenticated(true);
      setUserRole(response.data.user.role || 'user');
      navigate('/');
    } catch (err) {
      console.error('Login error:', err.response?.data, err.message);
      setError('Invalid credentials');
    }
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#F5F1E9' }}>
      <div className="min-h-screen flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
          <h2 className="text-2xl font-bold mb-6 text-center" style={{ color: '#4A7046' }}>Login</h2>
          {error && <p className="text-red-500 mb-4 p-3 bg-red-100 rounded-lg">{error}</p>}
          <form onSubmit={handleLogin}>
            <div className="mb-4">
              <label className="block font-medium mb-2" style={{ color: '#4A7046' }} htmlFor="username">Username</label>
              <input
                type="text"
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5A6F50] transition duration-200"
                style={{ borderColor: '#4A7046', color: '#000000' }}
                required
              />
            </div>
            <div className="mb-6">
              <label className="block font-medium mb-2" style={{ color: '#4A7046' }} htmlFor="password">Password</label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5A6F50] transition duration-200"
                style={{ borderColor: '#4A7046', color: '#000000' }}
                required
              />
            </div>
            <button
              type="submit"
              className="w-full bg-[#4A7046] text-white p-2 rounded hover:bg-[#5A6F50] transition duration-200"
            >
              Login
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Login;