import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { backendUrl, currency } from '../App';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

const Orders = ({ token, isAdmin }) => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);

  const fetchAllOrders = async () => {
    try {
      if (!isAdmin) {
        toast.error('Access denied. Admin privileges required.');
        navigate('/');
        return;
      }

      const response = await axios.get(
        `${backendUrl}/api/order/orders`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (response.data.success) {
        setOrders(response.data.orders);
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast.error(error.response?.data?.message || 'Error fetching orders');
      if (error.response?.status === 401) {
        navigate('/');
      }
    }
  };

  useEffect(() => {
    fetchAllOrders();
  }, [isAdmin]);

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h2 className="text-2xl font-semibold mb-6">All Orders</h2>
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white shadow-md rounded-lg overflow-hidden">
          <thead className="bg-gray-100">
            <tr>
              <th className="py-3 px-4 text-left">Order ID</th>
              <th className="py-3 px-4 text-left">Customer</th>
              <th className="py-3 px-4 text-left">Products</th>
              <th className="py-3 px-4 text-left">Total</th>
              <th className="py-3 px-4 text-left">Status</th>
              <th className="py-3 px-4 text-left">Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {orders.map((order) => (
              <tr key={order._id} className="hover:bg-gray-50">
                <td className="py-3 px-4">{order._id}</td>
                <td className="py-3 px-4">
                  <div>
                    <p className="font-medium">{order.shippingInfo.name}</p>
                    <p className="text-sm text-gray-600">{order.shippingInfo.email}</p>
                  </div>
                </td>
                <td className="py-3 px-4">
                  <div className="max-h-20 overflow-y-auto">
                    {order.orderItems.map((item, index) => (
                      <div key={index} className="text-sm">
                        {item.name} x {item.quantity}
                      </div>
                    ))}
                  </div>
                </td>
                <td className="py-3 px-4">{currency}{order.totalPrice}</td>
                <td className="py-3 px-4">
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    order.orderStatus === 'Processing' ? 'bg-yellow-100 text-yellow-800' :
                    order.orderStatus === 'Shipped' ? 'bg-blue-100 text-blue-800' :
                    order.orderStatus === 'Delivered' ? 'bg-green-100 text-green-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {order.orderStatus}
                  </span>
                </td>
                <td className="py-3 px-4">
                  {new Date(order.createdAt).toLocaleDateString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Orders; 