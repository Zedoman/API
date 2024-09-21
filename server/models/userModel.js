const mongoose = require('mongoose');


const buyNowOrderSchema = mongoose.Schema({
  firstName: String,
  lastName: String,
  email: String,
  contactNumber: String,
  shippingDetails: {
    firstName: {
      type: String,
      required: true,
    },
    lastName: String,
    address: String,
    city: String,
    state: String,
    pincode: String,
  },
  shippingMethod: String,
  paymentMethod: {
    type: String,
    enum: ['COD', 'Razorpay'],
    required: true,
  },
  amount: Number,
  Payment_status: {
    type: String,
    default: 'pending',
    enum: ['pending', 'completed', 'failed'],
  },
  Delivery_status: {
    type: String,
    default: 'On Transit',
    enum: ['Delivered', 'On Transit', 'Cancelled'],
  },
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  price: {
    type: Number,
    required: true
  },
  discounted_price: {
    type: Number,
    required: true
  },
  name: {
    type: String,
    required: true
  },
  image: {
    type: String
  },
  colorCode: {
    type: String
  },
  storageCode: {
    type: String
  },
  colorName: {
    type: String
  },
  storageName: {
    type: String
  }
}, {
  timestamps: true, // Automatically manage createdAt and updatedAt
});

// Define the User Schema
const userSchema = mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String
  },
  googleId: {
    type: String,
  },
  buyNowOrders: [buyNowOrderSchema], // Add this field for Buy Now orders

}, {
  timestamps: true,
});

// Hashing Passwords before saving User
// userSchema.pre('save', async function (next) {
//   if (!this.isModified('password')) {
//     return next();
//   }
//   const salt = await bcrypt.genSalt(10);
//   this.password = await bcrypt.hash(this.password, salt);
//   next();
// });

// Export User model
const User = mongoose.model('User', userSchema);

module.exports = User;