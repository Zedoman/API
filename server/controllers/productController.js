const Product = require('../models/Product');
const Fuse = require('fuse.js');

// Function to upload a product
const uploadProduct = async (req, res) => {
  try {
    const newProduct = new Product(req.body);
    const savedProduct = await newProduct.save();
    res.json(savedProduct);
  } catch (error) {
    res.status(500).send({ message: 'Server error' });
  }
};

// Function to fetch a product by ID
const fetchProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).send({ message: 'Product not found' });
    }
    res.json(product);
  } catch (error) {
    res.status(500).send({ message: 'Server error' });
  }
};

// Function to fetch products by type
const fetchProductsByType = async (req, res) => {
  try {
    const productType = req.params.type;
    const products = await Product.find({ product_type: productType });
    if (products.length === 0) {
      return res.status(404).send({ message: 'No products found for this type' });
    }
    res.json(products);
  } catch (error) {
    res.status(500).send({ message: 'Server error' });
  }
};

// Function to fetch all products
const fetchAllProducts = async (req, res) => {
  try {
    const products = await Product.find();
    if (products.length === 0) {
      return res.status(404).send({ message: 'No products found' });
    }
    res.json(products);
  } catch (error) {
    res.status(500).send({ message: 'Server error' });
  }
};

// Function to delete a product by ID
const deleteProductById = async (req, res) => {
  try {
    const deletedProduct = await Product.findByIdAndDelete(req.params.id);
    if (!deletedProduct) {
      return res.status(404).send({ message: 'Product not found' });
    }
    res.json({ message: 'Product deleted successfully', deletedProduct });
  } catch (error) {
    res.status(500).send({ message: 'Server error' });
  }
};

const updateStock = async (req, res) => {
  try {
    const updates = req.body; // Assume the request body is an array of updates
    if (!Array.isArray(updates)) {
      return res.status(400).json({ message: 'Invalid request format' });
    }

    const results = [];

    for (const { productId, color, storage, quantity } of updates) {
      const product = await Product.findById(productId);
      if (!product) {
        results.push({ productId, status: 'Product not found' });
        continue; // Skip to the next update
      }

      // Handle empty storage case
      const combination = product.Combination['1comb'].find((comb) =>
        comb.colourcode.includes(color) && (storage ? comb.storagecode === storage : true)
      );

      if (!combination) {
        results.push({ productId, status: 'Combination not found' });
        continue;
      }

      const stockEntry = combination.stock.colStorStock.find(
        (entry) => entry.color === color && (storage ? entry.storage === storage : true)
      );

      if (!stockEntry) {
        results.push({ productId, status: 'Stock entry not found' });
        continue;
      }

      if (stockEntry.stock < quantity) {
        results.push({ productId, status: 'Insufficient stock' });
        continue;
      }

      stockEntry.stock -= quantity;
      await product.save();
      results.push({ productId, status: 'Stock updated successfully' });
    }

    res.status(200).json(results);
  } catch (error) {
    console.error("Error updating stock:", error);
    res.status(500).json({ message: 'Server error', error });
  }
};





// Function to filter products
// const filterProducts = async (req, res) => {
//   try {
//     const { product_type, product_name, company_name, min_price, max_price, storage, color } = req.query;

//     let filter = {};

//     // Trim and clean the search terms
//     const cleanedProductName = product_name ? product_name.trim().replace(/\s+/g, ' ') : '';
//     const cleanedCompanyName = company_name ? company_name.trim().replace(/\s+/g, ' ') : '';
//     const cleanedColor = color ? color.trim().replace(/\s+/g, ' ') : '';
//     const cleanedProductType = product_type ? product_type.trim().replace(/\s+/g, ' ') : '';
//     const cleanedStorage = storage ? storage.trim().replace(/\s+/g, ' ') : '';

//     // Use text search for product_name, company_name, and color
//     if (cleanedProductName || cleanedCompanyName || cleanedColor) {
//       filter.$text = { $search: `${cleanedProductName} ${cleanedCompanyName} ${cleanedColor}` };
//     }

//     // Filter by product type
//     if (cleanedProductType) filter.product_type = { $regex: cleanedProductType, $options: 'i' }; // Case-insensitive search

//     // Filter by price range
//     if (min_price || max_price) {
//       filter['Combination.1comb.price'] = {};
//       if (min_price) filter['Combination.1comb.price'].$gte = Number(min_price);
//       if (max_price) filter['Combination.1comb.price'].$lte = Number(max_price);
//     }

//     // Filter by storage
//     if (cleanedStorage) filter['Storage.stor.storage_value'] = { $regex: cleanedStorage, $options: 'i' }; // Case-insensitive search

//     const products = await Product.find(filter, {
//       score: { $meta: 'textScore' }  // Include text search score
//     }).sort({ score: { $meta: 'textScore' } });  // Sort by text search score

//     res.json(products);
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// };
 // Adjust the path to your Product model
 const updateProduct = async (req, res) => {
  try {
    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!updatedProduct) {
      return res.status(404).send({ message: 'Product not found' });
    }
    res.json(updatedProduct);
  } catch (error) {
    res.status(500).send({ message: 'Server error' });
  }
};


const filterProducts = async (req, res) => {
  try {
    const { product_type, product_name, company_name, min_price, max_price, storage, color, sort_by } = req.query;

    // Initial filter for non-fuzzy criteria
    let filter = {};

    // Trim and clean the search terms
    const cleanedProductType = product_type ? product_type.trim().replace(/\s+/g, ' ') : '';
    const cleanedStorage = storage ? storage.trim().replace(/\s+/g, ' ') : '';

    // Filter by product type
    if (cleanedProductType) {
      filter.product_type = { $regex: cleanedProductType, $options: 'i' }; // Case-insensitive search
    }

    // Filter by price range
    if (min_price || max_price) {
      filter['Combination.1comb.price'] = {};
      if (min_price) filter['Combination.1comb.price'].$gte = Number(min_price);
      if (max_price) filter['Combination.1comb.price'].$lte = Number(max_price);
    }

    // Filter by storage
    if (cleanedStorage) {
      filter['Storage.stor.storage_value'] = { $regex: cleanedStorage, $options: 'i' }; // Case-insensitive search
    }

    // Fetch the initial list of products
    let products = await Product.find(filter);

    // Prepare Fuse.js options for fuzzy search
    const options = {
      keys: [
        { name: 'product_name', weight: 0.5 },
        { name: 'company_name', weight: 0.3 },
        { name: 'Combination.1comb.colors.col.name', weight: 0.2 },
      ],
      threshold: 0.4, // Adjust threshold according to desired fuzzy matching level
      ignoreLocation: true, // Optional: Ignore the location of the match in the string
    };

    // Create Fuse instance
    const fuse = new Fuse(products, options);

    // Combine search terms for fuzzy matching
    const searchTerms = [];
    if (product_name) searchTerms.push(product_name);
    if (company_name) searchTerms.push(company_name);
    if (color) searchTerms.push(color);

    // Perform fuzzy search with combined terms
    let result = products;
    if (searchTerms.length > 0) {
      const fuseResult = fuse.search(searchTerms.join(' '));
      result = fuseResult.map(r => r.item);
    }

    // Handle sorting
    if (sort_by) {
      switch (sort_by) {
        case 'price_asc':
          result.sort((a, b) => a.Combination[0]['1comb'].price - b.Combination[0]['1comb'].price);
          break;
        case 'price_desc':
          result.sort((a, b) => b.Combination[0]['1comb'].price - a.Combination[0]['1comb'].price);
          break;
        // Add more sorting criteria as needed
        default:
          break;
      }
    }

    res.json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};



const getSuggestions = async (req, res) => {
  try {
    const { query } = req.query;

    if (!query) {
      return res.status(400).json({ message: 'Query parameter is required' });
    }

    // Clean the query input
    const cleanedQuery = query.trim().replace(/\s+/g, ' ');

    // Find matching products using regex for partial matching
    const suggestions = await Product.find({
      $or: [
        { product_name: { $regex: cleanedQuery, $options: 'i' } },
        { company_name: { $regex: cleanedQuery, $options: 'i' } },
        { 'colors.col.name': { $regex: cleanedQuery, $options: 'i' } },
        { product_type: { $regex: cleanedQuery, $options: 'i' } },
        { 'Storage.stor.storage_value': { $regex: cleanedQuery, $options: 'i' } }
      ]
    }).select('product_name company_name colors product_type Storage').limit(10); // Limit the number of suggestions returned

    res.json(suggestions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};



module.exports = {
  uploadProduct,
  fetchProductById,
  fetchProductsByType,
  fetchAllProducts,
  deleteProductById,
  getSuggestions,
  filterProducts,
  updateProduct,
  updateStock
};

