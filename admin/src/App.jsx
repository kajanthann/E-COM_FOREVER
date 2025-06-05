import React, { useEffect, useState } from 'react';
import { Route, Routes } from 'react-router-dom';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import Add from './pages/Add';
import List from './pages/List';
import Orders from './pages/Orders';
import Login from './components/Login';
import { ToastContainer } from 'react-toastify';

export const backendUrl = import.meta.env.VITE_BACKEND_URL;
export const currency = '$';

const App = () => {
  const [token, setToken] = useState(localStorage.getItem('token') || '');
  const [isAdmin, setIsAdmin] = useState(localStorage.getItem('isAdmin') === 'true');

  useEffect(() => {
    localStorage.setItem('token', token);
    localStorage.setItem('isAdmin', isAdmin);
  }, [token, isAdmin]);

  return (
    <div className="bg-gray-50 min-h-screen">
      <ToastContainer />
      
      {token === '' ? (
        <Login setToken={setToken} setIsAdmin={setIsAdmin} />
      ) : (
        <>
          <Navbar setToken={setToken} setIsAdmin={setIsAdmin} />

          <div className="flex">
            {/* Sidebar */}
            <Sidebar />

            {/* Main content */}
            <div className="flex-1 px-6 py-4 text-gray-600 text-base">
              <Routes>
                <Route path="/add" element={<Add token={token} isAdmin={isAdmin} />} />
                <Route path="/list" element={<List token={token} isAdmin={isAdmin} />} />
                <Route path="/orders" element={<Orders token={token} isAdmin={isAdmin} />} />
              </Routes>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default App;
