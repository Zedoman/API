const path = require("path");
const express = require("express");
const colors = require("colors");
const cors = require("cors");
const dotenv = require("dotenv").config();
const Razorpay = require('razorpay');
const crypto = require('crypto');
const { errorHandler } = require("./middlewares/errorMiddleware");
// const cartRoutes = require('./routes/cartRoutes');
const { uploadProduct, fetchProductById, fetchProductsByType, fetchAllProducts } = require('./controllers/productController');
// const addressRoutes = require('./routes/addressRoutes');
const { connectDB } = require("./config/db");
const nodemailer = require('nodemailer');
const Fuse = require('fuse.js');
const session = require('express-session');
const PORT = process.env.PORT || 3000;
const passport = require('passport');
require('./services/googleAuth');

// Connect to Mongo database
connectDB();

const app = express();

app.use(cors());

app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: true,
}));

// Middleware to parse JSON and URL-encoded data
//app.use(bodyParser.json({ limit: '50mb' })); 
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: false }));

// Error handling middleware
app.use(errorHandler);
app.use(passport.initialize());
app.use(passport.session());
// invoice
app.post('/send-invoice', async (req, res) => {
  try {
    console.log('Received request at /send-invoice');
    const { email, pdfBuffer } = req.body;

    console.log('Sending email to:', email);
    if (!email) {
      console.error('Email is missing');
      return res.status(400).json({ error: 'Email is required' });
    }
    if (!pdfBuffer) {
      console.error('PDF buffer is missing');
      return res.status(400).json({ error: 'PDF buffer is required' });
    }

    const transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
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
      subject: 'Your Invoice',
      text: 'Please find attached your invoice.',
      attachments: [
        {
          filename: 'invoice.pdf',
          content: Buffer.from(pdfBuffer, 'base64'),
          contentType: 'application/pdf',
        },
      ],
    };

    // console.log('Mail options prepared:', mailOptions);

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error('Error sending email:', error);
        return res.status(500).json({ error: error.toString() });
      }
      // console.log('Email sent successfully:', info.response);
      res.status(200).json({ message: 'Email sent: ' + info.response });
    });
  } catch (err) {
    console.error('An unexpected error occurred:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});
// invoice end




// Routes
app.post("/payment", async (req, res) => {
  try {
    const razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });
    const options = req.body;
    const payment = await razorpay.orders.create(options);

    if (!payment) {
      return res.status(500).send("Error creating payment");
    }

    res.json(payment);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

app.post("/payment/validate", async (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
  const sha = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET);
  sha.update(`${razorpay_order_id}|${razorpay_payment_id}`);
  const digest = sha.digest("hex");
  if (digest !== razorpay_signature) {
    return res.status(400).json({ message: "Transaction not legit!" });
  }
  res.json({
    msg: "success",
    orderId: razorpay_order_id,
    paymentId: razorpay_payment_id
  });
});

app.use("/api/users", require("./routes/userRoutes"));


// Product routes
app.post('/api/product/upload', uploadProduct);
app.get('/api/product/:id', fetchProductById);
app.get('/api/product/type/:type', fetchProductsByType);
app.get('/api/product', fetchAllProducts);


app.listen(PORT, () => console.log(`Server started on port ${PORT}`));