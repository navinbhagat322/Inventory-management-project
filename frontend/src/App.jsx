import { useState, useEffect } from 'react';
   import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
   import Login from './components/Login.jsx';
   import Dashboard from './components/Dashboard.jsx';
   import AdminPortal from './components/AdminPortal.jsx';

   function App() {
     const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem('token'));
     const [userRole, setUserRole] = useState(localStorage.getItem('role') || '');

     useEffect(() => {
       // Check token validity on mount
       const token = localStorage.getItem('token');
       if (token) {
         setIsAuthenticated(true);
       }
     }, []);

     return (
       <Router>
         <Routes>
           <Route path="/login" element={<Login setIsAuthenticated={setIsAuthenticated} setUserRole={setUserRole} />} />
           <Route
             path="/"
             element={isAuthenticated ? <Dashboard userRole={userRole} /> : <Navigate to="/login" />}
           />
           <Route
             path="/admin"
             element={
               isAuthenticated && userRole === 'admin' ? <AdminPortal /> : <Navigate to="/login" />
             }
           />
         </Routes>
       </Router>
     );
   }

   export default App;