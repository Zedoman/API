require('dotenv').config(); 
const asyncHandler = require('express-async-handler');
const bcrypt = require('bcryptjs');
const nodemailer = require('nodemailer');
const User = require('../models/userModel');
const redisClient = require('../utils/redisClient'); // Adjust the path if needed
const jwt = require('jsonwebtoken');
const Product = require('../models/Product');
const { generateToken } = require("../utils/generateJwt");



// Registers a new user '/api/users'
const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  // Basic validation
  if (!name || !email || !password) {
    return res.status(400).json({ message: "All fields are required" });
  }

  try {
    // Check if the user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create new user
    const newUser = new User({
      name,
      email,
      password: hashedPassword,
    });

    await newUser.save();

    // Generate JWT token
    const token = jwt.sign({ userId: newUser._id }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    return res
      .status(201)
      .json({ message: "User created successfully", token });
  } catch (error) {
    //console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

// Login an user '/api/users/login'
const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(400).json({ message: "Invalid credentials" });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    // Include user details in the response
    res.status(200).json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email
      }
    });
  } catch (error) {
    res.status(500).json({ message: "Error logging in", error });
  }
});



// Logout a user '/api/users/logout'
const logoutUser = asyncHandler(async (req, res) => {
  try {
    // If you're using cookies to store JWT, clear the cookie on logout
    res.clearCookie('token');  // Assuming the token is stored as a cookie
    res.status(200).json({ message: "User logged out successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error logging out", error });
  }
});

const resetPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    // Generate reset token
    const resetToken = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "15m",  // Token expires in 15 minutes
    });

    // Create reset URL (change this to your frontend reset password page)
    const resetUrl = `http://localhost:3000/reset-password?token=${resetToken}`;

    // Send email with reset link
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 465,
      secure: true,
      auth: {
        user: process.env.EMAIL_ADDRESS,
        pass: process.env.EMAIL_PASSWORD,
      },
    });

    const mailOptions = {
      from: process.env.EMAIL_ADDRESS,
      to: email,
      subject: "Password Reset",
      html: `<p>To reset your password, click the link below:</p>
             <a href="${resetUrl}">${resetUrl}</a>
             <p>This link will expire in 15 minutes.</p>`
    };

    await transporter.sendMail(mailOptions);

    res.status(200).json({ message: "Reset link sent to email" });
  } catch (error) {
    res.status(500).json({ message: "Error sending reset link", error });
  }
});

const confirmResetPassword = asyncHandler(async (req, res) => {
  const { token, newPassword } = req.body;

  try {
    // Verify the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Find the user by ID
    const user = await User.findById(decoded.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    // Hash the new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // Update the user's password
    user.password = hashedPassword;
    await user.save();

    // Set up email transporter
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 465,
      secure: true,
      auth: {
        user: process.env.EMAIL_ADDRESS,
        pass: process.env.EMAIL_PASSWORD,
      },
    });

    // Email content
    const mailOptions = {
      from: process.env.EMAIL_ADDRESS,
      to: user.email,
      subject: "Password Reset Successful",
      text: "Your password has been successfully reset. If you did not request this change, please contact support immediately.",
    };

    // Send confirmation email
    await transporter.sendMail(mailOptions);

    res.status(200).json({ message: "Password has been reset successfully and confirmation email sent" });
  } catch (error) {
    res.status(400).json({ message: "Invalid or expired reset token" });
  }
});

// Gets current user (private) '/api/users/me'
const getCurrentUser = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!id) {
    res.status(400);
    throw new Error('User ID is required');
  }

  const cachedUser = await redisClient.get(`user:${id}`);

  if (cachedUser) {
    return res.status(200).json(JSON.parse(cachedUser));
  } else {
    const user = await User.findById(id);

    if (user) {
      // Cache the user data
      await redisClient.setEx(`user:${user._id}`, 3600, JSON.stringify(user));
      res.status(200).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        contactNumber: user.contactNumber,
        orders: user.orders,
        cart: user.cart,
      });
    } else {
      res.status(404);
      throw new Error('User not found');
    }
  }
});




//buynow
const buyNow = asyncHandler(async (req, res) => {
  const { email, contactNumber, productId, selectedColor, Payment_status, selectedStorage, shippingDetails, shippingMethod, paymentMethod } = req.body;

  if (!productId) {
    res.status(400);
    throw new Error('Product ID required');
  }

  let user;
  if (email) {
    user = await User.findOne({ email });
  } else if (contactNumber) {
    user = await User.findOne({ contactNumber });
  } else {
    res.status(400);
    throw new Error('Please provide either email or contact number');
  }

  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  const product = await Product.findById(productId);
  if (!product) {
    res.status(404);
    throw new Error('Product not found');
  }

  let selectedCombination;
  if (selectedStorage) {
    selectedCombination = product.Combination["1comb"].find(
      (comb) => comb.colourcode.includes(selectedColor) && comb.storagecode === selectedStorage
    );
  } else {
    selectedCombination = product.Combination["1comb"].find(
      (comb) => comb.colourcode.includes(selectedColor)
    );
  }

  if (!selectedCombination) {
    res.status(404).json({ error: 'Combination not found' });
    return; // Ensure to return to avoid further execution
  }

  const { attrs2comb } = selectedCombination;
  const itemPrice = selectedCombination.price;
  const itemDiscountedPrice = selectedCombination.discounted_price;
  const name = product.product_name;
  const firstImage = attrs2comb?.imgs?.[0]?.img_url?.[0] || '';
  const color = product.colors.col.find(c => c.code === selectedColor);
  const colorName = color ? color.name : '';
  const storage = product.Storage.stor.find(c=> c.code === selectedStorage);
  const storageName = storage ? storage.storage_value:'';

  const buyNowOrder = {
    firstName: user.firstName,
    lastName: user.lastName,
    email: shippingDetails.femail,  // Use email from request body
    contactNumber: shippingDetails.fcontactNumber, 
    shippingDetails,
    shippingMethod,
    paymentMethod,
    amount: itemDiscountedPrice,
    Payment_status: Payment_status || 'pending',
    Delivery_status: 'On Transit',
    product: productId,
    price: itemPrice,
    discounted_price: itemDiscountedPrice,
    name,
    image: firstImage,
    colorCode: selectedColor,
    storageCode: selectedStorage,
    colorName,
    storageName
  };

  user.buyNowOrders.push(buyNowOrder);

  await user.save();

  res.status(200).json({ message: 'Order placed successfully', order: buyNowOrder });
});

const getOrders2 = async (req, res) => {
  try {
    const { email, contactNumber } = req.query;
    let user;
    if (email) {
      user = await User.findOne({ email });
    } else if (contactNumber) {
      user = await User.findOne({ contactNumber });
    } else {
      return res.status(400).json({ message: 'Please provide either email or contact number' });
    }

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const orders = user.buyNowOrders;
    console.log('Fetched Buy Now Orders:', orders);  // Add logging
    res.status(200).json({ orders });
  } catch (error) {
    console.error('Error fetching Buy Now orders:', error);  // Add logging
    res.status(500).json({ message: 'Server error' });
  }
};

const getOrderById2 = asyncHandler(async (req, res) => {
  const { orderId } = req.params;

  console.log('Fetching order with ID:', orderId);

  // Find the user with the order containing the given orderId
  const user = await User.findOne({ 'buyNowOrders._id': orderId }, { 'buyNowOrders.$': 1 });

  if (!user) {
    console.error("Order not found with ID:", orderId);
    res.status(404);
    throw new Error('Order not found');
  }

  const order = user.buyNowOrders[0];

  // Construct order response
  const orderResponse = {
    _id: order._id,
    firstName: order.firstName,
    lastName: order.lastName,
    email: order.email,
    contactNumber: order.contactNumber,
    shippingDetails: order.shippingDetails,
    shippingMethod: order.shippingMethod,
    paymentMethod: order.paymentMethod,
    amount: order.amount,
    Payment_status: order.Payment_status,
    Delivery_status: order.Delivery_status,
    createdAt: order.createdAt,
    product: order.product,
    price: order.price,
    discounted_price: order.discounted_price,
    name: order.name,
    image: order.image,
    colorCode: order.colorCode,
    storageCode: order.storageCode,
    colorName: order.colorName,
    storageName: order.storageName

  };

  console.log('Order fetched successfully:', orderResponse);

  res.status(200).json(orderResponse);
});


const getAllOrders2 = asyncHandler(async (req, res) => {
  const users = await User.find({}).select('buyNowOrders'); // Fetch only orders field

  const allOrders = users.reduce((acc, user) => {
    if (user.buyNowOrders && user.buyNowOrders.length > 0) {
      return [...acc, ...user.buyNowOrders];
    }
    return acc;
  }, []);

  if (allOrders.length === 0) {
    res.status(404);
    throw new Error('No orders found');
  }

  res.status(200).json({ buyNowOrders: allOrders });
});



module.exports = {
  registerUser,
  loginUser,
  getCurrentUser,
  logoutUser,
  buyNow,
  getAllOrders2,
  getOrderById2,
  confirmResetPassword,
  resetPassword,
  getOrders2
};
