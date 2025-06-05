import userModel from "../models/userModel.js";

// Helper function to clean empty cart data
const cleanCartData = (cartData) => {
  const cleanedCart = { ...cartData };
  
  // Remove items with empty sizes or zero quantities
  for (const itemId in cleanedCart) {
    // Remove sizes with zero or negative quantities
    for (const size in cleanedCart[itemId]) {
      if (cleanedCart[itemId][size] <= 0) {
        delete cleanedCart[itemId][size];
      }
    }
    // Remove items with no sizes
    if (Object.keys(cleanedCart[itemId]).length === 0) {
      delete cleanedCart[itemId];
    }
  }
  
  return cleanedCart;
};

// Add product to user cart
const addToCart = async (req, res) => {
  try {
    const userId = req.userId;
    const { itemId, size } = req.body;

    if (!itemId || !size) {
      return res.status(400).json({
        success: false,
        message: "Product ID and size are required"
      });
    }

    const userData = await userModel.findById(userId);
    if (!userData) {
      return res.status(404).json({ 
        success: false, 
        message: "User not found" 
      });
    }

    let cartData = userData.cartData || {};

    if (cartData[itemId]) {
      if (cartData[itemId][size]) {
        cartData[itemId][size] += 1;
      } else {
        cartData[itemId][size] = 1;
      }
    } else {
      cartData[itemId] = {};
      cartData[itemId][size] = 1;
    }

    // Clean cart data before saving
    cartData = cleanCartData(cartData);

    await userModel.findByIdAndUpdate(userId, { cartData });
    res.json({ 
      success: true, 
      message: "Product added to cart successfully",
      cartData 
    });

  } catch (error) {
    console.error('Add to cart error:', error);
    res.status(500).json({ 
      success: false, 
      message: "Failed to add product to cart" 
    });
  }
};

// Update product quantity in user cart
const updateCart = async (req, res) => {
  try {
    const userId = req.userId;
    const { itemId, size, quantity } = req.body;

    if (!itemId || !size || quantity === undefined) {
      return res.status(400).json({
        success: false,
        message: "Product ID, size, and quantity are required"
      });
    }

    const userData = await userModel.findById(userId);
    if (!userData) {
      return res.status(404).json({ 
        success: false, 
        message: "User not found" 
      });
    }

    let cartData = userData.cartData || {};

    // Update quantity
    if (!cartData[itemId]) {
      cartData[itemId] = {};
    }
    
    if (quantity <= 0) {
      // Remove the size entry if quantity is 0 or negative
      delete cartData[itemId][size];
      // Remove the item entry if no sizes left
      if (Object.keys(cartData[itemId]).length === 0) {
        delete cartData[itemId];
      }
    } else {
      cartData[itemId][size] = quantity;
    }

    // Clean cart data before saving
    cartData = cleanCartData(cartData);

    await userModel.findByIdAndUpdate(userId, { cartData });
    res.json({ 
      success: true, 
      message: "Cart updated successfully",
      cartData 
    });
  } catch (error) {
    console.error('Update cart error:', error);
    res.status(500).json({ 
      success: false, 
      message: "Failed to update cart" 
    });
  }
};

// Get user cart data
const getCart = async (req, res) => {
  try {
    const userId = req.userId;
    const userData = await userModel.findById(userId);

    if (!userData) {
      return res.status(404).json({ 
        success: false, 
        message: "User not found" 
      });
    }

    // Clean cart data before sending
    const cartData = cleanCartData(userData.cartData || {});
    
    // Update the cleaned cart data in the database
    if (JSON.stringify(cartData) !== JSON.stringify(userData.cartData)) {
      await userModel.findByIdAndUpdate(userId, { cartData });
    }

    res.json({ 
      success: true, 
      cartData 
    });
  } catch (error) {
    console.error('Get cart error:', error);
    res.status(500).json({ 
      success: false, 
      message: "Failed to fetch cart data" 
    });
  }
};

export { addToCart, updateCart, getCart };
