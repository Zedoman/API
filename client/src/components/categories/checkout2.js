import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import axios from "axios";

const BUYNOWCheckoutPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [totalAmount, setTotalAmount] = useState(0);
  const [shippingDetails, setShippingDetails] = useState({
    firstName: "",
    lastName: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
    femail: "",
    fcontactNumber: ""
  });
  const [shippingMethod, setShippingMethod] = useState("standard");
  const [paymentMethod, setPaymentMethod] = useState("");
  const [contactNumber, setContactNumber] = useState("");
  const [email, setEmail] = useState("");
  //const [amount, setAmount] = useState(totalAmount);
  const [loading, setLoading] = useState(false);
  const [isCODAvailable, setIsCODAvailable] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [error, setError] = useState(""); // State for alert message
  const currency = "INR";
  const receiptId = "dewdfw";
  const [buyNowItem, setBuyNowItem] = useState(null);
  const item = JSON.parse(localStorage.getItem('buyNowItem'));
  const amount = (item.discountedPrice + (item.discountedPrice * 0.1) + 5);
  //console.log(amount);

  const statesOfIndia = [
    "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh",
    "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand",
    "Karnataka", "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur",
    "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Punjab",
    "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana", "Tripura",
    "Uttar Pradesh", "Uttarakhand", "West Bengal"
  ];

  // Effect to disable place order button if any required fields are empty
  useEffect(() => {
    const isDisabled =
      //!contactNumber ||
      // !email ||
      !shippingDetails.firstName ||
      !shippingDetails.lastName ||
      !shippingDetails.address ||
      !shippingDetails.city ||
      !shippingDetails.state ||
      !shippingDetails.pincode ||
      !shippingDetails.femail ||
      !shippingDetails.fcontactNumber ||
      !paymentMethod;
    setLoading(isDisabled); // Disable button based on the condition
  }, [
    //contactNumber,
    //email,
    shippingDetails.firstName,
    shippingDetails.lastName,
    shippingDetails.address,
    shippingDetails.city,
    shippingDetails.state,
    shippingDetails.pincode,
    shippingDetails.femail,
    shippingDetails.fcontactNumber,
    paymentMethod,
  ]);

  useEffect(() => {
    //const item = JSON.parse(localStorage.getItem('buyNowItem'));
    if (item) {
      setBuyNowItem(item);
      setTotalAmount(item.discountedPrice);
    }
  }, []);

  if (!buyNowItem) {
    return <div>Loading...</div>;
  }

  

  const handleSubmit = async (event) => {
    event.preventDefault();
    // Fetch user details from localStorage or authentication context
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user) {
      console.log("User not logged in");
      navigate("/login");
      return;
    }

    // Validate user details
    if (!user.email && !user.contactNumber) {
      console.log("User details incomplete");
      navigate("/login");
      return;
    }

    const item = JSON.parse(localStorage.getItem('buyNowItem'));

    const orderDetails = {
      email: user.email,
      contactNumber: user.contactNumber,
      productId: buyNowItem.id,
      selectedColor: item.selectedColor,
      selectedStorage: item.selectedStorage,
      shippingDetails,
      shippingMethod,
      paymentMethod,
    };

    console.log(orderDetails);

    try {
      const apiUrl = process.env.REACT_APP_API_URL;
      const response = await axios.post(`${apiUrl}/api/users/buynow`, orderDetails);
      if (response.data.message === "Order placed successfully") {
        navigate("/"); // Redirect to home page or any success page
        // Check if buyNowItem is an array
        if (Array.isArray(item)) {
          // Update stock
          const updateStockResponse = await fetch(`${apiUrl}/api/product/purchase`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(
              item.map(i => ({
                productId: i.productId,
                color: i.color,
                storage: i.storage,
                quantity: i.quantity,
              }))
            ),
          });

          // Handle response from stock update
          const updateStockResult = await updateStockResponse.json();
          console.log("Stock update result:", updateStockResult);
        } else {
          console.log("Expected buyNowItem to be an array, but it is not.");
        }
        toast.success("Your order has been placed. You can pay on delivery.", {
          onClose: () => navigate("/order") // Navigate after the toast closes
        });
         
      }
    } catch (error) {
      console.error(error);
      alert("Failed to place order.");
    }
  };

  const paymentHandler = async (e) => {
    //amount = (buyNowItem.discountedPrice + (buyNowItem.discountedPrice * 0.1) + 5).toFixed(2)
    e.preventDefault();
    
    if (paymentMethod === "COD") {
      toast.success("Your order has been placed. You can pay on delivery.");
      alert("Your order has been placed. You can pay on delivery.");
      navigate("/"); // Redirect to home page
      return;
    }
    try {
      const apiUrl = process.env.REACT_APP_API_URL;
      const response = await fetch(`${apiUrl}/payment`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          amount: Math.round(amount * 100), // Convert amount to paise
          currency,
          receipt: receiptId,
        }),
      });

      // Log the response text
      const text = await response.text();
      console.log("Response text:", text);

      // Try to parse the response text as JSON
      let payment;
      try {
        payment = JSON.parse(text);
      } catch (e) {
        throw new Error("Failed to parse JSON response: " + text);
      }

      console.log(payment);

      var options = {
        key: "rzp_test_B6lwgsXquV9dla",
        amount: payment.amount,
        currency: payment.currency,
        name: "Avradeep Nayak",
        description: "Test Transaction",
        //image: "assets/black-logo-1.svg",
        order_id: payment.id,
        handler: async function (response) {
          const body = {
            ...response,
          };
          const validateRes = await fetch(
            `${apiUrl}/payment/validate`,
            {
              method: "POST",
              body: JSON.stringify(body),
              headers: {
                "Content-Type": "application/json",
              },
            }
          );

          // Log the validate response text
          const validateText = await validateRes.text();
          console.log("Validate response text:", validateText);

          let jsonRes;
          try {
            jsonRes = JSON.parse(validateText);
          } catch (e) {
            throw new Error("Failed to parse JSON response: " + validateText);
          }
          const user = JSON.parse(localStorage.getItem('user'));
          const item = JSON.parse(localStorage.getItem('buyNowItem'));

          console.log("Success" + jsonRes.msg);
          if (jsonRes.msg === "success") {
            await axios.post(`${apiUrl}/api/users/buynow`, {
              email: user.email,
              contactNumber: user.contactNumber,
              productId: buyNowItem.id,
              selectedColor: item.selectedColor,
              selectedStorage: item.selectedStorage,
              shippingDetails,
              shippingMethod,
              paymentMethod,
              Payment_status: 'completed' // Mark as completed
            });

            navigate("/"); // Redirect to home page or any success page
            toast.success("Payment Successfull, Order placed successfully.", {
              onClose: () => navigate("/order") // Navigate after the toast closes
            });
          } else {
            toast.error("Payment verification failed. Please try again.");
          }
          if (Array.isArray(item)) {
            // Update stock
            const updateStockResponse = await fetch(`${apiUrl}/api/product/purchase`, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify(
                item.map(i => ({
                  productId: i.productId,
                  color: i.color,
                  storage: i.storage,
                  quantity: i.quantity,
                }))
              ),
            });
  
            // Handle response from stock update
            const updateStockResult = await updateStockResponse.json();
            console.log("Stock update result:", updateStockResult);
          } else {
            console.log("Expected buyNowItem to be an array, but it is not.");
          }
        },
        prefill: {
          name: `${shippingDetails.firstName} ${shippingDetails.lastName}`,
          email,
          contact: contactNumber,
        },
        notes: {
          address: shippingDetails.address,
        },
        theme: {
          color: "#3399cc",
        },
        method: {
          upi: true,
          card: true,
          netbanking: true,
        },
        // redirect: true,
        // callback_url: 'https://www.youtube.com/',
      };
      var rzp1 = new window.Razorpay(options);
      rzp1.on("payment.failed", function (response) {
        alert(response.error.code);
        alert(response.error.description);
        alert(response.error.source);
        alert(response.error.step);
        alert(response.error.reason);
        alert(response.error.metadata.order_id);
        alert(response.error.metadata.payment_id);
      });
      rzp1.open();
    } catch (error) {
      console.error(error);
      alert("Failed to initiate payment.");
    }
  };



  const handleChange = (e) => {
    const { name, value } = e.target;
    setShippingDetails({ ...shippingDetails, [name]: value });
    if (name === "state") {
      setIsCODAvailable(true);
    } else if (name === "state") {
      setIsCODAvailable(false);
    }
  };


  return (
    <div className="flex flex-col font-urbanist lg:flex-row justify-start items-start min-h-screen px-4 md:px-8 lg:px-32">
      <form
        className="p-8 w-full lg:w-2/3 max-w-3xl lg:max-w-none"
        onSubmit={handleSubmit}
      >
        <div className="mb-4">
          <h2 className="text-xl font-semibold mb-4">Contact</h2>
          {alertMessage && (
            <div className="mb-4 p-4 border rounded-md bg-green-100 text-green-700">
              {alertMessage}
            </div>
          )}
          <div className="flex flex-col md:flex-row gap-5">
            <div className="md:w-1/2">
              <div className="flex justify-between">
                <label className="block text-gray-700">
                  Mobile Number<span className="text-black">*</span>
                </label>
              </div>
              <input
              type="tel"
              className="w-full px-4 py-2 border rounded-xl"
              name="fcontactNumber"
              value={shippingDetails.fcontactNumber}
              onChange={handleChange}
              placeholder="Enter Mobile Number"
              required
            />
            </div>

          </div>


          <div className="mb-4">
            <label className="block text-gray-700">
              Email Address<span className="text-black">*</span>
            </label>
            <input
              type="email"
              placeholder="Enter Email"
              className="w-full px-4 py-2 border rounded-xl"
              name="femail"
              value={shippingDetails.femail}
              onChange={handleChange}
              required
            />
          </div>
        </div>

        <div className="mb-6">
          <h2 className="text-2xl mt-6 font-semibold mb-4">Shipping Details</h2>
          <div className="flex gap-4 mb-4">
            <div className="w-1/2">
              <label className="block text-gray-700">
                First Name<span className="text-black">*</span>
              </label>
              <input
                type="text"
                className="w-full px-4 py-2 border rounded-xl"
                placeholder="Enter First Name"
                name="firstName"
                value={shippingDetails.firstName}
                onChange={handleChange}
                required
              />
            </div>
            <div className="w-1/2">
              <label className="block text-gray-700">
                Last Name<span className="text-black">*</span>
              </label>
              <input
                type="text"
                placeholder="Enter Last Name"
                className="w-full px-4 py-2 border rounded-xl"
                name="lastName"
                value={shippingDetails.lastName}
                onChange={handleChange}
                required
              />
            </div>
          </div>
          <div className="mb-4">
            <label className="block text-gray-700">
              Address<span className="text-black">*</span>
            </label>
            <input
              type="text"
              placeholder="Enter Full Address"
              className="w-full px-4 py-2 border rounded-xl"
              name="address"
              value={shippingDetails.address}
              onChange={handleChange}
              required
            />
          </div>
          <div className="flex flex-col w-full md:flex-row gap-4 mb-4">
            <div className="md:w-1/3">
              <label className="block text-gray-700">
                City<span className="text-black">*</span>
              </label>
              <input
                type="text"
                placeholder="Enter City"
                className="w-full px-4 py-2 border rounded-xl"
                name="city"
                value={shippingDetails.city}
                onChange={handleChange}
                required
              />
            </div>
            <div className="md:w-1/3">
              <label className="block text-gray-700">
                State<span className="text-black">*</span>
              </label>
              <select
                type="text"
                placeholder="Enter State"
                className="w-full px-4 py-2 border rounded-xl"
                name="state"
                value={shippingDetails.state}
                onChange={handleChange}
                required
              >
                <option value="">Select State</option>
              {statesOfIndia.map((state) => (
                <option key={state} value={state}>
                  {state}
                </option>
              ))}
              </select>
            </div>
            <div className="md:w-1/3">
              <label className="block text-gray-700">
                Pincode<span className="text-black">*</span>
              </label>
              <input
                type="text"
                placeholder="Enter Pincode"
                className="w-full px-4 py-2 border rounded-xl"
                name="pincode"
                value={shippingDetails.pincode}
                onChange={handleChange}
                required
              />
            </div>
          </div>
        </div>

        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-4">Shipping Method</h2>
          <div
            className={`mb-4 p-4 border rounded-xl border-black cursor-pointer ${shippingMethod === "standard"
                ? "bg-gray-200"
                : "hover:bg-gray-100"
              }`}
            onClick={() => setShippingMethod("standard")}
          >
            <label className="text-gray-700">Standard Shipping</label>
            <p>3 - 4 days</p>
          </div>
        </div>

        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-4">Payment Method</h2>
          <div
            className={`mb-4 p-4 border rounded-md cursor-pointer ${paymentMethod === "Razorpay" ? "bg-gray-200" : "hover:bg-gray-100"
              }`}
            onClick={() => setPaymentMethod("Razorpay")}
          >
            <div className="flex justify-between">
              <label className="text-gray-700">Razorpay Secure (UPI, Cards, Wallets, NetBanking)</label>
              <img src="assets/razorpay 1.svg" alt="" />
            </div>

          </div>
          {isCODAvailable && (
          <div
            className={`mb-4 p-4 border rounded-md cursor-pointer ${paymentMethod === "COD" ? "bg-gray-200" : "hover:bg-gray-100"
              }`}
            onClick={() => setPaymentMethod("COD")}
          >
            <label className="text-gray-700">Cash on Delivery (COD)</label>
          </div>
        )}
        </div>

        <div className="mb-8">
          <h2 className="text-xl font-semibold">Review & Place Order</h2>
          <p>Review the order details above, and place your order when you’re ready.</p>
        </div>

        <div>
          {paymentMethod === "Razorpay" && (
            <button type="submit"
              className={`w-full bg-[#0D47A1] text-white px-4 py-2 rounded-full ${loading ? "opacity-50 cursor-not-allowed" : ""
                }`}
              onClick={paymentHandler}>
              Place Order and Pay
            </button>
          )}
          {paymentMethod === "COD" && (
            <button
              className={`w-full bg-[#0D47A1] text-white px-4 py-2 rounded-full ${loading ? "opacity-50 cursor-not-allowed" : ""
                }`}
              disabled={loading}>
              Place Order and Pay
            </button>
          )}
        </div>
      </form>

      <div className="w-full lg:w-1/3 mt-8">
        <div className="bg-white p-8 border border-gray-700 rounded-2xl lg:ml-6 mt-8 lg:mt-12">
          <div className="mb-4 text-center flex justify-between">
            <h2 className="text-xl font-semibold">Order Summary</h2>
          </div>
          <div className="flex mb-4" key={buyNowItem.id}>
            <img
              src={buyNowItem.image}
              alt={buyNowItem.name}
              className="w-20 h-20 object-cover mr-4"
            />
            <div>
              <p className="text-gray-800 text-xl">{buyNowItem.name}</p>
              <p className="text-gray-700">
                ₹{(buyNowItem.price)}
              </p>
            </div>
          </div>
          <div className="mb-4">
            <p className="text-gray-700 flex justify-between">
              <span>Item Subtotal:</span>
              <span>
                ₹{buyNowItem.price.toFixed(2)}
              </span>
            </p>
            <p className="text-gray-700 flex justify-between">
              <span>Discounted Price: </span>
              <span>₹{buyNowItem.price.toFixed(2) - buyNowItem.discountedPrice.toFixed(2)}</span>
            </p>
            <p className="text-gray-700 flex justify-between">
              <span>Delivery:</span>
              <span>₹{5.00}</span>
            </p>
            <p className="text-gray-700 flex justify-between">
              <span>Tax:</span>
              <span>
                ₹{(buyNowItem.discountedPrice.toFixed(2) * 0.1).toFixed(2)}
              </span>
            </p>
            <p className="text-gray-700 flex justify-between font-semibold">
              <span>Subtotal:</span>
              <span>₹{(buyNowItem.discountedPrice + (buyNowItem.discountedPrice * 0.1) + 5).toFixed(2)}</span>

            </p>
          </div>
        </div>
        <div className='flex gap-12 text-center text-sm md:text-md lg:ml-8 mt-5'>
          <div className=""><img className=' m-auto' src="assets\30daysexchange.svg" alt="" /><p className=''>30 Days Exchnage</p></div>
          <div className='w-1/3'><img className=' m-auto' src="assets\12dayswarranty.svg" alt="" /><p className=''>12 Months Warranty</p></div>
          <div className='w-1/3'><img className=' m-auto' src="assets\security.svg" alt="" /><p className=''>Secure and Safe Payments</p></div>
        </div>
      </div>
    </div>
  );
};

export default BUYNOWCheckoutPage;

