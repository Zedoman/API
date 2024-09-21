import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { AiFillThunderbolt } from "react-icons/ai";
import { IoIosArrowBack } from "react-icons/io";
import { IoIosArrowForward } from "react-icons/io";

const Laptopunder = () => {
  const [products, setProducts] = useState([]);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(true);
  const [isHovered, setIsHovered] = useState(false);
  const navigate = useNavigate();
  const { type } = useParams();
  const scrollRef = useRef(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const apiUrl = process.env.REACT_APP_API_URL;
        const response = await axios.get(`${apiUrl}/api/product`);
        setProducts(response.data.reverse());
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, [type]);

  const handleViewAll = () => {
    navigate(`/Store`); // Redirect to the category page based on the type
  };

  const handleScroll = (direction) => {
    if (scrollRef.current) {
      const { scrollLeft, clientWidth, scrollWidth } = scrollRef.current;
      const scrollTo = direction === 'left' ? scrollLeft - clientWidth : scrollLeft + clientWidth;
      scrollRef.current.scrollTo({ left: scrollTo, behavior: 'smooth' });

      if (direction === 'left') {
        setShowRightArrow(true);
        if (scrollTo <= 0) {
          setShowLeftArrow(false);
        }
      } else {
        setShowLeftArrow(true);
        if (scrollTo + clientWidth >= scrollWidth) {
          setShowRightArrow(false);
        }
      }
    }
  };

  const WatchCard = ({ product }) => {
    const { _id, product_type, product_name, Combination } = product;

    if (!Combination || !Combination['1comb']) {
      return <div className="border p-4 m-2 flex flex-col items-center bg-white shadow-lg rounded-lg">Invalid product data</div>;
    }

    const { '1comb': combinations } = Combination;
    const primaryCombination = combinations[0]; // Assuming you want to display the first combination
    const { attrs2comb } = primaryCombination;

    // Extract the first image from img_url within attrs2comb
    const firstImage = attrs2comb?.imgs?.[0]?.img_url?.[0] || '';

    const originalPrice = primaryCombination.price;
    const discountedPrice = primaryCombination.discounted_price;
    const discountPercentage = Math.round(((originalPrice - discountedPrice) / originalPrice) * 100);

    const handleCardClick = () => {
      navigate(`/product/${_id}`); // Navigate to the product details page
    };

    return (
      <div 
        className="relative p-2 m-2 flex flex-col items-center bg-white rounded-lg cursor-pointer"
        onClick={handleCardClick}
        style={{ width: '400px' }} // Increased width for the card
      >
        <div className='flex justify-between'>
          <div className="absolute flex gap-2 mt-3 ml-2 top-2 left-2 bg-slate-200 text-slate-500 text-xs font-bold px-3 py-[2px] rounded-full">
            <AiFillThunderbolt className='mt-[2px]' />{discountPercentage}% OFF
          </div>
          <div className='bg-green-200 absolute mr-2 mt-3 top-2 right-2 rounded-full px-2 text-green-600'>
            <p className='text-sm'>New</p>
          </div>
        </div>
        <img
          src={firstImage}
          alt={product_name}
          className="h-48 mt-10 w-full object-contain rounded-t-lg"
          style={{ maxHeight: '200px' }} // Fixed height for the image
        />
        <div className="p-3">
          <h2 className="text-lg line-clamp-2 w-56 mt-2">{product_name}</h2>
          <p className="text-sm text-gray-500">{product_type}</p>
          <div className="mt-2 flex gap-3">
            <span className="text-black text-xl mt-2 font-semibold">₹ {discountedPrice}</span>
            <span className="line-through mt-2 text-md text-gray-500">₹ {originalPrice}</span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <section
      className="p-6 md:px-20 relative"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className='flex justify-between'>
        <h2 className="text-xl sm:text-2xl font-medium mb-6">New Releases</h2>
        <div className='md:block'>
          <button onClick={handleViewAll} className="border border-slate-400 sm:py-2 sm:px-4 py-1 px-2 rounded-full">View All</button>
        </div>
      </div>

      <div className="relative">
        {isHovered && showLeftArrow && (
          <button
          className="absolute -ml-5 h-10 w-10 z-40 left-0 top-1/2 transform -translate-y-1/2 bg-gray-200 p-2 rounded-full"
          onClick={() => handleScroll('left')}
        >
          <IoIosArrowBack className='ml-1' />
        </button>
        )}
        <div
          className="flex overflow-x-auto gap-2 no-scrollbar"
          ref={scrollRef}
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }} // Hide scrollbar in Firefox and IE
        >
          {products.map((product) => (
            <WatchCard key={product._id} product={product} />
          ))}
        </div>
        {isHovered && showRightArrow && (
          <button
          className="absolute -mr-5 h-10 w-10 right-0 top-1/2 transform -translate-y-1/2 bg-gray-200 p-2 rounded-full"
          onClick={() => handleScroll('right')}
        >
          <IoIosArrowForward className='ml-1' />
        </button>
        )}
      </div>

      <style jsx>{`
        .no-scrollbar::-webkit-scrollbar {
          display: none; /* Hide scrollbar in webkit browsers */
        }
        .no-scrollbar {
          -ms-overflow-style: none;  /* IE and Edge */
          scrollbar-width: none;  /* Firefox */
        }
      `}</style>
    </section>
  );
};

export default Laptopunder;
