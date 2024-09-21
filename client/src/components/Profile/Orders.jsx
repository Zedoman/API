import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { FaAngleRight, FaAngleDown } from 'react-icons/fa';
import Profile1 from './Profile1';

const OrderPage = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedOrderId, setSelectedOrderId] = useState(null);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const apiUrl = process.env.REACT_APP_API_URL;
        const user = JSON.parse(localStorage.getItem('user'));
        if (!user) {
          console.log('User not logged in');
          navigate('/login');
          return;
        }

        if (!user.email && !user.contactNumber) {
          console.log('User details incomplete');
          navigate('/login');
          return;
        }

        // Fetch buy orders only
        const buyNowOrdersResponse = await axios.get(`${apiUrl}/api/users/getbuy`, {
          params: {
            email: user.email,
            contactNumber: user.contactNumber,
          },
        });

        setOrders(buyNowOrdersResponse.data.orders);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching orders:', error);
        setLoading(false);
        setError('Error fetching orders');
      }
    };

    fetchOrders();
  }, [navigate]);

  const toggleOrderDetails = (orderId) => {
    setSelectedOrderId((prevOrderId) => (prevOrderId === orderId ? null : orderId));
  };

  const handleViewOrder = (orderId) => {
    navigate(`/order/${orderId}`);
  };

  const OrderItem = ({ order }) => {
    return (
      <div
        key={order._id}
        className="rounded-lg border-b-2 p-4 flex flex-col w-full gap-4 cursor-pointer"
      >
        <div
          className="flex items-center justify-between"
          onClick={() => toggleOrderDetails(order._id)}
        >
          <div className="flex flex-col">
            <p className="text-lg font-semibold">Order ID: {order._id}</p>
            <p className="text-sm text-gray-600">Amount: ₹{order.amount}</p>
            <p className="text-sm text-gray-600">Payment status: {order.Payment_status}</p>
            <p className="text-sm text-gray-600">Delivery status: {order.Delivery_status}</p>
            <p className="text-sm text-gray-600">
              Order Date: {new Date(order.createdAt).toLocaleDateString()}
            </p>
            <div className='flex items-center'>
              <button
                onClick={() => handleViewOrder(order._id)}
                className="bg-black hover:bg-gray-500 text-white px-4 py-2 mt-4 w-full sm:w-auto text-center"
              >
                Get Invoice
              </button>
            </div>
          </div>
          {selectedOrderId === order._id ? (
            <FaAngleDown className="text-gray-600" />
          ) : (
            <FaAngleRight className="text-gray-600" />
          )}
        </div>
        {selectedOrderId === order._id && (
          <div className="mt-4">
            <h3 className="text-xl font-semibold mb-2">
              {order.cart2 ? 'Cart Items' : 'Product Details'}
            </h3>
            {order.cart2 && order.cart2.length > 0 ? (
              <div>
                {order.cart2.map((item) => (
                  <div key={item._id} className="bg-gray-100 p-4 rounded-lg mb-2">
                    <div className="flex items-center">
                      <img src={item.image} alt={item.name} className="w-16 h-16 object-cover mr-4" />
                      <div className="flex flex-col">
                        <p><strong>Product:</strong> {item.name}</p>
                        <p><strong>Quantity:</strong> {item.quantity}</p>
                        <p><strong>Price:</strong> ₹{item.price}</p>
                        <p><strong>Discounted Price:</strong> ₹{item.discounted_price}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : order.product ? (
              <div className="bg-gray-100 p-4 rounded-lg mb-2">
                <div className="flex items-center">
                  <img src={order.image} alt={order.name} className="w-16 h-16 object-cover mr-4" />
                  <div className="flex flex-col">
                    <p><strong>Product:</strong> {order.name}</p>
                    <p><strong>Quantity:</strong> {order.quantity}</p>
                    <p><strong>Price:</strong> ₹{order.price}</p>
                    <p><strong>Discounted Price:</strong> ₹{order.discounted_price}</p>
                  </div>
                </div>
              </div>
            ) : (
              <p>No items found</p>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="mt-7 md:ml-16 flex items-center justify-center p-4">
      <div className="flex gap-5 flex-col md:flex-row w-full">
        <Profile1 />
        <div className="w-full md:w-[700px] lg:w-[900px] md:h-[500px] bg-white border-2 rounded-3xl flex flex-col">
          {loading ? (
            <p className="text-2xl p-6 text-center font-normal text-black">Loading...</p>
          ) : error ? (
            <p className="text-2xl font-normal text-red-500">{error}</p>
          ) : orders.length === 0 ? (
            <div className="text-center items-center justify-center p-4">
              <svg
                className="w-16 h-16 mx-auto text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M7 7h10M7 11h10M7 15h6"
                />
              </svg>
              <p className="mt-2 text-2xl font-normal text-black">
                No Orders Found
              </p>
            </div>
          ) : (
            <div className="overflow-y-auto p-4 md:p-8 flex-1">
              <h2 className="text-3xl font-semibold mb-4">Your Orders</h2>
              <div className="grid gap-4">
                {orders.map((order) => (
                  <OrderItem key={order._id} order={order} />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default OrderPage;
