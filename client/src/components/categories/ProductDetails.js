import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { FaRegHeart, FaHeart } from "react-icons/fa";
import {
  MdOutlineKeyboardArrowUp,
  MdOutlineKeyboardArrowDown,
  MdOutlineKeyboardArrowLeft,
  MdOutlineKeyboardArrowRight,
} from "react-icons/md";
import Modal from "react-modal";
import Profile from "../auth/Profile";
import Laptopunder from "./NewReleases";
import { RingLoader } from "react-spinners";
import Navbar from "../common/Navbar";

const ProductDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [showAllFeatures, setShowAllFeatures] = useState(false);
  const [selectedStorage, setSelectedStorage] = useState(null);
  const [images, setImages] = useState([]);
  const [selectedCombination, setSelectedCombination] = useState(null);
  const [isSignupModalOpen, setIsSignupModalOpen] = useState(false);
  const [selectedColor, setSelectedColor] = useState(null);
  const [selectedColorName, setSelectedColorName] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [startIndex, setStartIndex] = useState(0);
  const thumbnailsPerPage = 3;
  const apiUrl = process.env.REACT_APP_API_URL;


  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await axios.get(`${apiUrl}/api/product/${id}`);
        const productData = response.data;
        setProduct(productData);
        const initialColor = productData.colors.col[0]?.code;
        setSelectedColor(initialColor);
        if (productData.Storage.stor.length > 0) {
          const initialStorage = productData.Storage.stor[0]?.code;
          setSelectedStorage(initialStorage);
        }
      } catch (error) {
        console.error("Error fetching product data:", error);
      }
    };

    fetchProduct();
  }, [id]);

  useEffect(() => {
    // Scroll to top when the product ID changes
    window.scrollTo(0, 0);
  }, [id]);

  useEffect(() => {
    if (product && selectedColor) {
      let combination;
      if (product.Storage.stor.length > 0) {
        combination = product.Combination["1comb"].find(
          (comb) =>
            comb.colourcode.includes(selectedColor) &&
            comb.storagecode === selectedStorage
        );
      } else {
        combination = product.Combination["1comb"].find((comb) =>
          comb.colourcode.includes(selectedColor)
        );
      }
      setSelectedCombination(combination);
      const imgs =
        combination?.attrs2comb?.imgs.find((img) => img.color === selectedColor)
          ?.img_url || [];
      setImages(imgs.map((image) => ({ original: image, thumbnail: image })));
    }
  }, [product, selectedColor, selectedStorage]);

  

  const handleBuyNow = async () => {
    try {
      const user = JSON.parse(localStorage.getItem("user"));
      if (!user || (!user.email && !user.contactNumber)) {
        console.log("User not logged in");
        setIsSignupModalOpen(true);
        return;
      }

      const item = {
        id: product._id,
        name: product.product_name,
        image: images[0]?.original,
        price: selectedCombination.price,
        discountedPrice: selectedCombination.discounted_price,
        quantity: 1,
        selectedColor: selectedColor,
        selectedStorage: selectedStorage,
      };

      localStorage.setItem("buyNowItem", JSON.stringify(item));

      navigate("/checkout2", {
        state: {
          //totalAmount: selectedCombination.discounted_price,
          //cartItems: [item]
        },
      });
    } catch (error) {
      console.error("Error buying now:", error);
    }
  };

 

  const toggleFeatures = () => {
    setShowAllFeatures(!showAllFeatures);
  };

  const displayedFeatures = showAllFeatures
    ? product?.keyFeatures
    : product?.keyFeatures.slice(0, 4);
    
    useEffect(() => {
      if (product?.colors?.col?.length > 0) {
        setSelectedColor(product.colors.col[0].code);
        setSelectedColorName(product.colors.col[0].name);
      }
    }, [product]);

    const handleColorClick = (colorCode, colorName) => {
      setSelectedColor(colorCode);
      setSelectedColorName(colorName);
    };

  const handleStorageClick = (storageCode) => {
    setSelectedStorage(storageCode);
  };

  const handlePrevClick = () => {
    setStartIndex((prevIndex) =>
      prevIndex === 0 ? images.length - thumbnailsPerPage : prevIndex - 1
    );
  };

  const handleNextClick = () => {
    setStartIndex((prevIndex) =>
      prevIndex === images.length - thumbnailsPerPage ? 0 : prevIndex + 1
    );
  };

  const handleThumbnailClick = (index) => {
    setCurrentIndex(index);
  };

  const visibleThumbnails = images.slice(startIndex, startIndex + thumbnailsPerPage);

  if (!product) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-gray-100 z-50">
        <RingLoader color="#82558a" size={60} />
      </div>
    );
  }

  return (
    <>
    <div className="relative font-urbanist min-h-screen md:p-6 md:mt-7 pb-20">
      <div className="bg-white p-6 flex flex-col lg:flex-row">
        <div className="w-full lg:w-1/2 relative z-0">
          <div className="sticky top-1 bottom-2 flex flex-col md:flex-row">
            {/* thumbnail section starts */}
            <div className="hidden md:flex flex-col ml-10 items-center justify-center">
      <button className="px-2 mb-2" onClick={handlePrevClick}>
        <span className="">
          <MdOutlineKeyboardArrowUp />
        </span>
      </button>
      <div className="flex flex-row md:flex-col items-center overflow-y-auto">
        {visibleThumbnails.map((item, index) => (
          <div
            key={startIndex + index}
            className="p-2 w-28 h-28"
            onClick={() => handleThumbnailClick(startIndex + index)}
          >
            <img
              src={item.thumbnail}
              alt={`Thumbnail ${startIndex + index + 1}`}
              className={`object-contain p-2 h-full w-full rounded ${
                currentIndex === startIndex + index ? "border border-slate-600" : ""
              }`}
            />
          </div>
        ))}
      </div>
      <button className="px-2 mt-2" onClick={handleNextClick}>
        <span className="">
          <MdOutlineKeyboardArrowDown />
        </span>
      </button>
    </div>

            {/* main image section */}
            <div className="w-full h-96 flex items-center justify-center">
              <img
                src={images[currentIndex]?.original}
                alt="Main"
                className="p-2 mb-5 object-contain h-[24rem]"
              />
            </div>

            {/* mobile thumbnail section */}
            <div className="flex flex-row mb-4 md:hidden items-center justify-center">
        <button className="px-2 items-center" onClick={handlePrevClick}>
          <span>
            <MdOutlineKeyboardArrowLeft />
          </span>
        </button>
        <div className="flex flex-row items-center overflow-x-auto">
          {visibleThumbnails.map((item, index) => (
            <div
              key={startIndex + index}
              className="p-2 w-28 h-28"
              onClick={() => handleThumbnailClick(startIndex + index)}
            >
              <img
                src={item.thumbnail}
                alt={`Thumbnail ${startIndex + index + 1}`}
                className={`object-contain p-2 h-full w-full rounded ${
                  currentIndex === startIndex + index ? "border border-slate-600" : ""
                }`}
              />
            </div>
          ))}
        </div>
        <button className="px-2 items-center" onClick={handleNextClick}>
          <span>
            <MdOutlineKeyboardArrowRight />
          </span>
        </button>
      </div>
          </div>
        </div>

        <div className="w-full lg:w-1/2 flex flex-col justify-between lg:pl-8">
          <div>
            <div className="flex flex-col md:flex-row md:justify-between">
              <h1 className="text-2xl md:w-3/5 md:text-3xl mb-2 text-black">
                {product?.product_name}
              </h1>
            </div>
            <div className="text-gray-600 text-sm mb-1 flex flex-col">
              <div className="flex items-center">
                <p className="text-black text-2xl font-semibold">
                  ₹{selectedCombination?.discounted_price}
                </p>
                <p className="line-through text-sm ml-2 text-gray-500">
                  ₹{selectedCombination?.price}
                </p>
              </div>
            </div>

            <div className="mb-3 mt-3">
        <h2 className="font-semibold text-base mb-2 colorName">
        Color: {selectedColorName}
        </h2>
        <div className="flex flex-wrap place-items-center gap-2">
          {product?.colors?.col.map((color) => (
            <div className="w-[35px] h-[35px] rounded-full shadow-inner bg-black" key={color.code}>
              <div
                className={`w-8 h-8 m-auto mt-[2px] rounded-full shadow-inner-lg border-2 cursor-pointer ${
                  selectedColor === color.code ? "border-white" : "border-transparent"
                }`}
                style={{ backgroundColor: color.code }}
                onClick={() => handleColorClick(color.code, color.name)}
              ></div>
            </div>
          ))}
        </div>
      </div>

            {product?.Storage?.stor.length > 0 && (
              <div className="mb-3 mt-3">
                <h2 className="font-semibold text-base mb-2">Storage:</h2>
                <div className="flex flex-wrap gap-2">
                  {product.Storage.stor.map((storage) => (
                    <button
                      key={storage.code}
                      className={`px-4 py-2 border rounded-full cursor-pointer ${
                        selectedStorage === storage.code
                          ? "border-black bg-[#EEEEEE]"
                          : "border-gray-400"
                      }`}
                      onClick={() => handleStorageClick(storage.code)}
                    >
                      {storage.storage_value}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="mb-4 mt-4 border rounded-md p-4">
              <h2 className="font-semibold text-base mb-2">Key Features:</h2>
              <ul className="list-disc ml-4">
                {displayedFeatures.map((feature, index) => (
                  <li key={index}>{feature}</li>
                ))}
              </ul>
              {product?.keyFeatures.length > 4 && (
                <button
                  className="text-blue-600 mt-2 text-sm"
                  onClick={toggleFeatures}
                >
                  {showAllFeatures ? "Show Less" : "Show More"}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* bottom Add to cart */}
      <div className="bg-white sticky top-2 z-40 bottom-1 shadow-md p-3 flex flex-col md:flex-row justify-between md:items-center">
        <div className="flex items-left md:items-center mb-4 md:mb-2 gap-3 md:w-3/5">
          <img
            src={images[0]?.original}
            alt="product"
            className="w-16 h-16 object-contain md:ml-12 md:mr-4"
          />
          <div className="md:w-2/3">
            <p className="font-semibold line-clamp-1">{product.product_name}</p>
            {selectedCombination && (
              <p className="text-lg font-medium">
                ₹{selectedCombination.discounted_price}{" "}
                <span className="text-gray-500 font-thin text-sm line-through">
                  ₹{selectedCombination.price}
                </span>
              </p>
            )}
          </div>
        </div>
        <div className="flex gap-2 flex-col lg:flex-row  md:mr-5">
          
          <button
            className="bg-blue-700 text-white py-2 px-12 md:px-20  rounded-full"
            onClick={handleBuyNow}
          >
            {" "}
            Buy Now{" "}
          </button>
        </div>
      </div>

      
      <div className="mt-5">
        <Laptopunder />
      </div>
      <Modal
        isOpen={isSignupModalOpen}
        onRequestClose={() => setIsSignupModalOpen(false)}
        contentLabel="Signup Modal"
        className="modal"
        overlayClassName="overlay"
      >
        <Profile
          onClose={() => setIsSignupModalOpen(false)}
          onSignup={() => setIsSignupModalOpen(false)}
        />
      </Modal>
    </div>
    </>
  );
};

export default ProductDetails;
