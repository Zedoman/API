import React from 'react';
import { useNavigate } from 'react-router-dom';

const ProductCard = ({ _id, product_name, Combination }) => {
  const { '1comb': combinations } = Combination;
  const primaryCombination = combinations[0]; // Assuming you want to display the first combination
  const { attrs2comb, discounted_price, price } = primaryCombination;
  
  // Extract the first image from img_url within attrs2comb
  const firstImage = attrs2comb?.imgs?.[0]?.img_url?.[0] || '';

  const navigate = useNavigate();

  const handleCardClick = () => {
    navigate(`/product/${_id}`); // Navigate to the product details page
  };

  return (
    <div className="flex flex-col border h-[300px] shadow-sm bg-white rounded-lg cursor-pointer" onClick={handleCardClick}>
      <div className="bg-white rounded-lg flex flex-col text-left p-3 pl-6">
        <img src={firstImage} alt={product_name} className="h-48 w-80 object-contain rounded-t-lg" />
        <h2 className="text-xl text-left max-w-72 mt-3 font-semibold line-clamp-1">{product_name}</h2>
        <div className="mt-1 mb-2 text-left">
          <span className="text-black text-xl mt-2 font-medium">₹{discounted_price}</span>
          <span className="line-through mt-2 ml-2 text-md text-gray-500">₹{price}</span>
        </div>
      </div>
    </div>
  );
}

export default ProductCard;
