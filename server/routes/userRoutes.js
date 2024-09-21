const express = require("express");
const {
  registerUser,
  loginUser,
  getCurrentUser,resetPassword, confirmResetPassword,
  logoutUser, buyNow, getOrders2,
  getAllOrders2,
  getOrderById2,
} = require("../controllers/userController");
const jwt = require('jsonwebtoken');
const recaptchaMiddleware = require('../middlewares/recaptchaMiddleware');
const passport = require('passport');


const { protect } = require("../middlewares/authMiddleware");

const router = express.Router();

// User routes
router.post("/", recaptchaMiddleware,registerUser);
router.post("/login", loginUser);
router.get("/me/:id", protect, getCurrentUser);
router.post('/logout', logoutUser);
router.post('/reset-password', resetPassword);
router.post('/reset-password-confirm', confirmResetPassword);

// Route to initiate Google login
router.get(
  '/google',
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

// Route to handle the callback from Google
router.get(
  '/google/callback',
  passport.authenticate('google', { failureRedirect: '/login' }),
  (req, res) => {
    // Successful authentication
    const token = jwt.sign({ id: req.user._id }, process.env.JWT_SECRET, {
      expiresIn: '1h',
    });

    // Redirect to frontend with token or respond with token
    res.status(200).json({
      token,
      user: {
        id: req.user._id,
        name: req.user.name,
        email: req.user.email,
      },
    });
  }
);

// Success or failure routes for Google OAuth
router.get('/google/success', (req, res) => {
  res.status(200).json({ message: 'Logged in successfully via Google', user: req.user });
});

router.get('/google/failure', (req, res) => {
  res.status(401).json({ message: 'Google login failed' });
});


router.post('/buynow', buyNow);
router.get('/getbuy', getOrders2);
router.get('/getbuyallorder', getAllOrders2);
router.get('/order2/:orderId', getOrderById2);

module.exports = router;
