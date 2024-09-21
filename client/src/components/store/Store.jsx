import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import axios from 'axios';
import ProductCard from './ProductCard';
import { RingLoader } from 'react-spinners'; // Importing the spinner component

const Store = () => {
  const { type } = useParams();
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true); // Added loading state


  useEffect(() => {
    const fetchData = async () => {
      try {
        const apiUrl = process.env.REACT_APP_API_URL;
        const response = await axios.get(`${apiUrl}/api/product`);
        setProducts(response.data.reverse());
        setFilteredProducts(response.data); // Initialize filtered products
        setLoading(false); // Set loading to false once data is fetched
      } catch (error) {
        console.error('Error fetching data:', error);
        setLoading(false); // Ensure loading is false even if there's an error
      }
    };

    fetchData();
  }, [type]);

  
  

  if (loading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-gray-100 z-50">
        <RingLoader color="#82558a" size={60} />
      </div>
    );
  }

  return (
    <div className="flex divide-y-2 flex-col font-urbanist">
      
      <div className="flex flex-col md:flex-row divide-x-2">
        <div className="grid px-4 grid-cols-2 lg:grid-cols-3 mt-6 gap-6 md:gap-10">
          {filteredProducts.map((product, index) => (
            <ProductCard
              key={index}
              _id={product._id}
              product_name={product.product_name}
              Combination={product.Combination}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Store;
