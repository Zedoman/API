const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  product_type: { type: String, required: true },
  company_name: { type: String },
  product_name: { type: String, required: true },
  keyFeatures: { type: [String], required: true },
  Combination: {
    '1comb': [
      {
        colourcode: { type: [String], required: true },
        storagecode: { type: String },
        price: { type: Number, required: true },
        discounted_price: { type: Number, required: true },
        attrs1comb: {
          imgs: { type: [String], required: true }
        },
        attrs2comb: {
          imgs: [
            {
              color: { type: String, required: true },
              img_url: { type: [String], required: true }
            }
          ]
        },
        stock: {
          colStorStock: [
            {
              color: { type: String, required: true },
              storage: { type: String },
              stock: { type: Number, required: true }
            }
          ]
        }
      }
    ]
  },
  Storage: {
    stor: [
      {
        storage_value: { type: String },
        code: { type: String }
      }
    ]
  },
  colors: {
    col: [
      {
        name: { type: String, required: true },
        code: { type: String, required: true }
      }
    ]
  },
});

productSchema.index({
  product_name: 'text',
  product_type: 'text',
  keyFeatures: 'text',
  company_name: 'text',
  'Combination.1comb.colourcode': 'text',
  'Combination.1comb.storagecode': 'text'
});

productSchema.index({ product_name: 'text', company_name: 'text', 'colors.col.name': 'text' });

const Product = mongoose.model('Product', productSchema);

module.exports = Product;
